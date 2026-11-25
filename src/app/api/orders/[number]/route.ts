import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/http";
import { loadOrderForViewer } from "@/lib/orderAccess";
import { toPublicOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const GET = handle<{ params: Promise<{ number: string }> }>(async (req: NextRequest, { params }) => {
  const { number } = await params;
  const order = await loadOrderForViewer(number, req.nextUrl.searchParams.get("t"));
  return ok({ order: toPublicOrder(order) });
});
