"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Minus, Plus, Truck, ShieldCheck, Sparkles, ChevronDown, Bell } from "lucide-react";
import clsx from "clsx";
import type { Product, Review } from "@/lib/types";
import JewelArt from "../JewelArt";
import { formatLKR, instalment } from "@/lib/money";
import { useStore } from "../providers/StoreProvider";
import { useAddToBag } from "./useAddToBag";

const MATERIAL_LABEL: Record<Product["material"], string> = {
  gold: "Solid 22k gold", "gold-plated": "18k gold plated", silver: "Silver", "sterling-silver": "925 Sterling silver", "rose-gold": "Rose gold plated", pearl: "Freshwater pearl", brass: "Brass",
};

function deliveryWindow() {
  const d = (n: number) => new Date(Date.now() + n * 86400000).toLocaleDateString("en-LK", { weekday: "short", day: "numeric", month: "short" });
  return `${d(2)} – ${d(4)}`;
}

export default function ProductDetail({ p, reviews }: { p: Product; reviews: Review[] }) {
  const { wishlist, toggleWish, pushRecent, hydrated } = useStore();
  const add = useAddToBag();
  const [qty, setQty] = useState(1);
  const [view, setView] = useState(0);
  const [eta, setEta] = useState("");
  const btn = useRef<HTMLButtonElement>(null);
  const soldOut = p.stock <= 0;
  const wished = hydrated && wishlist.includes(p.id);
  const maxQty = Math.min(p.stock, 10);

  useEffect(() => { pushRecent(p.id); setEta(deliveryWindow()); }, [p.id, pushRecent]);

  // Real photos when available; otherwise three angles of the drawn art
  const hasPhotos = p.images.length > 0;
  const views = hasPhotos
    ? p.images.map((src) => ({ src, bg: "#FFFFFF", scale: 1 }))
    : [
        { src: "", bg: p.art.bg || "#F8E6EA", scale: 1 },
        { src: "", bg: "#1C1917", scale: 1 },
        { src: "", bg: p.art.bg || "#F8E6EA", scale: 1.8 },
      ];
  const current = views[Math.min(view, views.length - 1)];

  return (
    <div className="mx-auto max-w-[1400px] px-4 pt-6 md:px-8">
      <nav className="mb-6 text-sm text-cocoa" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:underline">Shop</Link> / <Link href={`/shop?c=${p.category}`} className="capitalize hover:underline">{p.category}</Link> / <span className="text-ink">{p.name}</span>
      </nav>
      <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
        {/* Gallery */}
        <div className="md:sticky md:top-24 md:self-start">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] transition-colors duration-500" style={{ background: current.bg }}>
            <AnimatePresence mode="wait">
              <motion.div key={view} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: current.scale }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className={clsx("absolute", current.src ? "inset-0" : "inset-[8%]")}>
                {current.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={current.src} alt={`${p.name} – photo ${view + 1}`} className="h-full w-full object-cover" fetchPriority={view === 0 ? "high" : "auto"} />
                ) : (
                  <JewelArt art={p.art} bare sway title={p.name} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          {views.length > 1 && (
            <div className="mt-4 flex gap-3">
              {views.map((v, i) => (
                <button key={i} onClick={() => setView(i)} aria-label={`Show photo ${i + 1}`} aria-pressed={view === i} className={clsx("h-20 w-20 overflow-hidden rounded-2xl border-2 transition", view === i ? "border-ink" : "border-transparent opacity-70 hover:opacity-100")} style={{ background: v.bg }}>
                  {v.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.src} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div style={{ transform: `scale(${v.scale})` }} className="h-full w-full p-2"><JewelArt art={p.art} bare /></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap gap-2">
            {p.isNew && <span className="sticker bg-butter">new drop</span>}
            {p.isBestseller && <span className="sticker bg-ink text-cream">cult fave</span>}
            <span className="sticker border border-ink/10">{MATERIAL_LABEL[p.material]}</span>
          </div>
          <h1 className="mt-4 text-5xl leading-[0.95] md:text-7xl">{p.name}</h1>
          <p className="mt-2 font-hand text-[40px] text-cherry">{p.tagline}</p>
          <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm">
            <span className="text-amber-500">{"★".repeat(Math.round(p.rating))}{"☆".repeat(5 - Math.round(p.rating))}</span>
            <span className="font-semibold underline-offset-2 hover:underline">{p.rating.toFixed(1)} · {p.reviewCount} reviews</span>
          </a>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-5xl">{formatLKR(p.price)}</span>
            {p.compareAt && <span className="text-xl text-cocoa line-through">{formatLKR(p.compareAt)}</span>}
          </div>
          <p className="mt-2 text-sm text-cocoa">
            or <b className="text-ink">3 × {instalment(p.price)}</b> interest-free with <b className="text-ink">Koko</b> or <b className="text-ink">Mintpay</b>
          </p>

          <p className="mt-6 max-w-lg leading-relaxed">{p.description}</p>

          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            {p.antiTarnish && <span className="chip border-ink/30"><Sparkles className="h-4 w-4" /> Anti-tarnish</span>}
            {p.hypoallergenic && <span className="chip border-ink/30"><ShieldCheck className="h-4 w-4" /> Hypoallergenic</span>}
            {p.vibes.map((v) => <Link key={v} href={`/shop?v=${v}`} className="chip border-ink/30 capitalize hover:bg-ink hover:text-cream">#{v}</Link>)}
          </div>

          {/* stock status */}
          <div className="mt-8">
            {soldOut ? (
              <NotifyMe productId={p.id} />
            ) : (
              <>
                {p.stock <= p.lowStockThreshold && (
                  <p className="mb-3 flex items-center gap-2 text-sm font-bold text-cherry">
                    <span className="h-2 w-2 animate-ping rounded-full bg-cherry" /> Only {p.stock} left – people have this in their bags
                  </p>
                )}
                <div className="flex gap-3">
                  <div className="flex items-center rounded-full border border-ink/10">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3.5" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
                    <span className="w-8 text-center font-bold" aria-live="polite">{qty}</span>
                    <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} className="p-3.5 disabled:opacity-30" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
                  </div>
                  <button ref={btn} onClick={() => add(p, qty, btn.current)} className="btn-cherry flex-1 text-base">Add to bag · {formatLKR(p.price * qty)}</button>
                  <button onClick={() => toggleWish(p.id)} aria-pressed={wished} aria-label="Save to wishlist" className="grid w-14 place-items-center rounded-full border border-ink/10 hover:bg-blush">
                    <Heart className={clsx("h-5 w-5", wished && "fill-cherry text-cherry")} />
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-cream p-4 text-sm">
            <Truck className="h-5 w-5 shrink-0" />
            <p>Order today, arrives <b>{eta || "in 2–4 days"}</b>. Free delivery over Rs 10,000.</p>
          </div>

          {p.earSpots?.length ? (
            <div className="mt-4 rounded-2xl border border-dashed border-ink/40 p-4 text-sm">
              Works on: <b className="capitalize">{p.earSpots.join(", ").replace(/-/g, " ")}</b>.{" "}
              <Link href="/stack" className="font-semibold text-cherry underline-offset-2 hover:underline">Plan your ear stack →</Link>
            </div>
          ) : null}

          <div className="mt-8 divide-y divide-line border-y border-line">
            <Accordion title="Details & sizing">
              <ul className="list-inside list-disc space-y-1 text-cocoa">
                <li>Material: {MATERIAL_LABEL[p.material]}</li>
                <li>Sold as a {p.category === "earrings" ? "pair" : "single piece"}</li>
                <li>SKU: {p.sku}</li>
              </ul>
            </Accordion>
            <Accordion title="Care guide">
              <p className="text-cocoa">Last on, first off. Keep away from perfume and pool water, wipe with a soft cloth and store in the pouch it came in. {p.material === "gold" ? "Solid gold can be polished at any jeweller." : "Our anti-tarnish coating loves being kept dry."}</p>
            </Accordion>
            <Accordion title="Delivery, exchanges & payments">
              <p className="text-cocoa">Island-wide delivery in 2–4 working days (Colombo next day for orders before 12pm). 7-day exchanges on unworn pieces with the hygiene seal intact. Pay by card, Koko, Mintpay, bank transfer or cash on delivery.</p>
            </Accordion>
          </div>
        </div>
      </div>

      <section id="reviews" className="mt-24 scroll-mt-24">
        <h2 className="text-4xl md:text-5xl">What girls <i>say</i></h2>
        {reviews.length === 0 ? (
          <p className="mt-4 text-cocoa">No reviews yet – be the first after your order arrives.</p>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {reviews.map((r, i) => (
              <figure key={r.id} className="card p-6" style={{ transform: `rotate(${i % 2 ? 1 : -1}deg)` }}>
                <p className="text-amber-500">{"★".repeat(r.rating)}</p>
                <blockquote className="mt-2 font-hand text-[32px] leading-snug">&ldquo;{r.body}&rdquo;</blockquote>
                <figcaption className="mt-3 text-xs font-bold uppercase tracking-widest">— {r.name}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between py-4 text-left font-semibold">
        {title}
        <ChevronDown className={clsx("h-5 w-5 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotifyMe({ productId }: { productId: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  return state === "done" ? (
    <p className="rounded-2xl bg-sage p-4 font-semibold">We&apos;ll email you the second it&apos;s back ✦</p>
  ) : (
    <form
      className="rounded-2xl border border-ink/10 bg-cream p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("busy");
        try {
          const res = await fetch("/api/stock-alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, email }) });
          const j = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(j.fields?.email || j.error || "Couldn't save that");
          setState("done");
        } catch (err) {
          setMsg((err as Error).message);
          setState("error");
        }
      }}
    >
      <p className="flex items-center gap-2 font-bold"><Bell className="h-4 w-4" /> Sold out – get a restock alert</p>
      <div className="mt-3 flex gap-2">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="field py-2.5" aria-label="Email for restock alert" aria-invalid={state === "error"} />
        <button disabled={state === "busy"} className="btn-ink py-2.5">{state === "busy" ? "…" : "Notify me"}</button>
      </div>
      {state === "error" && <p className="mt-2 text-sm text-cherry" role="alert">{msg}</p>}
    </form>
  );
}
