import { handle, ok, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/auth/session";
import { productInputSchema } from "@/lib/validation";
import { db } from "@/lib/db";
import { newId } from "@/lib/ids";
import { Errors } from "@/lib/errors";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const PATCH = handle<Ctx>(async (req, { params }) => {
  const admin = await requireAdmin();
  const { id } = await params;
  const input = await readJson(req, productInputSchema);
  const updated = await db.withLock("stock", async () => {
    const cur = await db.products.getById(id);
    if (!cur) throw Errors.notFound("Product");
    const p = await db.products.update(id, {
      ...input,
      compareAt: input.compareAt || undefined,
      cutoutImage: input.cutoutImage || undefined,
      art: { ...input.art, gem: input.art.gem || undefined, bg: input.art.bg || undefined },
    });
    if (p.stock !== cur.stock) {
      await db.inventory.log({ id: newId("inv"), productId: id, delta: p.stock - cur.stock, reason: "Manual edit", by: admin.email, at: new Date().toISOString(), stockAfter: p.stock });
    }
    return p;
  });
  return ok({ product: updated });
});

/** Products with order history are archived (hidden), never hard-deleted. */
export const DELETE = handle<Ctx>(async (_req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const p = await db.products.getById(id);
  if (!p) throw Errors.notFound("Product");
  const used = (await db.orders.list()).some((o) => o.items.some((i) => i.productId === id));
  if (used) {
    await db.products.update(id, { active: false });
    return ok({ archived: true });
  }
  await db.products.remove(id);
  return ok({ deleted: true });
});
