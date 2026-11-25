import { z } from "zod";
import { handle, ok, readJson } from "@/lib/http";
import { db } from "@/lib/db";
import { emailSchema } from "@/lib/validation";
import { Errors } from "@/lib/errors";

export const dynamic = "force-dynamic";

export const POST = handle(
  async (req) => {
    const { productId, email } = await readJson(req, z.object({ productId: z.string().max(40), email: emailSchema }));
    const p = await db.products.getById(productId);
    if (!p || !p.active) throw Errors.notFound("Product");
    await db.stockAlerts.add({ productId, email, at: new Date().toISOString() });
    return ok({ subscribed: true });
  },
  { rate: { key: "alert", limit: 10, windowMs: 60_000 } },
);
