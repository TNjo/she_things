import { z } from "zod";
import { handle, ok, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { newId } from "@/lib/ids";
import { AppError, Errors } from "@/lib/errors";

export const dynamic = "force-dynamic";

const schema = z.object({
  delta: z.number().int().min(-10000).max(10000).refine((n) => n !== 0, "Change can't be zero"),
  reason: z.string().trim().min(2, "Add a reason").max(120),
});

/** Quick +/- stock adjustment with an audit trail */
export const POST = handle<{ params: Promise<{ id: string }> }>(async (req, { params }) => {
  const admin = await requireAdmin();
  const { id } = await params;
  const { delta, reason } = await readJson(req, schema);
  const product = await db.withLock("stock", async () => {
    const p = await db.products.getById(id);
    if (!p) throw Errors.notFound("Product");
    if (p.stock + delta < 0) throw new AppError(`Only ${p.stock} in stock – can't remove ${-delta}.`, 422, "NEGATIVE_STOCK");
    const updated = await db.products.update(id, { stock: p.stock + delta });
    await db.inventory.log({ id: newId("inv"), productId: id, delta, reason, by: admin.email, at: new Date().toISOString(), stockAfter: updated.stock });
    return updated;
  });
  return ok({ product });
});
