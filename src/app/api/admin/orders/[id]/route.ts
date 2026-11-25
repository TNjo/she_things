import { z } from "zod";
import { handle, ok, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { transitionOrder } from "@/lib/orders";
import { AppError, Errors } from "@/lib/errors";

export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("status"),
    status: z.enum(["pending_payment", "awaiting_verification", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]),
    note: z.string().trim().max(300).optional(),
    courier: z.string().trim().max(60).optional(),
    trackingNumber: z.string().trim().max(60).regex(/^[A-Za-z0-9-]*$/, "Letters, numbers and dashes only").optional(),
  }),
  z.object({ action: z.literal("reject_slip"), note: z.string().trim().min(3, "Tell the customer why").max(300) }),
  z.object({
    action: z.literal("tracking"),
    courier: z.string().trim().max(60),
    trackingNumber: z.string().trim().min(3).max(60).regex(/^[A-Za-z0-9-]+$/, "Letters, numbers and dashes only"),
  }),
]);

export const PATCH = handle<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  const admin = await requireAdmin();
  const { id } = await params;
  const body = await readJson(req, schema);
  const order = await db.orders.getById(id);
  if (!order) throw Errors.notFound("Order");

  if (body.action === "status") {
    const updated = await transitionOrder(id, body.status, { note: body.note, by: admin.email, courier: body.courier, trackingNumber: body.trackingNumber });
    return ok({ order: updated });
  }
  if (body.action === "reject_slip") {
    if (order.status !== "awaiting_verification") throw new AppError("This order isn't awaiting verification.", 409, "BAD_STATE");
    const updated = await db.orders.update(id, {
      bankSlip: undefined,
      paymentStatus: "pending",
      expiresAt: new Date(Date.now() + 48 * 3600000).toISOString(),
      history: [...order.history, { status: "awaiting_verification", at: new Date().toISOString(), note: `Slip rejected: ${body.note}`, by: admin.email }],
    });
    return ok({ order: updated });
  }
  const updated = await db.orders.update(id, { courier: body.courier, trackingNumber: body.trackingNumber });
  return ok({ order: updated });
});
