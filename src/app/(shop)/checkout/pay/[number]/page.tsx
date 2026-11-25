import { notFound, redirect } from "next/navigation";
import { loadOrderForViewer } from "@/lib/orderAccess";
import { PAYMENT_MODE } from "@/lib/payments";
import MockGateway from "@/components/checkout/MockGateway";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payment", robots: { index: false } };

export default async function PayPage({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ t?: string }> }) {
  if (PAYMENT_MODE !== "mock") notFound();
  const [{ number }, { t }] = await Promise.all([params, searchParams]);
  const order = await loadOrderForViewer(number, t).catch(() => null);
  if (!order) notFound();
  if (order.status !== "pending_payment") redirect(`/order/${order.number}?t=${order.accessToken}`);
  return (
    <MockGateway
      number={order.number}
      token={order.accessToken}
      total={order.total}
      method={order.paymentMethod as "card" | "koko" | "mintpay"}
      email={order.email}
      expiresAt={order.expiresAt ?? null}
    />
  );
}
