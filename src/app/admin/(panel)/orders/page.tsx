import Link from "next/link";
import { db } from "@/lib/db";
import { formatLKR } from "@/lib/money";
import { sweepExpiredOrders } from "@/lib/orders";
import { STATUS_LABEL } from "@/lib/orderLabels";
import { PageTitle, PayPill, StatusPill } from "@/components/admin/ui";
import type { OrderStatus } from "@/lib/types";

export const metadata = { title: "Orders" };

const TABS: (OrderStatus | "all")[] = ["all", "awaiting_verification", "pending_payment", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ s?: string; q?: string }> }) {
  const sp = await searchParams;
  await sweepExpiredOrders();
  const status = TABS.includes(sp.s as OrderStatus) && sp.s !== "all" ? (sp.s as OrderStatus) : undefined;
  const q = (sp.q ?? "").trim().toLowerCase().slice(0, 60);
  const all = await db.orders.list();
  const orders = all
    .filter((o) => !status || o.status === status)
    .filter((o) => !q || `${o.number} ${o.email} ${o.phone} ${o.shipping.fullName}`.toLowerCase().includes(q));
  const count = (s: OrderStatus | "all") => (s === "all" ? all.length : all.filter((o) => o.status === s).length);

  return (
    <>
      <PageTitle title="Orders" sub={`${orders.length} shown`} />
      <form className="mb-4">
        {status && <input type="hidden" name="s" value={status} />}
        <input name="q" defaultValue={sp.q} placeholder="Search order no, name, email, phone…" className="field max-w-md" />
      </form>
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <Link key={t} href={`/admin/orders?s=${t}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className="chip shrink-0" data-active={(status ?? "all") === t}>
            {t === "all" ? "All" : STATUS_LABEL[t]} <span className="opacity-60">{count(t)}</span>
          </Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-[24px] border border-ink/10 bg-cream">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-ink/10 text-left text-xs uppercase tracking-wider text-cocoa">
            <tr><th className="p-4">Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Payment</th><th>Status</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-paper">
                <td className="p-4"><Link href={`/admin/orders/${o.id}`} className="font-mono font-bold underline-offset-2 hover:underline">{o.number}</Link></td>
                <td><p className="font-semibold">{o.shipping.fullName}</p><p className="text-xs text-cocoa">{o.email}</p></td>
                <td>{new Date(o.createdAt).toLocaleString("en-LK", { dateStyle: "medium", timeStyle: "short" })}</td>
                <td className="font-semibold">{formatLKR(o.total)}</td>
                <td><span className="block text-xs uppercase">{o.paymentMethod}</span><PayPill status={o.paymentStatus} /></td>
                <td><StatusPill status={o.status} /></td>
              </tr>
            ))}
            {!orders.length && <tr><td colSpan={6} className="p-8 text-center text-cocoa">No orders match.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
