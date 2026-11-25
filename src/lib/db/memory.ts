import type { Repository } from "./repository";
import type {
  AdminUser, Coupon, Customer, InventoryLog, Order, OrderStatus, PaymentMethod, Product, Review, StockAlert,
} from "../types";
import { buildSeedProducts, seedCoupons, seedReviews } from "../data/seed";
import { hashPassword } from "../auth/password";
import { newId, newOrderNumber, newToken } from "../ids";
import { AppError } from "../errors";

interface Tables {
  products: Map<string, Product>;
  reviews: Review[];
  customers: Map<string, Customer>;
  admins: Map<string, AdminUser>;
  orders: Map<string, Order>;
  coupons: Map<string, Coupon>;
  inventory: InventoryLog[];
  stockAlerts: StockAlert[];
}

const clone = <T>(v: T): T => structuredClone(v);

async function seed(): Promise<Tables> {
  const products = new Map(buildSeedProducts().map((p) => [p.id, p]));
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@shethings.lk").toLowerCase();
  const envPassword = process.env.ADMIN_PASSWORD;
  if (process.env.VERCEL_ENV === "production" && (!envPassword || envPassword === "SheThings@2026" || envPassword.length < 12)) {
    // The dev password is public in the repo; never let it guard a live admin.
    throw new Error("Set a strong ADMIN_PASSWORD (12+ chars, not the dev default) for production.");
  }
  const adminPassword = envPassword || "SheThings@2026";
  const admins = new Map<string, AdminUser>([
    [adminEmail, { id: "adm_owner", email: adminEmail, name: "She Things Owner", role: "owner", passwordHash: await hashPassword(adminPassword) }],
  ]);
  const demoCustomer: Customer = {
    id: "cus_demo",
    email: "demo@shethings.lk",
    name: "Demo Shopper",
    phone: "+94771234567",
    passwordHash: await hashPassword("Demo1234"),
    addresses: [{ fullName: "Demo Shopper", phone: "+94771234567", line1: "12 Flower Road", city: "Colombo 07", district: "Colombo", postalCode: "00700" }],
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
  };
  const customers = new Map([[demoCustomer.id, demoCustomer]]);
  const orders = new Map(demoOrders(products, demoCustomer).map((o) => [o.id, o]));
  return {
    products,
    reviews: seedReviews.map((r) => ({ ...r, id: newId("rev") })),
    customers,
    admins,
    orders,
    coupons: new Map(seedCoupons.map((c) => [c.code, c])),
    inventory: [],
    stockAlerts: [],
  };
}

