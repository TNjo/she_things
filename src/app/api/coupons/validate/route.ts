import { z } from "zod";
import { handle, ok, readJson } from "@/lib/http";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export const POST = handle(
  async (req) => {
    const { code } = await readJson(req, z.object({ code: z.string().trim().toUpperCase().min(2).max(30) }));
    const c = await db.coupons.get(code);
    if (!c || !c.active) throw new AppError("That code isn't valid (yet!)", 404, "BAD_COUPON");
    return ok({ coupon: { code: c.code, type: c.type, value: c.value, minSubtotal: c.minSubtotal, description: c.description, active: true } });
  },
  { rate: { key: "coupon", limit: 15, windowMs: 60_000 } },
);
