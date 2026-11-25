import "server-only";
import { db } from "./db";
import { getCustomer } from "./auth/session";
import { safeEqual } from "./security/compare";
import { Errors } from "./errors";
import type { Order } from "./types";

/** An order may be viewed with its secret token (guests) or by the signed-in owner. */
export async function loadOrderForViewer(number: string, token: string | null | undefined): Promise<Order> {
  const order = /^ST-[A-Z0-9]{6}$/.test(number) ? await db.orders.getByNumber(number) : null;
  if (!order) throw Errors.notFound("Order");
  if (safeEqual(token, order.accessToken)) return order;
  const me = await getCustomer();
  if (me && order.customerId === me.sub) return order;
  throw Errors.notFound("Order"); // don't reveal that it exists
}
