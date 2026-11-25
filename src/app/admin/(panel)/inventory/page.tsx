import Link from "next/link";
import { db } from "@/lib/db";
import { PageTitle } from "@/components/admin/ui";

export const metadata = { title: "Inventory" };

export default async function InventoryPage() {
  const [log, products, alerts] = await Promise.all([db.inventory.list(), db.products.list({ includeInactive: true }), db.stockAlerts.list()]);
  const name = (id: string) => products.find((p) => p.id === id)?.name ?? id;
  const waiting = new Map<string, number>();
  alerts.forEach((a) => waiting.set(a.productId, (waiting.get(a.productId) ?? 0) + 1));

  return (
    <>
      <PageTitle title="Inventory" sub="Every stock movement is logged – orders, cancellations and manual changes." />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="overflow-x-auto rounded-[24px] border border-ink/10 bg-cream">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="border-b border-ink/10 text-left text-xs uppercase tracking-wider text-cocoa">
              <tr><th className="p-4">When</th><th>Product</th><th>Change</th><th>After</th><th>Reason</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {log.slice(0, 200).map((l) => (
                <tr key={l.id}>
                  <td className="p-3 text-cocoa">{new Date(l.at).toLocaleString("en-LK", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td><Link href={`/admin/products/${l.productId}`} className="font-semibold hover:underline">{name(l.productId)}</Link></td>
                  <td className={l.delta > 0 ? "font-bold text-green-800" : "font-bold text-cherry"}>{l.delta > 0 ? "+" : ""}{l.delta}</td>
                  <td>{l.stockAfter}</td>
                  <td>{l.reason}<br /><span className="text-xs text-cocoa">{l.by}</span></td>
                </tr>
              ))}
              {!log.length && <tr><td colSpan={5} className="p-8 text-center text-cocoa">No movements yet. Place a test order to see it here.</td></tr>}
            </tbody>
          </table>
        </section>
        <section className="rounded-[24px] border border-ink/10 bg-cream p-5">
          <h2 className="text-xl italic">Restock requests</h2>
          <p className="text-sm text-cocoa">Customers waiting for &ldquo;notify me&rdquo; emails.</p>
          <ul className="mt-4 divide-y divide-line text-sm">
            {[...waiting.entries()].map(([pid, n]) => (
              <li key={pid} className="flex justify-between py-2"><Link href={`/admin/products/${pid}`} className="font-semibold hover:underline">{name(pid)}</Link><span className="sticker bg-butter">{n} waiting</span></li>
            ))}
            {!waiting.size && <li className="py-2 text-cocoa">No requests yet.</li>}
          </ul>
          {alerts.length > 0 && (
            <details className="mt-4 text-sm"><summary className="cursor-pointer font-semibold">Show emails</summary>
              <ul className="mt-2 space-y-1">{alerts.map((a) => <li key={a.productId + a.email}>{a.email} – {name(a.productId)}</li>)}</ul>
            </details>
          )}
        </section>
      </div>
    </>
  );
}
