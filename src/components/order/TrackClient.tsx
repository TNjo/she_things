"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import type { PublicOrder } from "@/lib/orders";
import StatusTimeline from "./StatusTimeline";
import { api, isApiError, rememberedOrders } from "@/lib/client/api";
import { formatLKR } from "@/lib/money";
import ProductImage from "@/components/ProductImage";

export default function TrackClient() {
  const [orderNumber, setOrderNumber] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [recent, setRecent] = useState<{ number: string; token: string; at: string }[]>([]);

  useEffect(() => setRecent(rememberedOrders()), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOrder(null);
    if (!/^ST-[A-Z0-9]{6}$/i.test(orderNumber.trim())) return setError("Order numbers look like ST-AB12CD");
    if (contact.trim().length < 5) return setError("Enter the email or phone you used");
    setBusy(true);
    try {
      const r = await api<{ order: PublicOrder }>("/api/track", { body: { orderNumber: orderNumber.trim().toUpperCase(), contact } });
      setOrder(r.order);
    } catch (e) {
      setError(isApiError(e) ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-10 md:px-8">
      <p className="font-hand text-[32px] text-cherry">where&apos;s my sparkle?</p>
      <h1 className="text-6xl leading-none md:text-8xl">Track <i>it</i></h1>

      <form onSubmit={submit} className="card mt-10 grid gap-4 p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end" noValidate>
        <div>
          <label className="label" htmlFor="on">Order number</label>
          <input id="on" className="field font-mono uppercase" placeholder="ST-AB12CD" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} maxLength={9} />
        </div>
        <div>
          <label className="label" htmlFor="ct">Email or phone</label>
          <input id="ct" className="field" placeholder="you@example.com" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={254} />
        </div>
        <button className="btn-ink" disabled={busy}>{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Search className="h-4 w-4" /> Track</>}</button>
        {error && <p className="text-sm text-cherry sm:col-span-3" role="alert">{error}</p>}
      </form>

      {order && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mt-8 p-6 md:p-8">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-mono text-2xl">{order.number}</h2>
            <p className="text-sm text-cocoa">Placed {new Date(order.createdAt).toLocaleDateString("en-LK", { dateStyle: "medium" })} · {formatLKR(order.total)}</p>
          </div>
          <StatusTimeline status={order.status} history={order.history} courier={order.courier} trackingNumber={order.trackingNumber} />
          <div className="mt-8 flex gap-3 overflow-x-auto">
            {order.items.map((i) => (
              <div key={i.productId} className="w-24 shrink-0 text-center text-xs">
                <div className="h-24 w-24 overflow-hidden rounded-2xl border border-ink/10"><ProductImage src={i.image} art={i.art} alt={i.name} /></div>
                <p className="mt-1 truncate">{i.name}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {recent.length > 0 && (
        <div className="mt-12">
          <p className="label">Orders placed on this device</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {recent.map((o) => (
              <li key={o.number}>
                <Link href={`/order/${o.number}?t=${encodeURIComponent(o.token)}`} className="flex items-center justify-between rounded-2xl border border-ink/20 bg-cream px-4 py-3 hover:border-ink">
                  <span className="font-mono font-bold">{o.number}</span>
                  <span className="text-sm text-cocoa">{new Date(o.at).toLocaleDateString("en-LK")} →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