/** A week of fake orders so the admin dashboard has something to show */
function demoOrders(products: Map<string, Product>, demo: Customer): Order[] {
  const list = [...products.values()];
  const names = ["Kavindi Perera", "Hiruni Silva", "Sanduni Fernando", "Ishara Jayasinghe", "Nethmi Wickrama", "Dulani Bandara", "Ama Rathnayake", "Shenali de Mel", "Tharushi Gunawardena", "Pabasara Herath", "Yasara Dias"];
  const districts = ["Colombo", "Gampaha", "Kandy", "Galle", "Kurunegala", "Colombo", "Matara", "Colombo", "Kalutara", "Negombo", "Colombo"];
  const flow: [OrderStatus, PaymentMethod][] = [
    ["delivered", "card"], ["delivered", "koko"], ["shipped", "mintpay"], ["shipped", "card"], ["processing", "bank"],
    ["confirmed", "cod"], ["awaiting_verification", "bank"], ["confirmed", "card"], ["delivered", "cod"], ["cancelled", "card"], ["processing", "koko"],
  ];
  const progression: OrderStatus[] = ["confirmed", "processing", "shipped", "delivered"];
  return flow.map(([status, pm], i) => {
    const created = new Date(Date.now() - (6 - (i % 7)) * 86400000 - i * 3600000);
    const picks = [list[(i * 3) % list.length], list[(i * 5 + 1) % list.length]].slice(0, (i % 2) + 1);
    const items = picks.map((p) => ({ productId: p.id, name: p.name, sku: p.sku, unitPrice: p.price, qty: 1, lineTotal: p.price, art: p.art, image: p.images[0] }));
    const subtotal = items.reduce((s, it) => s + it.lineTotal, 0);
    const shippingFee = subtotal >= 10000 ? 0 : 350;
    const isDemo = i === 0 || i === 2;
    const history = [{ status: (pm === "bank" ? "awaiting_verification" : "confirmed") as OrderStatus, at: created.toISOString(), note: "Order placed" }];
    const target = progression.indexOf(status);
    for (let s = 1; s <= target; s++) history.push({ status: progression[s], at: new Date(created.getTime() + s * 20 * 3600000).toISOString(), note: "" });
    if (status === "cancelled") history.push({ status: "cancelled", at: new Date(created.getTime() + 3600000).toISOString(), note: "Customer request" });
    const paid = !["awaiting_verification", "cancelled"].includes(status) && !(pm === "cod" && status !== "delivered");
    return {
      id: newId("ord"),
      number: newOrderNumber(),
      accessToken: newToken(),
      customerId: isDemo ? demo.id : undefined,
      email: isDemo ? demo.email : `${names[i].split(" ")[0].toLowerCase()}@example.com`,
      phone: "+9477" + (1000000 + i * 7919).toString().slice(0, 7),
      shipping: { fullName: isDemo ? demo.name : names[i], phone: "+94771234567", line1: `${10 + i} Temple Road`, city: districts[i], district: districts[i] === "Negombo" ? "Gampaha" : districts[i] },
      items,
      subtotal,
      discount: 0,
      shippingFee,
      giftWrapFee: 0,
      total: subtotal + shippingFee,
      giftWrap: i % 4 === 0,
      paymentMethod: pm,
      paymentStatus: status === "awaiting_verification" ? "awaiting_verification" : status === "cancelled" ? "refunded" : paid ? "paid" : "unpaid",
      bankSlip: status === "awaiting_verification" ? { dataUrl: SAMPLE_SLIP, uploadedAt: created.toISOString(), reference: "CB-883201" } : undefined,
      status,
      history,
      courier: ["shipped", "delivered"].includes(status) ? "Pronto Lanka" : undefined,
      trackingNumber: ["shipped", "delivered"].includes(status) ? `PL${700000 + i * 131}` : undefined,
      stockReleased: status === "cancelled",
      idempotencyKey: newToken(16),
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
    } satisfies Order;
  });
}

