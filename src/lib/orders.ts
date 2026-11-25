import "server-only";
import { db } from "./db";
import { AppError, Errors } from "./errors";
import { newId, newOrderNumber, newToken } from "./ids";
import { discountFor, GIFT_WRAP_FEE, shippingFor } from "./pricing";
import { hashPassword } from "./auth/password";
import { startPayment, type PaymentAction } from "./payments";
import type { CheckoutInput } from "./validation";
import type { SessionClaims } from "./auth/jwt";
import type { Order, OrderItem, OrderStatus, PaymentStatus } from "./types";

const ONLINE_PAYMENT_WINDOW_MS = 30 * 60 * 1000; // 30 min to finish card / Koko / Mintpay
const BANK_TRANSFER_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 h to upload a transfer slip

import { STATUS_FLOW, STATUS_LABEL } from "./orderLabels";
export { STATUS_FLOW, STATUS_LABEL };

// ------------------------------------------------------------------ helpers
async function releaseStock(order: Order, reason: string, by: string): Promise<Order> {
  if (order.stockReleased) return order;
  return db.withLock("stock", async () => {
    const fresh = await db.orders.getById(order.id);
    if (!fresh || fresh.stockReleased) return fresh ?? order;
    for (const it of fresh.items) {
      const p = await db.products.getById(it.productId);
      if (!p) continue;
      const updated = await db.products.update(p.id, { stock: p.stock + it.qty });
      await db.inventory.log({ id: newId("inv"), productId: p.id, delta: it.qty, reason: `${reason} (${fresh.number})`, by, at: new Date().toISOString(), stockAfter: updated.stock });
    }
    return db.orders.update(fresh.id, { stockReleased: true });
  });
}

/** Cancels unpaid orders whose payment window has passed and returns their stock. */
export async function sweepExpiredOrders() {
  const now = Date.now();
  const candidates = [
    ...(await db.orders.list({ status: "pending_payment" })),
    ...(await db.orders.list({ status: "awaiting_verification" })),
  ].filter((o) => o.expiresAt && Date.parse(o.expiresAt) < now && o.paymentStatus !== "awaiting_verification");
  for (const o of candidates) {
    try {
      await transitionOrder(o.id, "cancelled", { note: "Payment not received in time – auto-cancelled", by: "system" });
    } catch (e) {
      console.error("sweep failed for", o.number, e);
    }
  }
}

// ------------------------------------------------------------------ create
export interface CreateOrderResult {
  order: Order;
  payment: PaymentAction;
  accountCreated: boolean;
}

