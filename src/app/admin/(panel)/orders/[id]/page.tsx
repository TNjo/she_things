import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatLKR } from "@/lib/money";
import { PageTitle, PayPill, StatusPill } from "@/components/admin/ui";
import OrderActions from "@/components/admin/OrderActions";
import ProductImage from "@/components/ProductImage";
import PrintButton from "@/components/admin/PrintButton";

export const metadata = { title: "Order" };

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await db.orders.getById(id);
  if (!o) notFound();

  return (
    <>
      <Link href="/admin/orders" className="no-print text-sm font-semibold underline">← Orders</Link>
      <PageTitle title={o.number} sub={`Placed ${new Date(o.createdAt).toLocaleString("en-LK")}`} action={<div className="flex items-center gap-2"><StatusPill status={o.status} /><PayPill status={o.paymentStatus} /><PrintButton /></div>} />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-[24px] border border-ink/10 bg-cream">
            <ul className="divide-y divide-line">
              {o.items.map((i) => (
                <li key={i.productId} className="flex items-center gap-4 p-4">
                  <div className="h-14 w-14 overflow-hidden rounded-xl border border-ink"><ProductImage src={i.image} art={i.art} alt={i.name} /></div>
                  <div className="flex-1"><p className="font-semibold">{i.name}</p><p className="text-xs text-cocoa">{i.sku}</p></div>
                  <p className="text-sm">{i.qty} × {formatLKR(i.unitPrice)}</p>
                  <p className="w-24 text-right font-semibold">{formatLKR(i.lineTotal)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-1 border-t border-ink/10 p-4 text-sm">
              <Row k="Subtotal" v={formatLKR(o.subtotal)} />
              {o.discount > 0 && <Row k={`Discount (${o.couponCode})`} v={`− ${formatLKR(o.discount)}`} />}
              <Row k="Shipping" v={formatLKR(o.shippingFee)} />
              {o.giftWrap && <Row k="Gift wrap" v={formatLKR(o.giftWrapFee)} />}
              <div className="flex justify-between pt-2 text-base font-bold"><dt>Total</dt><dd>{formatLKR(o.total)}</dd></div>
              <Row k="Payment" v={`${o.paymentMethod.toUpperCase()}${o.paymentRef ? ` · ref ${o.paymentRef}` : ""}`} />
            </dl>
          </section>

          {o.bankSlip && (
            <section className="no-print rounded-[24px] border border-ink/10 bg-cream p-5">
              <h2 className="text-xl italic">Bank slip</h2>
              <p className="text-sm text-cocoa">Uploaded {new Date(o.bankSlip.uploadedAt).toLocaleString("en-LK")} {o.bankSlip.reference && `· ref ${o.bankSlip.reference}`}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <a href={o.bankSlip.dataUrl} target="_blank" rel="noopener noreferrer"><img src={o.bankSlip.dataUrl} alt="Bank slip" className="mt-3 max-h-80 rounded-xl border border-ink" /></a>
              <p className="mt-2 text-sm">Expected amount: <b>{formatLKR(o.total)}</b> with reference <b>{o.number}</b></p>
            </section>
          )}

          <section className="rounded-[24px] border border-ink/10 bg-cream p-5">
            <h2 className="text-xl italic">Timeline</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {[...o.history].reverse().map((h, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cherry" />
                  <span><b className="capitalize">{h.status.replace(/_/g, " ")}</b>{h.note ? ` – ${h.note}` : ""}<br /><span className="text-cocoa">{new Date(h.at).toLocaleString("en-LK")}{h.by ? ` · ${h.by}` : ""}</span></span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <OrderActions order={{ id: o.id, status: o.status, paymentMethod: o.paymentMethod, hasSlip: !!o.bankSlip, courier: o.courier, trackingNumber: o.trackingNumber }} />
          <section className="rounded-[24px] border border-ink/10 bg-cream p-5 text-sm">
            <p className="label">Customer</p>
            <p className="font-semibold">{o.shipping.fullName}</p>
            <p>{o.email}</p>
            <p>{o.phone}</p>
            <p className="label mt-4">Ship to</p>
            <p>{o.shipping.line1}{o.shipping.line2 ? `, ${o.shipping.line2}` : ""}<br />{o.shipping.city}, {o.shipping.district} {o.shipping.postalCode}</p>
            {o.customerNote && <><p className="label mt-4">Customer note</p><p className="whitespace-pre-wrap">{o.customerNote}</p></>}
            {o.giftWrap && <><p className="label mt-4">Gift wrap ✦ note</p><p className="rounded-xl bg-petal p-3 font-hand text-[28px]">{o.giftNote || "(no note)"}</p></>}
            {o.customerId && <p className="mt-4 text-xs text-cocoa">Registered customer</p>}
          </section>
        </div>
      </div>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><dt className="text-cocoa">{k}</dt><dd>{v}</dd></div>;
}
