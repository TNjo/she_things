import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatLKR } from "@/lib/money";
import { STATUS_LABEL, sweepExpiredOrders } from "@/lib/orders";
import ProductImage from "@/components/ProductImage";
import LogoutButton from "@/components/account/LogoutButton";

export const metadata = { title: "My account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const s = await getCustomer();
  if (!s) redirect("/account/login?next=/account");
  const me = await db.customers.getById(s.sub);
  if (!me) redirect("/account/login");
  await sweepExpiredOrders();
  const orders = await db.orders.list({ customerId: me.id });

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-10 pt-10 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-hand text-[32px] text-cherry">hey gorgeous</p>
          <h1 className="text-6xl leading-none md:text-7xl">Hi, <i>{me.name.split(" ")[0]}</i></h1>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="text-3xl italic">Your orders</h2>
          {orders.length === 0 ? (
            <div className="card mt-4 p-8 text-center">
              <p className="font-display text-2xl italic">No orders yet</p>
              <Link href="/shop" className="btn-ink mt-4">Find something shiny</Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/order/${o.number}`} className="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-soft">
                    <div className="flex -space-x-4">
                      {o.items.slice(0, 3).map((i) => <div key={i.productId} className="h-14 w-14 overflow-hidden rounded-full border border-ink/10"><ProductImage src={i.image} art={i.art} alt={i.name} /></div>)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono font-bold">{o.number}</p>
                      <p className="text-sm text-cocoa">{new Date(o.createdAt).toLocaleDateString("en-LK", { dateStyle: "medium" })} · {o.items.reduce((s, i) => s + i.qty, 0)} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatLKR(o.total)}</p>
                      <span className={`sticker mt-1 ${o.status === "cancelled" ? "bg-petal" : o.status === "delivered" ? "bg-sage" : "bg-butter"}`}>{STATUS_LABEL[o.status]}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside className="space-y-4">
          <div className="card p-6">
            <p className="label">Profile</p>
            <p className="font-semibold">{me.name}</p>
            <p className="text-sm text-cocoa">{me.email}</p>
            {me.phone && <p className="text-sm text-cocoa">{me.phone}</p>}
          </div>
          <div className="card p-6">
            <p className="label">Saved address</p>
            {me.addresses[0] ? (
              <p className="text-sm">{me.addresses[0].line1}<br />{me.addresses[0].city}, {me.addresses[0].district}</p>
            ) : <p className="text-sm text-cocoa">Saved automatically after your first order.</p>}
          </div>
          <Link href="/wishlist" className="btn-ghost w-full">My wishlist</Link>
        </aside>
      </div>
    </div>
  );
}