export async function createOrder(input: CheckoutInput, session: SessionClaims | null): Promise<CreateOrderResult> {
  await sweepExpiredOrders();

  // 1. Idempotency: a double-click / retry returns the SAME order, never a duplicate charge.
  const existing = await db.orders.getByIdempotencyKey(input.idempotencyKey);
  if (existing) {
    if (existing.email !== input.email) throw new AppError("This checkout session is no longer valid. Please try again.", 409, "IDEMPOTENCY_MISMATCH");
    if (existing.status === "cancelled") throw new AppError("That attempt didn't go through. Please place the order again.", 409, "IDEMPOTENCY_STALE");
    const payment = existing.paymentStatus === "unpaid" && existing.status === "pending_payment" ? await startPayment(existing) : { type: "redirect" as const, url: `/order/${existing.number}?t=${existing.accessToken}` };
    return { order: existing, payment, accountCreated: false };
  }

  // 2. Optional account creation – check BEFORE reserving stock
  let customerId = session?.role === "customer" ? session.sub : undefined;
  if (!customerId && input.createAccount) {
    if (await db.customers.getByEmail(input.email)) {
      throw new AppError("You already have an account with this email – sign in, or untick 'create account'.", 409, "ACCOUNT_EXISTS");
    }
  }

  // 3. Merge duplicate lines
  const qtyById = new Map<string, number>();
  for (const it of input.items) qtyById.set(it.productId, (qtyById.get(it.productId) ?? 0) + it.qty);

  const coupon = input.couponCode ? await db.coupons.get(input.couponCode) : null;
  if (input.couponCode && (!coupon || !coupon.active)) throw new AppError("That promo code isn't valid.", 422, "BAD_COUPON");

  // 4. Reserve stock + write order atomically
  const order = await db.withLock("stock", async () => {
    const products = await db.products.getMany([...qtyById.keys()]);
    const problems: { productId: string; name?: string; available: number }[] = [];
    for (const [id, qty] of qtyById) {
      const p = products.find((x) => x.id === id);
      if (!p || !p.active) problems.push({ productId: id, available: 0 });
      else if (p.stock < qty) problems.push({ productId: id, name: p.name, available: p.stock });
    }
    if (problems.length) throw Errors.outOfStock(problems);

    const items: OrderItem[] = products.map((p) => {
      const qty = qtyById.get(p.id)!;
      return { productId: p.id, name: p.name, sku: p.sku, unitPrice: p.price, qty, lineTotal: p.price * qty, art: p.art, image: p.images[0] };
    });
    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    if (coupon && subtotal < coupon.minSubtotal) {
      throw new AppError(`${coupon.code} needs a minimum spend of Rs ${coupon.minSubtotal.toLocaleString()}.`, 422, "BAD_COUPON");
    }
    const discount = discountFor(coupon, subtotal);
    const shippingFee = shippingFor(input.shipping.district, subtotal - discount);
    const giftWrapFee = input.giftWrap ? GIFT_WRAP_FEE : 0;
    const total = subtotal - discount + shippingFee + giftWrapFee;
    if (!Number.isFinite(total) || total <= 0) throw new AppError("Could not calculate the order total.", 422, "BAD_TOTAL");
    if ((input.paymentMethod === "koko" || input.paymentMethod === "mintpay") && total > 200000)
      throw new AppError("Instalment plans are available for orders up to Rs 200,000.", 422, "BNPL_LIMIT");
    if (input.paymentMethod === "cod" && total > 50000)
      throw new AppError("Cash on delivery is available for orders up to Rs 50,000.", 422, "COD_LIMIT");

    const now = new Date();
    const online = ["card", "koko", "mintpay"].includes(input.paymentMethod);
    const status: OrderStatus = input.paymentMethod === "cod" ? "confirmed" : input.paymentMethod === "bank" ? "awaiting_verification" : "pending_payment";
    const paymentStatus: PaymentStatus = input.paymentMethod === "cod" ? "unpaid" : "pending";

    // Decrement stock (we are inside the lock, so this cannot oversell)
    const decremented: { id: string; qty: number }[] = [];
    try {
      for (const it of items) {
        const p = products.find((x) => x.id === it.productId)!;
        const updated = await db.products.update(p.id, { stock: p.stock - it.qty });
        decremented.push({ id: p.id, qty: it.qty });
        await db.inventory.log({ id: newId("inv"), productId: p.id, delta: -it.qty, reason: "Order reserved", by: "checkout", at: now.toISOString(), stockAfter: updated.stock });
      }
      const o: Order = {
        id: newId("ord"),
        number: newOrderNumber(),
        accessToken: newToken(),
        customerId,
        email: input.email,
        phone: input.shipping.phone,
        shipping: { ...input.shipping, line2: input.shipping.line2 || undefined, postalCode: input.shipping.postalCode || undefined },
        items,
        subtotal,
        discount,
        shippingFee,
        giftWrapFee,
        total,
        couponCode: coupon?.code,
        giftWrap: input.giftWrap,
        giftNote: input.giftNote || undefined,
        customerNote: input.customerNote || undefined,
        paymentMethod: input.paymentMethod,
        paymentStatus,
        status,
        history: [{ status, at: now.toISOString(), note: "Order placed" }],
        stockReleased: false,
        idempotencyKey: input.idempotencyKey,
        expiresAt: online ? new Date(now.getTime() + ONLINE_PAYMENT_WINDOW_MS).toISOString() : input.paymentMethod === "bank" ? new Date(now.getTime() + BANK_TRANSFER_WINDOW_MS).toISOString() : undefined,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      return await db.orders.create(o);
    } catch (err) {
      // Roll back any stock we already took
      for (const d of decremented) {
        try {
          const p = await db.products.getById(d.id);
          if (p) await db.products.update(d.id, { stock: p.stock + d.qty });
        } catch (rollbackErr) {
          console.error("CRITICAL: stock rollback failed", d, rollbackErr);
        }
      }
      throw err;
    }
  });

  // 5. Create the account (non-fatal if it fails – the order is already safe)
  let accountCreated = false;
  if (!customerId && input.createAccount) {
    try {
      const c = await db.customers.create({
        id: newId("cus"),
        email: input.email,
        name: input.createAccount.name,
        phone: input.shipping.phone,
        passwordHash: await hashPassword(input.createAccount.password),
        addresses: [order.shipping],
        createdAt: new Date().toISOString(),
      });
      await db.orders.update(order.id, { customerId: c.id });
      order.customerId = c.id;
      accountCreated = true;
    } catch (e) {
      console.warn("Account creation during checkout failed", e);
    }
  }

  // 6. Start payment. If the provider fails, cancel + restock so nothing is left dangling.
  try {
    const payment = await startPayment(order);
    return { order, payment, accountCreated };
  } catch (err) {
    await transitionOrder(order.id, "cancelled", { note: "Payment provider unavailable", by: "system" }).catch((e) =>
      console.error("Failed to cancel order after payment init error", order.number, e),
    );
    throw err;
  }
}

// ------------------------------------------------------------------ status changes
export async function transitionOrder(
  orderId: string,
  to: OrderStatus,
  opts: { note?: string; by: string; courier?: string; trackingNumber?: string },
): Promise<Order> {
  return db.withLock(`order:${orderId}`, async () => {
    const order = await db.orders.getById(orderId);
    if (!order) throw Errors.notFound("Order");
    if (order.status === to) return order;
    if (!STATUS_FLOW[order.status].includes(to)) {
      throw new AppError(`Can't move an order from "${STATUS_LABEL[order.status]}" to "${STATUS_LABEL[to]}".`, 409, "BAD_TRANSITION");
    }
    if (to === "shipped" && !(opts.trackingNumber || order.trackingNumber)) {
      throw new AppError("Add a courier tracking number before marking as shipped.", 422, "TRACKING_REQUIRED");
    }
    const patch: Partial<Order> = {
      status: to,
      history: [...order.history, { status: to, at: new Date().toISOString(), note: opts.note, by: opts.by }],
      courier: opts.courier || order.courier,
      trackingNumber: opts.trackingNumber || order.trackingNumber,
    };
    if (to === "confirmed" && order.paymentMethod !== "cod") {
      patch.paymentStatus = "paid";
      patch.expiresAt = undefined;
    }
    if (to === "delivered" && order.paymentMethod === "cod") patch.paymentStatus = "paid";
    if (to === "cancelled") patch.paymentStatus = order.paymentStatus === "paid" ? "refunded" : "failed";
    if (to === "refunded") patch.paymentStatus = "refunded";

    let updated = await db.orders.update(order.id, patch);
    if (to === "cancelled" || to === "refunded") updated = await releaseStock(updated, to === "cancelled" ? "Order cancelled" : "Order refunded", opts.by);
    return updated;
  });
}

/** Called by payment webhooks / mock gateway. Idempotent and amount-checked. */
export async function applyPaymentResult(orderNumber: string, result: { status: "paid" | "failed" | "pending"; amount: number; ref: string }) {
  const order = await db.orders.getByNumber(orderNumber);
  if (!order) throw Errors.notFound("Order");
  if (result.status === "pending") return order;
  if (result.status === "paid") {
    if (order.paymentStatus === "paid") return order; // duplicate notification
    if (Math.abs(result.amount - order.total) > 0.01) {
      console.error("Payment amount mismatch", orderNumber, result.amount, order.total);
      await db.orders.update(order.id, { customerNote: `${order.customerNote ?? ""}\n[!] Amount mismatch: paid ${result.amount}`.trim() });
      throw new AppError("Payment amount mismatch", 400, "AMOUNT_MISMATCH");
    }
    if (order.status === "cancelled") {
      // Paid after auto-cancel: flag for manual refund rather than silently losing money
      await db.orders.update(order.id, { paymentStatus: "paid", paymentRef: result.ref, history: [...order.history, { status: "cancelled", at: new Date().toISOString(), note: "Payment received after cancellation – refund required", by: "system" }] });
      return order;
    }
    await db.orders.update(order.id, { paymentRef: result.ref });
    return transitionOrder(order.id, "confirmed", { note: `Payment received (${order.paymentMethod})`, by: "payment-gateway" });
  }
  // failed
  if (order.status === "pending_payment") {
    return transitionOrder(order.id, "cancelled", { note: "Payment declined or cancelled", by: "payment-gateway" });
  }
  return order;
}

// ------------------------------------------------------------------ public view
export type PublicOrder = Omit<Order, "accessToken" | "idempotencyKey" | "bankSlip" | "customerId" | "stockReleased"> & { hasSlip: boolean };

export function toPublicOrder(o: Order): PublicOrder {
  const { accessToken: _a, idempotencyKey: _i, bankSlip, customerId: _c, stockReleased: _s, ...rest } = o;
  void _a; void _i; void _c; void _s;
  return { ...rest, hasSlip: !!bankSlip };
}
