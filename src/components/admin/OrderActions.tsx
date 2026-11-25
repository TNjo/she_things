"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { OrderStatus, PaymentMethod } from "@/lib/types";
import { STATUS_FLOW, STATUS_LABEL } from "@/lib/orderLabels";
import { api, isApiError } from "@/lib/client/api";

interface Props {
  order: { id: string; status: OrderStatus; paymentMethod: PaymentMethod; hasSlip: boolean; courier?: string; trackingNumber?: string };
}

const COURIERS = ["Pronto Lanka", "Domex", "Koombiyo", "Certis Lanka", "SL Post", "Own rider"];

export default function OrderActions({ order }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string>("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [note, setNote] = useState("");
  const [courier, setCourier] = useState(order.courier ?? COURIERS[0]);
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [confirming, setConfirming] = useState<OrderStatus | null>(null);
  const next = STATUS_FLOW[order.status];

  async function send(body: Record<string, unknown>, label: string) {
    setBusy(label);
    setErr("");
    setOk("");
    try {
      await api(`/api/admin/orders/${order.id}`, { method: "PATCH", body });
      setOk("Saved ✓");
      setNote("");
      setConfirming(null);
      router.refresh();
    } catch (e) {
      setErr(isApiError(e) ? (e.fields ? Object.values(e.fields)[0] : e.message) : "Failed");
    } finally {
      setBusy("");
    }
  }

  const danger = (s: OrderStatus) => s === "cancelled" || s === "refunded";

  return (
    <section className="no-print rounded-[24px] border border-ink/10 bg-butter p-5">
      <h2 className="text-xl italic">Update order</h2>

      {order.status === "awaiting_verification" && (
        <div className="mt-3 rounded-2xl bg-cream p-4 text-sm">
          {order.hasSlip ? (
            <>
              <p className="font-semibold">Check the slip, then:</p>
              <div className="mt-3 flex gap-2">
                <button disabled={!!busy} onClick={() => send({ action: "status", status: "confirmed", note: "Bank transfer verified" }, "verify")} className="btn-ink flex-1 py-2.5">{busy === "verify" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Payment received"}</button>
                <button disabled={!!busy || note.trim().length < 3} onClick={() => send({ action: "reject_slip", note }, "reject")} className="btn-ghost flex-1 py-2.5" title="Write a reason below first">Reject slip</button>
              </div>
            </>
          ) : <p>Waiting for the customer to upload a transfer slip (auto-cancels after 48h).</p>}
        </div>
      )}

      {(next.includes("shipped") || order.status === "shipped") && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <select value={courier} onChange={(e) => setCourier(e.target.value)} className="field py-2.5" aria-label="Courier">
            {COURIERS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Tracking no" className="field py-2.5 font-mono" maxLength={60} aria-label="Tracking number" />
          {order.status === "shipped" && (
            <button disabled={!!busy || tracking.length < 3} onClick={() => send({ action: "tracking", courier, trackingNumber: tracking }, "trk")} className="btn-ghost col-span-2 py-2.5">Update tracking</button>
          )}
        </div>
      )}

      <label className="label mt-4" htmlFor="note">Note (shown in timeline)</label>
      <input id="note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} className="field py-2.5" placeholder="Optional" />

      <div className="mt-4 flex flex-wrap gap-2">
        {next.filter((s) => !(order.status === "awaiting_verification" && s === "confirmed")).map((s) =>
          confirming === s ? (
            <div key={s} className="flex w-full gap-2 rounded-2xl bg-cream p-3 text-sm">
              <span className="flex-1 font-semibold">{s === "cancelled" ? "Cancel and restock items?" : "Mark as refunded and restock?"}</span>
              <button onClick={() => send({ action: "status", status: s, note }, s)} className="btn-cherry py-2">{busy === s ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes"}</button>
              <button onClick={() => setConfirming(null)} className="btn-ghost py-2">No</button>
            </div>
          ) : (
            <button
              key={s}
              disabled={!!busy}
              onClick={() => (danger(s) ? setConfirming(s) : send({ action: "status", status: s, note, ...(s === "shipped" ? { courier, trackingNumber: tracking } : {}) }, s))}
              className={danger(s) ? "btn-ghost py-2.5" : "btn-ink py-2.5"}
            >
              {busy === s ? <Loader2 className="h-4 w-4 animate-spin" /> : `→ ${STATUS_LABEL[s]}`}
            </button>
          ),
        )}
        {!next.length && <p className="text-sm text-cocoa">This order is closed.</p>}
      </div>
      {err && <p className="mt-3 rounded-xl bg-petal p-3 text-sm font-semibold text-cherry" role="alert">{err}</p>}
      {ok && <p className="mt-3 text-sm font-semibold text-green-800">{ok}</p>}
    </section>
  );
}
