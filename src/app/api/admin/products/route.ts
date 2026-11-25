import { handle, ok, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/auth/session";
import { productInputSchema } from "@/lib/validation";
import { db } from "@/lib/db";
import { newId } from "@/lib/ids";

export const dynamic = "force-dynamic";

export const POST = handle(async (req) => {
  const admin = await requireAdmin();
  const input = await readJson(req, productInputSchema);
  const now = new Date().toISOString();
  const p = await db.products.create({
    ...input,
    id: newId("p"),
    compareAt: input.compareAt || undefined,
    cutoutImage: input.cutoutImage || undefined,
    art: { ...input.art, gem: input.art.gem || undefined, bg: input.art.bg || undefined },
    rating: 0,
    reviewCount: 0,
    createdAt: now,
    updatedAt: now,
  });
  if (p.stock > 0) await db.inventory.log({ id: newId("inv"), productId: p.id, delta: p.stock, reason: "Initial stock", by: admin.email, at: now, stockAfter: p.stock });
  return ok({ product: p });
});
