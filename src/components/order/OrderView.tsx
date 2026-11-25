"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Upload, Loader2, CheckCircle2 } from "lucide-react";
import type { PublicOrder } from "@/lib/orders";
import ProductImage from "@/components/ProductImage";
import StatusTimeline from "./StatusTimeline";
import { formatLKR } from "@/lib/money";
import { api, isApiError, rememberOrder } from "@/lib/client/api";
import { burst } from "../layout/Cursor";
import { useStore } from "../providers/StoreProvider";

const PAY_LABEL = { card: "Card", koko: "Koko (3 payments)", mintpay: "Mintpay (3 payments)", bank: "Bank transfer", cod: "Cash on delivery" };

interface Props {
  order: PublicOrder;
  token: string;
  bank: { bank: string; accountName: string; accountNumber: string; branch: string } | null;
  canRetryPay: boolean;
  returnedCancelled: boolean;
}

export default function OrderView({ order, token, bank, canRetryPay, returnedCancelled }: Props) {
  const router = useRouter();
  const { toast } = useStore();
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const celebrated = useRef(false);
  const happy = ["confirmed", "processing", "awaiting_verification"].includes(order.status);

  useEffect(() => {
    if (token) rememberOrder(order.number, token);
    if (happy && !celebrated.current && Date.now() - Date.parse(order.createdAt) < 10 * 60000) {
      celebrated.current = true;
      setTimeout(() => {
        burst(window.innerWidth / 2, 200, 40);
        burst(window.innerWidth / 4, 260, 20);
        burst((window.innerWidth * 3) / 4, 260, 20);
      }, 400);
    }
  }, [order.number, order.createdAt, token, happy]);

  async function cancel() {
    setCancelling(true);
    try {
      await api(`/api/orders/${order.number}/cancel`, { body: { t: token } });
      toast("Order cancelled");
      router.refresh();
    } catch (e) {
      toast(isApiError(e) ? e.message : "Couldn't cancel", "err");
    } finally {
      setCancelling(false);
      setConfirmCancel(false);
    }
  }

  const headline =
    order.status === "pending_payment" ? "Almost yours…"
    : order.status === "awaiting_verification" ? "Order reserved!"
    : order.status === "cancelled" ? "This order was cancelled"
    : order.status === "delivered" ? "Delivered with love"
    : "Yay, it's yours!";

  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-10 pt-8 md:px-8">
      {returnedCancelled && order.status === "pending_payment" && (
        <p className="mb-6 rounded-2xl border border-ink/10 bg-butter p-4 font-semibold" role="alert">Payment wasn&apos;t completed. Your items are held for 30 minutes.</p>
      )}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="font-hand text-[32px] text-cherry">order {order.number}</p>
        <h1 className="text-5xl leading-none md:text-7xl">{headline}</h1>
        <p className="mt-3 text-cocoa">We&apos;ve sent the details to <b className="text-ink">{order.email}</b>. Save this page or track anytime with your order number.</p>
      </motion.div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <div className="card p-6 md:p-8">
            <StatusTimeline status={order.status} history={order.history} courier={order.courier} trackingNumber={order.trackingNumber} />
            {canRetryPay && (
              <Link href={`/checkout/pay/${order.number}?t=${token}`} className="btn-cherry mt-6 w-full">Complete payment</Link>
            )}
          </div>

          {bank && order.status === "awaiting_verification" && <BankBox order={order} token={token} bank={bank} />}

          <div className="card p-6">
            <h2 className="text-2xl italic">History</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {[...order.history].reverse().map((h, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cherry" />
                  <span><b className="capitalize">{h.status.replace(/_/g, " ")}</b>{h.note ? ` – ${h.note}` : ""}<br /><span className="text-cocoa">{new Date(h.at).toLocaleString("en-LK")}</span></span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card overflow-hidden">
            <ul className="space-y-3 p-6">
              {order.items.map((i) => (
                <li key={i.productId} className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-ink/10"><ProductImage src={i.image} art={i.art} alt={i.name} /></div>
                  <span className="flex-1 text-sm"><b>{i.name}</b><br /><span className="text-cocoa">× {i.qty}</span></span>
                  <span className="text-sm font-semibold">{formatLKR(i.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t border-line p-6 text-sm">
              <R k="Subtotal" v={formatLKR(order.subtotal)} />
              {order.discount > 0 && <R k={`Discount ${order.couponCode ?? ""}`} v={`− ${formatLKR(order.discount)}`} />}
              <R k="Delivery" v={order.shippingFee ? formatLKR(order.shippingFee) : "Free"} />
              {order.giftWrap && <R k="Gift wrap" v={formatLKR(order.giftWrapFee)} />}
              <div className="flex justify-between border-t border-line pt-3 text-base"><dt className="font-bold">Total</dt><dd className="font-display text-2xl">{formatLKR(order.total)}</dd></div>
              <R k="Payment" v={`${PAY_LABEL[order.paymentMethod]} · ${order.paymentStatus.replace(/_/g, " ")}`} />
            </dl>
          </div>
          <div className="card p-6 text-sm">
            <p className="label">Delivering to</p>
            <p><b>{order.shipping.fullName}</b><br />{order.shipping.line1}{order.shipping.line2 ? `, ${order.shipping.line2}` : ""}<br />{order.shipping.city}, {order.shipping.district}</p>
            {order.giftWrap && order.giftNote && <p className="mt-3 rounded-xl bg-petal p-3 font-hand text-[28px]">&ldquo;{order.giftNote}&rdquo;</p>}
          </div>
          {["pending_payment", "awaiting_verification", "confirmed"].includes(order.status) && (
            confirmCancel ? (
              <div className="rounded-2xl border border-cherry p-4 text-sm">
                <p className="font-semibold">Cancel this order?</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={cancel} disabled={cancelling} className="btn-cherry flex-1 py-2.5">{cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, cancel"}</button>
                  <button onClick={() => setConfirmCancel(false)} className="btn-ghost flex-1 py-2.5">Keep it</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmCancel(true)} className="w-full text-sm font-semibold text-cocoa underline-offset-4 hover:underline">Cancel order</button>
            )
          )}
          <Link href="/shop" className="btn-ghost w-full">Keep shopping</Link>
        </aside>
      </div>
    </div>
  );
}

function R({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4"><dt className="text-cocoa">{k}</dt><dd className="text-right font-semibold capitalize">{v}</dd></div>;
}

/** Resize + re-encode the slip in the browser: smaller upload, strips EXIF/location data */
async function compressImage(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.8);
}

function BankBox({ order, token, bank }: { order: PublicOrder; token: string; bank: NonNullable<Props["bank"]> }) {
  const router = useRouter();
  const { toast } = useStore();
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [preview, setPreview] = useState("");
  const uploaded = order.paymentStatus === "awaiting_verification" && order.hasSlip;

  async function onFile(f: File | undefined) {
    setErr("");
    if (!f) return;
    if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(f.type)) return setErr("Please choose a photo or screenshot (JPG / PNG).");
    if (f.size > 15 * 1024 * 1024) return setErr("That file is over 15MB.");
    try {
      setPreview(await compressImage(f));
    } catch {
      setErr("Couldn't read that image – try a screenshot instead.");
    }
  }

  async function upload() {
    if (!preview) return setErr("Choose your slip first");
    setBusy(true);
    try {
      await api(`/api/orders/${order.number}/slip`, { body: { t: token, reference: ref, dataUrl: preview }, timeoutMs: 45000 });
      toast("Slip received – we'll confirm soon");
      router.refresh();
    } catch (e) {
      setErr(isApiError(e) ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const copy = (s: string) => navigator.clipboard?.writeText(s).then(() => toast("Copied"), () => undefined);

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-ink/10 bg-sage px-6 py-4"><h2 className="text-2xl italic">Bank transfer details</h2></div>
      <div className="space-y-4 p-6">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {[["Bank", bank.bank], ["Branch", bank.branch], ["Account name", bank.accountName], ["Account no", bank.accountNumber], ["Amount", formatLKR(order.total)], ["Reference", order.number]].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between rounded-xl bg-paper px-3 py-2">
              <span><span className="block text-xs text-cocoa">{k}</span><b>{v}</b></span>
              {(k === "Account no" || k === "Reference") && <button onClick={() => copy(v.replace(/\s/g, ""))} aria-label={`Copy ${k}`} className="p-1.5"><Copy className="h-4 w-4" /></button>}
            </div>
          ))}
        </dl>
        {uploaded ? (
          <p className="flex items-center gap-2 rounded-xl bg-butter p-4 font-semibold"><CheckCircle2 className="h-5 w-5" /> Slip uploaded – we&apos;re verifying it.</p>
        ) : (
          <>
            <p className="text-sm">Use <b>{order.number}</b> as the reference, then upload a photo of the slip / screenshot of the transfer.</p>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/25 p-6 text-center hover:bg-paper">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Slip preview" className="max-h-40 rounded-lg" />
              ) : (
                <><Upload className="h-6 w-6" /><span className="font-semibold">Choose slip photo</span></>
              )}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            <input className="field" placeholder="Transfer reference (optional)" value={ref} maxLength={60} onChange={(e) => setRef(e.target.value)} />
            {err && <p className="text-sm text-cherry" role="alert">{err}</p>}
            <button onClick={upload} disabled={busy || !preview} className="btn-ink w-full">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Upload slip"}</button>
          </>
        )}
      </div>
    </div>
  );
}
