import Link from "next/link";
import { db } from "@/lib/db";
import { formatLKR } from "@/lib/money";
import { sweepExpiredOrders } from "@/lib/orders";
import { PageTitle, Stat, StatusPill } from "@/components/admin/ui";
import ProductImage from "@/components/ProductImage";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  await sweepExpiredOrders();
  const [orders, products] = await Promise.all([db.orders.list(), db.products.list({ includeInactive: true })]);
  const live = orders.filter((o) => o.status !== "cancelled" && o.status !== "refunded");
  const paid = live.filter((o) => o.paymentStatus === "paid");
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const today = new Date().toDateString();
  const todays = live.filter((o) => new Date(o.createdAt).toDateString() === today);
  const toVerify = orders.filter((o) => o.status === "awaiting_verification" && o.bankSlip);
  const toPack = orders.filter((o) => o.status === "confirmed");
  const lowStock = products.filter((p) => p.active && p.stock <= p.lowStockThreshold).sort((a, b) => a.stock - b.stock);

  // last 7 days revenue (all non-cancelled orders)
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const key = d.toDateString();
    const total = live.filter((o) => new Date(o.createdAt).toDateString() === key).reduce((s, o) => s + o.total, 0);
    return { label: d.toLocaleDateString("en-LK", { weekday: "short" }), total };
  });
  const max = Math.max(...days.map((d) => d.total), 1);

  // top sellers
  const sold = new Map<string, { name: string; qty: number; image?: string; art: (typeof orders)[number]["items"][number]["art"] }>();
  for (const o of live) for (const i of o.items) sold.set(i.productId, { name: i.name, art: i.art, image: i.image, qty: (sold.get(i.productId)?.qty ?? 0) + i.qty });
  const top = [...sold.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

  return (
    <>
      <PageTitle title="Good day ✦" sub="Here's what's happening at She Things." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Revenue (paid)" value={formatLKR(revenue)} hint={`${paid.length} paid orders`} tone="bg-butter" />
        <Stat label="Orders today" value={String(todays.length)} hint={formatLKR(todays.reduce((s, o) => s + o.total, 0))} />
        <Stat label="Ready to pack" value={String(toPack.length)} hint="confirmed, not packed" tone="bg-blush" />
        <Stat label="Slips to verify" value={String(toVerify.length)} hint="bank transfers" tone={toVerify.length ? "bg-[#FFD9A8]" : "bg-cream"} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-[24px] border border-ink/10 bg-cream p-6">
          <h2 className="text-2xl italic">Last 7 days</h2>
          <div className="mt-6 flex h-48 items-end gap-3" role="img" aria-label="Revenue per day for the last 7 days">
            {days.map((d) => (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-semibold text-cocoa">{d.total ? `${Math.round(d.total / 1000)}k` : ""}</span>
                <div className="w-full rounded-t-xl border border-ink/10 bg-cherry transition-all" style={{ height: `${Math.max(4, (d.total / max) * 150)}px` }} />
                <span className="text-xs font-semibold">{d.label}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-[24px] border border-ink/10 bg-cream p-6">
          <h2 className="text-2xl italic">Top sellers</h2>
          <ul className="mt-4 space-y-3">
            {top.map((t, i) => (
              <li key={t.name} className="flex items-center gap-3">
                <span className="w-5 font-display text-xl italic text-cherry">{i + 1}</span>
                <div className="h-10 w-10 overflow-hidden rounded-xl border border-ink"><ProductImage src={t.image} art={t.art} alt={t.name} /></div>
                <span className="flex-1 truncate text-sm font-semibold">{t.name}</span>
                <span className="text-sm">{t.qty} sold</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-[24px] border border-ink/10 bg-cream p-6">
          <div className="flex items-center justify-between"><h2 className="text-2xl italic">Needs attention</h2><Link href="/admin/orders" className="text-sm font-semibold underline">All orders</Link></div>
          <ul className="mt-4 divide-y divide-line">
            {[...toVerify, ...toPack].slice(0, 8).map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-paper">
                  <span><b className="font-mono">{o.number}</b> <span className="text-sm text-cocoa">· {o.shipping.fullName}</span></span>
                  <StatusPill status={o.status} />
                </Link>
              </li>
            ))}
            {!toVerify.length && !toPack.length && <li className="py-3 text-sm text-cocoa">All caught up ✦</li>}
          </ul>
        </section>
        <section className="rounded-[24px] border border-ink/10 bg-cream p-6">
          <div className="flex items-center justify-between"><h2 className="text-2xl italic">Low stock</h2><Link href="/admin/inventory" className="text-sm font-semibold underline">Inventory</Link></div>
          <ul className="mt-4 divide-y divide-line">
            {lowStock.slice(0, 8).map((p) => (
              <li key={p.id}>
                <Link href={`/admin/products/${p.id}`} className="flex items-center justify-between py-3 hover:bg-paper">
                  <span className="text-sm font-semibold">{p.name}</span>
                  <span className={`sticker ${p.stock === 0 ? "bg-cherry text-white" : "bg-butter"}`}>{p.stock === 0 ? "sold out" : `${p.stock} left`}</span>
                </Link>
              </li>
            ))}
            {!lowStock.length && <li className="py-3 text-sm text-cocoa">Stock looks healthy.</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
