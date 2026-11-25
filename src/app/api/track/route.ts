import { handle, ok, readJson } from "@/lib/http";
import { trackSchema } from "@/lib/validation";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { sweepExpiredOrders, toPublicOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

const normPhone = (s: string) => s.replace(/\D/g, "").slice(-9);

export const POST = handle(
  async (req) => {
    const { orderNumber, contact } = await readJson(req, trackSchema);
    await sweepExpiredOrders();
    const order = await db.orders.getByNumber(orderNumber);
    const c = contact.toLowerCase();
    const match =
      order && (order.email === c || (normPhone(c).length === 9 && normPhone(order.phone) === normPhone(c)));
    // Same response whether the order doesn't exist or the contact is wrong
    if (!order || !match) throw new AppError("We couldn't find an order with those details. Double-check the number and the email/phone you used.", 404, "NOT_FOUND");
    const pub = toPublicOrder(order);
    return ok({ order: { ...pub, shipping: { ...pub.shipping, line1: "•••", line2: undefined, phone: "•••" + pub.shipping.phone.slice(-3) } } });
  },
  { rate: { key: "track", limit: 10, windowMs: 60_000 } },
);
