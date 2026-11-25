import { db } from "@/lib/db";
import { formatLKR } from "@/lib/money";
import { PageTitle } from "@/components/admin/ui";

export const metadata = { title: "Customers" };

export default async function CustomersPage() {
  const [customers, orders] = await Promise.all([db.customers.list(), db.orders.list()]);
  // registered customers + guest buyers grouped by email
  const byEmail = new Map<string, { name: string; email: string; phone: string; registered: boolean; orders: number; spent: number; last: string }>();
  for (const c of customers) byEmail.set(c.email, { name: c.name, email: c.email, phone: c.phone ?? "", registered: true, orders: 0, spent: 0, last: c.createdAt });
  for (const o of orders) {
    const cur = byEmail.get(o.email) ?? { name: o.shipping.fullName, email: o.email, phone: o.phone, registered: false, orders: 0, spent: 0, last: o.createdAt };
    cur.orders += 1;
    if (o.paymentStatus === "paid") cur.spent += o.total;
    if (o.createdAt > cur.last) cur.last = o.createdAt;
    byEmail.set(o.email, cur);
  }
  const rows = [...byEmail.values()].sort((a, b) => b.spent - a.spent);

  return (
    <>
      <PageTitle title="Customers" sub={`${rows.length} people · ${customers.length} with accounts`} />
      <div className="overflow-x-auto rounded-[24px] border border-ink/10 bg-cream">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="border-b border-ink/10 text-left text-xs uppercase tracking-wider text-cocoa">
            <tr><th className="p-4">Customer</th><th>Phone</th><th>Type</th><th>Orders</th><th>Spent</th><th>Last activity</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.email}>
                <td className="p-4"><p className="font-semibold">{r.name}</p><p className="text-xs text-cocoa">{r.email}</p></td>
                <td>{r.phone || "—"}</td>
                <td>{r.registered ? <span className="sticker bg-blush">account</span> : <span className="sticker bg-ink/10">guest</span>}</td>
                <td>{r.orders}</td>
                <td className="font-semibold">{formatLKR(r.spent)}</td>
                <td className="text-cocoa">{new Date(r.last).toLocaleDateString("en-LK")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
