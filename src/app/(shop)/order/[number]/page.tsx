import { notFound } from "next/navigation";
import { loadOrderForViewer } from "@/lib/orderAccess";
import { sweepExpiredOrders, toPublicOrder } from "@/lib/orders";
import { bankDetails, PAYMENT_MODE } from "@/lib/payments";
import OrderView from "@/components/order/OrderView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your order", robots: { index: false } };

export default async function OrderPage({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ t?: string; cancelled?: string }> }) {
  const [{ number }, sp] = await Promise.all([params, searchParams]);
  await sweepExpiredOrders();
  const order = await loadOrderForViewer(number, sp.t).catch(() => null);
  if (!order) notFound();
  return (
    <OrderView
      order={toPublicOrder(order)}
      token={sp.t ?? ""}
      bank={order.paymentMethod === "bank" ? bankDetails() : null}
      canRetryPay={PAYMENT_MODE === "mock" && order.status === "pending_payment"}
      returnedCancelled={sp.cancelled === "1"}
    />
  );
}
