import { NextResponse } from "next/server";
import { handle } from "@/lib/http";
import { verifyPayhereNotify } from "@/lib/payments";
import { applyPaymentResult } from "@/lib/orders";

export const dynamic = "force-dynamic";

/** PayHere server-to-server notification (form-urlencoded). Signature-verified. */
export const POST = handle(
  async (req) => {
    const form = Object.fromEntries((await req.formData()).entries()) as Record<string, string>;
    const verified = verifyPayhereNotify(form);
    if (!verified) {
      console.warn("Rejected PayHere notify with invalid signature", form.order_id);
      return new NextResponse("invalid", { status: 400 });
    }
    try {
      await applyPaymentResult(verified.orderNumber, verified);
    } catch (e) {
      console.error("PayHere notify processing failed", verified.orderNumber, e);
      return new NextResponse("error", { status: 500 }); // PayHere will retry
    }
    return new NextResponse("ok");
  },
  { allowCrossOrigin: true },
);
