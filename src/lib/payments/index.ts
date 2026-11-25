import "server-only";
import { createHash } from "crypto";
import type { Order, PaymentMethod } from "../types";
import { AppError } from "../errors";

export const PAYMENT_MODE = (process.env.PAYMENT_MODE || "mock") as "mock" | "live";
const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** What the browser should do after the order is created */
export type PaymentAction =
  | { type: "redirect"; url: string }
  | { type: "form_post"; action: string; fields: Record<string, string> }
  | { type: "none" };

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  card: "Card (Visa / Master / Amex)",
  koko: "Koko – 3 interest-free payments",
  mintpay: "Mintpay – 3 interest-free payments",
  bank: "Bank transfer",
  cod: "Cash on delivery",
};

const md5 = (s: string) => createHash("md5").update(s).digest("hex").toUpperCase();

// ---------------------------------------------------------------- PayHere
function payhereConfigured() {
  return !!(process.env.PAYHERE_MERCHANT_ID && process.env.PAYHERE_MERCHANT_SECRET);
}

function payhereCheckout(order: Order): PaymentAction {
  const merchantId = process.env.PAYHERE_MERCHANT_ID!;
  const secret = process.env.PAYHERE_MERCHANT_SECRET!;
  const amount = order.total.toFixed(2);
  const hash = md5(merchantId + order.number + amount + "LKR" + md5(secret));
  const [first, ...rest] = order.shipping.fullName.split(" ");
  const sandbox = process.env.PAYHERE_SANDBOX !== "false";
  return {
    type: "form_post",
    action: sandbox ? "https://sandbox.payhere.lk/pay/checkout" : "https://www.payhere.lk/pay/checkout",
    fields: {
      merchant_id: merchantId,
      return_url: `${siteUrl()}/order/${order.number}?t=${order.accessToken}`,
      cancel_url: `${siteUrl()}/order/${order.number}?t=${order.accessToken}&cancelled=1`,
      notify_url: `${siteUrl()}/api/payments/payhere/notify`,
      order_id: order.number,
      items: `She Things order ${order.number}`,
      currency: "LKR",
      amount,
      first_name: first || "Customer",
      last_name: rest.join(" ") || "-",
      email: order.email,
      phone: order.phone,
      address: order.shipping.line1,
      city: order.shipping.city,
      country: "Sri Lanka",
      hash,
    },
  };
}

/** Verify PayHere server-to-server notification. Returns the new payment state or null if invalid. */
export function verifyPayhereNotify(form: Record<string, string>): { orderNumber: string; amount: number; status: "paid" | "failed" | "pending"; ref: string } | null {
  const secret = process.env.PAYHERE_MERCHANT_SECRET;
  if (!secret) return null;
  const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig, payment_id } = form;
  if (!merchant_id || !order_id || !payhere_amount || !status_code || !md5sig) return null;
  if (merchant_id !== process.env.PAYHERE_MERCHANT_ID || payhere_currency !== "LKR") return null;
  const expected = md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5(secret));
  if (expected !== md5sig.toUpperCase()) return null;
  const code = Number(status_code);
  return {
    orderNumber: order_id,
    amount: Number(payhere_amount),
    status: code === 2 ? "paid" : code === 0 ? "pending" : "failed",
    ref: payment_id || "",
  };
}

// ---------------------------------------------------------------- Koko & Mintpay
// Both providers issue merchant-specific API docs + keys on onboarding.
// Plug the "create payment" call in here; the rest of the order flow is already wired.
async function kokoCheckout(order: Order): Promise<PaymentAction> {
  if (!process.env.KOKO_MERCHANT_ID || !process.env.KOKO_API_KEY) {
    throw new AppError("Koko payments are not available right now. Please choose another method.", 503, "PROVIDER_UNAVAILABLE");
  }
  // TODO(live): call Koko's create-order endpoint with signed payload and return its redirect URL.
  void order;
  throw new AppError("Koko live integration not yet enabled. Please choose another method.", 503, "PROVIDER_UNAVAILABLE");
}

async function mintpayCheckout(order: Order): Promise<PaymentAction> {
  if (!process.env.MINTPAY_MERCHANT_ID || !process.env.MINTPAY_SECRET) {
    throw new AppError("Mintpay is not available right now. Please choose another method.", 503, "PROVIDER_UNAVAILABLE");
  }
  // TODO(live): call Mintpay's purchase endpoint and return its redirect URL.
  void order;
  throw new AppError("Mintpay live integration not yet enabled. Please choose another method.", 503, "PROVIDER_UNAVAILABLE");
}

// ---------------------------------------------------------------- Entry point
export async function startPayment(order: Order): Promise<PaymentAction> {
  const confirmUrl = `/order/${order.number}?t=${order.accessToken}`;
  if (order.paymentMethod === "bank" || order.paymentMethod === "cod") return { type: "redirect", url: confirmUrl };

  if (PAYMENT_MODE === "mock") {
    return { type: "redirect", url: `/checkout/pay/${order.number}?t=${order.accessToken}` };
  }
  switch (order.paymentMethod) {
    case "card":
      if (!payhereConfigured()) throw new AppError("Card payments are temporarily unavailable. Try bank transfer or cash on delivery.", 503, "PROVIDER_UNAVAILABLE");
      return payhereCheckout(order);
    case "koko":
      return kokoCheckout(order);
    case "mintpay":
      return mintpayCheckout(order);
  }
}

export function bankDetails() {
  return {
    bank: process.env.BANK_NAME || "Commercial Bank",
    accountName: process.env.BANK_ACCOUNT_NAME || "She Things (Pvt) Ltd",
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || "8000 1234 5678",
    branch: process.env.BANK_BRANCH || "Colombo 07",
  };
}
