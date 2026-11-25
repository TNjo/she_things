import { z } from "zod";
import { handle, ok, readJson } from "@/lib/http";
import { PAYMENT_MODE } from "@/lib/payments";
import { AppError } from "@/lib/errors";
import { loadOrderForViewer } from "@/lib/orderAccess";
import { applyPaymentResult } from "@/lib/orders";

export const dynamic = "force-dynamic";

/** Test-mode gateway. Disabled automatically when PAYMENT_MODE=live. */
export const POST = handle(
  async (req) => {
    if (PAYMENT_MODE !== "mock") throw new AppError("Not available", 404, "NOT_FOUND");
    const body = await readJson(req, z.object({ number: z.string(), t: z.string(), outcome: z.enum(["approve", "decline"]) }));
    const order = await loadOrderForViewer(body.number, body.t);
    if (order.status !== "pending_payment") throw new AppError("This order is not waiting for payment.", 409, "NOT_PENDING");
    if (order.expiresAt && Date.parse(order.expiresAt) < Date.now()) throw new AppError("This payment session expired.", 410, "EXPIRED");
    await applyPaymentResult(order.number, {
      status: body.outcome === "approve" ? "paid" : "failed",
      amount: order.total,
      ref: `MOCK-${Date.now().toString(36).toUpperCase()}`,
    });
    return ok({ redirect: `/order/${order.number}?t=${order.accessToken}` });
  },
  { rate: { key: "mockpay", limit: 10, windowMs: 60_000 } },
);
