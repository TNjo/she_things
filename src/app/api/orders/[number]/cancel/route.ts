import { z } from "zod";
import { handle, ok, readJson } from "@/lib/http";
import { loadOrderForViewer } from "@/lib/orderAccess";
import { toPublicOrder, transitionOrder } from "@/lib/orders";
import { AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

const CANCELLABLE = ["pending_payment", "awaiting_verification", "confirmed"];

export const POST = handle<{ params: Promise<{ number: string }> }>(
  async (req, { params }) => {
    const { number } = await params;
    const { t } = await readJson(req, z.object({ t: z.string().max(100).optional() }));
    const order = await loadOrderForViewer(number, t);
    if (!CANCELLABLE.includes(order.status)) {
      throw new AppError("This order is already being packed – message us on WhatsApp and we'll help.", 409, "TOO_LATE");
    }
    const updated = await transitionOrder(order.id, "cancelled", { note: "Cancelled by customer", by: "customer" });
    return ok({ order: toPublicOrder(updated) });
  },
  { rate: { key: "cancel", limit: 5, windowMs: 60_000 } },
);
