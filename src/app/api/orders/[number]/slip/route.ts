import { z } from "zod";
import { handle, ok, readJson } from "@/lib/http";
import { loadOrderForViewer } from "@/lib/orderAccess";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

const schema = z.object({
  t: z.string().max(100).optional(),
  reference: z.string().trim().max(60).optional(),
  dataUrl: z.string().max(2_800_000, "Image is too large (max ~2MB)"),
});

// Only real image formats, checked by magic bytes – not just the declared type.
function checkImage(dataUrl: string) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) throw new AppError("Upload a JPG, PNG or WEBP image of your slip.", 422, "BAD_FILE");
  const bytes = Buffer.from(m[2].slice(0, 32), "base64");
  const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8;
  const isPng = bytes.slice(0, 4).toString("hex") === "89504e47";
  const isWebp = bytes.slice(0, 4).toString() === "RIFF" && bytes.slice(8, 12).toString() === "WEBP";
  if (!(isJpg || isPng || isWebp)) throw new AppError("That file doesn't look like an image.", 422, "BAD_FILE");
}

export const POST = handle<{ params: Promise<{ number: string }> }>(
  async (req, { params }) => {
    const { number } = await params;
    const body = await readJson(req, schema);
    const order = await loadOrderForViewer(number, body.t);
    if (order.paymentMethod !== "bank") throw new AppError("This order isn't paid by bank transfer.", 409, "NOT_BANK");
    if (order.status !== "awaiting_verification") throw new AppError("This order no longer needs a slip.", 409, "NOT_NEEDED");
    checkImage(body.dataUrl);
    await db.orders.update(order.id, {
      bankSlip: { dataUrl: body.dataUrl, uploadedAt: new Date().toISOString(), reference: body.reference },
      paymentStatus: "awaiting_verification",
      expiresAt: undefined,
      history: [...order.history, { status: "awaiting_verification", at: new Date().toISOString(), note: "Transfer slip uploaded", by: "customer" }],
    });
    return ok({ uploaded: true });
  },
  { rate: { key: "slip", limit: 6, windowMs: 60_000 } },
);