const SAMPLE_SLIP =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="100%" height="100%" fill="#fff"/><text x="20" y="40" font-family="monospace" font-size="16">BANK DEPOSIT SLIP</text><text x="20" y="80" font-family="monospace" font-size="13">Ref: CB-883201</text><text x="20" y="110" font-family="monospace" font-size="13">Amount: Rs 6,450.00</text><text x="20" y="140" font-family="monospace" font-size="13">To: She Things (Pvt) Ltd</text></svg>`,
  ).toString("base64");

// ---------- singleton that survives Next.js hot reloads ----------
const g = globalThis as unknown as { __stTables?: Promise<Tables>; __stLocks?: Map<string, Promise<unknown>> };

function tables(): Promise<Tables> {
  if (!g.__stTables) g.__stTables = seed();
  return g.__stTables;
}
const locks = (g.__stLocks ??= new Map());

export const memoryRepository: Repository = {
  products: {
    async list(opts) {
      const t = await tables();
      return [...t.products.values()].filter((p) => opts?.includeInactive || p.active).map(clone);
    },
    async getById(id) {
      const p = (await tables()).products.get(id);
      return p ? clone(p) : null;
    },
    async getBySlug(slug) {
      const p = [...(await tables()).products.values()].find((x) => x.slug === slug);
      return p ? clone(p) : null;
    },
    async getMany(ids) {
      const t = await tables();
      return ids.map((id) => t.products.get(id)).filter(Boolean).map((p) => clone(p!));
    },
    async create(p) {
      const t = await tables();
      if ([...t.products.values()].some((x) => x.slug === p.slug)) throw new AppError("A product with this slug already exists", 409, "DUPLICATE");
      t.products.set(p.id, clone(p));
      return clone(p);
    },
    async update(id, patch) {
      const t = await tables();
      const cur = t.products.get(id);
      if (!cur) throw new AppError("Product not found", 404, "NOT_FOUND");
      if (patch.slug && [...t.products.values()].some((x) => x.slug === patch.slug && x.id !== id))
        throw new AppError("A product with this slug already exists", 409, "DUPLICATE");
      const next = { ...cur, ...patch, id, updatedAt: new Date().toISOString() };
      t.products.set(id, next);
      return clone(next);
    },
    async remove(id) {
      (await tables()).products.delete(id);
    },
  },
  reviews: {
    async listFor(productId) {
      return (await tables()).reviews.filter((r) => r.productId === productId).map(clone);
    },
  },
  customers: {
    async getById(id) {
      const c = (await tables()).customers.get(id);
      return c ? clone(c) : null;
    },
    async getByEmail(email) {
      const c = [...(await tables()).customers.values()].find((x) => x.email === email.toLowerCase());
      return c ? clone(c) : null;
    },
    async create(c) {
      const t = await tables();
      if ([...t.customers.values()].some((x) => x.email === c.email)) throw new AppError("An account with this email already exists", 409, "DUPLICATE");
      t.customers.set(c.id, clone(c));
      return clone(c);
    },
    async update(id, patch) {
      const t = await tables();
      const cur = t.customers.get(id);
      if (!cur) throw new AppError("Customer not found", 404, "NOT_FOUND");
      const next = { ...cur, ...patch, id };
      t.customers.set(id, next);
      return clone(next);
    },
    async list() {
      return [...(await tables()).customers.values()].map(clone);
    },
  },
  admins: {
    async getByEmail(email) {
      const a = (await tables()).admins.get(email.toLowerCase());
      return a ? clone(a) : null;
    },
  },
  orders: {
    async create(o) {
      (await tables()).orders.set(o.id, clone(o));
      return clone(o);
    },
    async getById(id) {
      const o = (await tables()).orders.get(id);
      return o ? clone(o) : null;
    },
    async getByNumber(n) {
      const o = [...(await tables()).orders.values()].find((x) => x.number === n);
      return o ? clone(o) : null;
    },
    async getByIdempotencyKey(k) {
      const o = [...(await tables()).orders.values()].find((x) => x.idempotencyKey === k);
      return o ? clone(o) : null;
    },
    async update(id, patch) {
      const t = await tables();
      const cur = t.orders.get(id);
      if (!cur) throw new AppError("Order not found", 404, "NOT_FOUND");
      const next = { ...cur, ...patch, id, updatedAt: new Date().toISOString() };
      t.orders.set(id, next);
      return clone(next);
    },
    async list(opts) {
      return [...(await tables()).orders.values()]
        .filter((o) => !opts?.status || o.status === opts.status)
        .filter((o) => !opts?.customerId || o.customerId === opts.customerId)
        .filter((o) => !opts?.email || o.email === opts.email)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(clone);
    },
  },
  coupons: {
    async get(code) {
      const c = (await tables()).coupons.get(code.toUpperCase());
      return c ? clone(c) : null;
    },
    async list() {
      return [...(await tables()).coupons.values()].map(clone);
    },
  },
  inventory: {
    async log(entry) {
      const t = await tables();
      t.inventory.unshift(entry);
      if (t.inventory.length > 2000) t.inventory.length = 2000;
    },
    async list(productId) {
      return (await tables()).inventory.filter((l) => !productId || l.productId === productId).map(clone);
    },
  },
  stockAlerts: {
    async add(a) {
      const t = await tables();
      if (!t.stockAlerts.some((x) => x.productId === a.productId && x.email === a.email)) t.stockAlerts.push(a);
    },
    async list() {
      return (await tables()).stockAlerts.map(clone);
    },
  },
  async withLock(key, fn) {
    const prev = locks.get(key) ?? Promise.resolve();
    let release!: () => void;
    const mine = new Promise<void>((r) => (release = r));
    const chained = prev.then(() => mine);
    locks.set(key, chained);
    await prev.catch(() => undefined);
    try {
      return await fn();
    } finally {
      release();
      if (locks.get(key) === chained) locks.delete(key);
    }
  },
};
