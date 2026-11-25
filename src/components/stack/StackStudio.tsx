"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dices, Share2, ShoppingBag, Trash2, X } from "lucide-react";
import clsx from "clsx";
import type { Product } from "@/lib/types";
import Ear, { SKIN_TONES, SLOTS, type Slot } from "./Ear";
import { ProductThumb, tryOnLook } from "./EarringVisual";
import { formatLKR } from "@/lib/money";
import { useStore } from "../providers/StoreProvider";
import { burst } from "../layout/Cursor";

export default function StackStudio({ products }: { products: Product[] }) {
  const { addToCart, toast, setCartOpen } = useStore();
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [active, setActive] = useState<Slot | null>(null);
  const [tone, setTone] = useState(1);
  const addBtn = useRef<HTMLButtonElement>(null);

  // Load a shared stack from the URL (?s=lobe.p_001,helix-1.p_007)
  useEffect(() => {
    try {
      const s = new URLSearchParams(window.location.search).get("s");
      if (!s) return;
      const next: Record<string, string> = {};
      for (const pair of s.split(",").slice(0, SLOTS.length)) {
        const [slot, pid] = pair.split(".");
        if (SLOTS.some((x) => x.id === slot) && products.some((p) => p.id === pid)) next[slot] = pid;
      }
      setPlaced(next);
    } catch { /* ignore malformed links */ }
  }, [products]);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const options = active ? products.filter((p) => p.earSpots?.includes(active.spot)) : [];
  const chosen = Object.entries(placed).map(([slot, pid]) => ({ slot, p: byId.get(pid)! })).filter((x) => x.p);
  const total = chosen.reduce((s, x) => s + x.p.price, 0);
  const artMap = Object.fromEntries(chosen.map(({ slot, p }) => [slot, tryOnLook(p)]));

  function place(p: Product) {
    if (!active) return;
    setPlaced((x) => ({ ...x, [active.id]: p.id }));
    // jump to the next empty slot – feels like a game
    const nextEmpty = SLOTS.find((s) => s.id !== active.id && !placed[s.id]);
    setActive(nextEmpty ?? null);
  }

  function surprise() {
    const next: Record<string, string> = {};
    for (const s of SLOTS) {
      if (Math.random() < 0.3 && s.spot !== "lobe") continue;
      const opts = products.filter((p) => p.earSpots?.includes(s.spot) && p.stock > 0);
      if (opts.length) next[s.id] = opts[Math.floor(Math.random() * opts.length)].id;
    }
    setPlaced(next);
    setActive(null);
  }

  function addAll() {
    if (!chosen.length) return;
    const counts = new Map<string, number>();
    chosen.forEach(({ p }) => counts.set(p.id, (counts.get(p.id) ?? 0) + 1));
    let skipped = 0;
    for (const [id, qty] of counts) {
      const p = byId.get(id)!;
      if (p.stock <= 0) { skipped++; continue; }
      addToCart({ productId: p.id, slug: p.slug, name: p.name, price: p.price, art: p.art, image: p.images[0], maxQty: p.stock }, qty);
    }
    const r = addBtn.current?.getBoundingClientRect();
    if (r) burst(r.left + r.width / 2, r.top, 30);
    toast(skipped ? `Stack added (${skipped} sold-out piece skipped)` : "Your whole stack is in the bag!");
    setTimeout(() => setCartOpen(true), 600);
  }

  async function share() {
    const s = Object.entries(placed).map(([k, v]) => `${k}.${v}`).join(",");
    const url = `${window.location.origin}/stack?s=${encodeURIComponent(s)}`;
    try {
      if (navigator.share) await navigator.share({ title: "My She Things ear stack", url });
      else { await navigator.clipboard.writeText(url); toast("Link copied – send it to your bestie"); }
    } catch { /* user cancelled */ }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-8 md:px-8">
      <div className="max-w-3xl">
        <p className="font-hand text-[32px] text-cherry">tap a dot, pick a piece</p>
        <h1 className="text-6xl leading-[0.9] md:text-8xl">Ear Stack <i>Studio</i></h1>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Ear canvas */}
        <div className="card relative overflow-hidden bg-petal p-4 md:p-8">
          <div className="absolute right-4 top-4 z-10 flex gap-1.5 rounded-full border border-ink/10 bg-cream p-1.5" role="radiogroup" aria-label="Skin tone">
            {SKIN_TONES.map((t, i) => (
              <button key={t.name} role="radio" aria-checked={tone === i} aria-label={t.name} onClick={() => setTone(i)} className={clsx("h-7 w-7 rounded-full border transition", tone === i ? "scale-110 border-ink" : "border-transparent")} style={{ background: t.fill }} />
            ))}
          </div>
          <motion.div key={tone} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} className="mx-auto max-w-[440px]">
            <Ear tone={SKIN_TONES[tone]} placed={artMap} active={active?.id} onSlot={(s) => setActive(s)} className="w-full drop-shadow-xl" />
          </motion.div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <button onClick={surprise} className="chip bg-cream"><Dices className="h-4 w-4" /> Surprise me</button>
            {chosen.length > 0 && <button onClick={() => { setPlaced({}); setActive(null); }} className="chip bg-cream"><Trash2 className="h-4 w-4" /> Clear</button>}
            {chosen.length > 0 && <button onClick={share} className="chip bg-cream"><Share2 className="h-4 w-4" /> Share</button>}
          </div>
        </div>

        {/* Picker + summary */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div key={active.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl">For your <i>{active.label.toLowerCase()}</i></h2>
                  <button onClick={() => setActive(null)} aria-label="Close picker" className="rounded-full border border-ink/10 p-1.5"><X className="h-4 w-4" /></button>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {options.map((p) => {
                    const sel = placed[active.id] === p.id;
                    return (
                      <button key={p.id} disabled={p.stock <= 0} onClick={() => place(p)} className={clsx("group text-left disabled:opacity-40", sel && "ring-4 ring-cherry rounded-2xl")}>
                        <div className="aspect-square overflow-hidden rounded-2xl border border-ink/10 transition group-hover:-rotate-3"><ProductThumb p={p} /></div>
                        <p className="mt-1 truncate text-xs font-semibold">{p.name}</p>
                        <p className="text-xs text-cocoa">{p.stock <= 0 ? "sold out" : formatLKR(p.price)}</p>
                      </button>
                    );
                  })}
                </div>
                {placed[active.id] && (
                  <button onClick={() => { setPlaced((x) => { const n = { ...x }; delete n[active.id]; return n; }); }} className="mt-4 text-sm font-semibold underline">Remove from this spot</button>
                )}
              </motion.div>
            ) : (
              <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-[28px] border border-dashed border-ink/25 p-6">
                <p className="font-display text-2xl italic">Tap a pulsing dot on the ear to start.</p>
                <p className="mt-2 text-sm text-cocoa">Each spot only shows pieces made for it – huggies for helix, studs for tragus, drops for the lobe. No guesswork.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="card mt-auto overflow-hidden">
            <div className="border-b border-ink/10 bg-butter px-5 py-3"><p className="font-bold">Your stack · {chosen.length} piece{chosen.length === 1 ? "" : "s"}</p></div>
            {chosen.length === 0 ? (
              <p className="p-5 text-sm text-cocoa">Nothing placed yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {chosen.map(({ slot, p }) => (
                  <li key={slot} className="flex items-center gap-3 px-5 py-3">
                    <div className="h-10 w-10 overflow-hidden rounded-xl border border-ink"><ProductThumb p={p} /></div>
                    <span className="flex-1 text-sm"><b>{p.name}</b><br /><span className="text-cocoa">{SLOTS.find((s) => s.id === slot)?.label}</span></span>
                    <span className="text-sm font-semibold">{formatLKR(p.price)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center justify-between gap-4 border-t border-ink/10 px-5 py-4">
              <span className="font-display text-3xl">{formatLKR(total)}</span>
              <button ref={addBtn} onClick={addAll} disabled={!chosen.length} className="btn-cherry"><ShoppingBag className="h-4 w-4" /> Bag the stack</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
