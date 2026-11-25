"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/lib/types";
import ProductCard from "../product/ProductCard";

const CATS = [["", "All"], ["earrings", "Earrings"], ["necklaces", "Necklaces"], ["rings", "Rings"], ["bracelets", "Bracelets"], ["anklets", "Anklets"], ["sets", "Gift sets"]] as const;
const METALS = [["", "Any metal"], ["gold", "22k gold"], ["gold-plated", "Gold plated"], ["sterling-silver", "Sterling silver"], ["silver", "Silver"], ["rose-gold", "Rose gold"], ["pearl", "Pearl"]] as const;
const VIBES = ["minimal", "romantic", "bold", "boho", "vintage", "y2k"] as const;
const SORTS = [["", "Featured"], ["new", "Newest"], ["price-asc", "Price: low → high"], ["price-desc", "Price: high → low"], ["rating", "Top rated"]] as const;

interface Filters { c: string; m: string; v: string; q: string; sort: string }

export default function ShopClient({ products, initial }: { products: Product[]; initial: Filters }) {
  const router = useRouter();
  const [f, setF] = useState<Filters>(initial);
  const [maxPrice, setMaxPrice] = useState(0);
  const [inStock, setInStock] = useState(false);
  const [sheet, setSheet] = useState(false);
  const priceCap = useMemo(() => Math.max(...products.map((p) => p.price), 1000), [products]);

  // header search / nav links change the URL while we're mounted
  useEffect(() => {
    setF(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.c, initial.m, initial.v, initial.q, initial.sort]);

  // keep URL shareable
  useEffect(() => {
    const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v) as [string, string][]).toString();
    router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false });
  }, [f, router]);

  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    let r = products.filter(
      (p) =>
        (!f.c || p.category === f.c) &&
        (!f.m || p.material === f.m) &&
        (!f.v || p.vibes.includes(f.v as Product["vibes"][number])) &&
        (!maxPrice || p.price <= maxPrice) &&
        (!inStock || p.stock > 0) &&
        (!q || `${p.name} ${p.tagline} ${p.material} ${p.category} ${p.vibes.join(" ")}`.toLowerCase().includes(q)),
    );
    const s = f.sort;
    r = [...r].sort((a, b) =>
      s === "price-asc" ? a.price - b.price
      : s === "price-desc" ? b.price - a.price
      : s === "rating" ? b.rating - a.rating
      : s === "new" ? b.createdAt.localeCompare(a.createdAt)
      : Number(!!b.isBestseller) - Number(!!a.isBestseller) || Number(b.stock > 0) - Number(a.stock > 0),
    );
    return r;
  }, [products, f, maxPrice, inStock]);

  const set = (k: keyof Filters, v: string) => setF((x) => ({ ...x, [k]: x[k] === v ? "" : v }));
  const title = CATS.find(([k]) => k === f.c)?.[1] ?? "All";
  const activeCount = [f.m, f.v, maxPrice ? "1" : "", inStock ? "1" : ""].filter(Boolean).length;

  const filterPanel = (
    <div className="space-y-7">
      <Group title="Metal">
        {METALS.map(([k, l]) => <button key={k} className="chip" data-active={f.m === k} onClick={() => setF((x) => ({ ...x, m: k }))}>{l}</button>)}
      </Group>
      <Group title="Vibe">
        {VIBES.map((v) => <button key={v} className="chip capitalize" data-active={f.v === v} onClick={() => set("v", v)}>{v === "y2k" ? "Y2K" : v}</button>)}
      </Group>
      <div>
        <p className="label">Max price {maxPrice ? `· Rs ${maxPrice.toLocaleString()}` : ""}</p>
        <input type="range" min={1000} max={priceCap} step={500} value={maxPrice || priceCap} onChange={(e) => setMaxPrice(Number(e.target.value) >= priceCap ? 0 : Number(e.target.value))} className="w-full accent-cherry" aria-label="Maximum price" />
      </div>
      <label className="flex cursor-pointer items-center gap-3 font-semibold">
        <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="h-5 w-5 accent-cherry" /> In stock only
      </label>
      {activeCount > 0 && <button className="text-sm font-semibold underline" onClick={() => { setF((x) => ({ ...x, m: "", v: "" })); setMaxPrice(0); setInStock(false); }}>Clear filters</button>}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-8 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-hand text-[32px] text-cherry">{list.length} little things</p>
          <h1 className="text-6xl leading-none md:text-8xl">{f.q ? <>“<i>{f.q}</i>”</> : title === "All" ? <>Shop <i>all</i></> : <i>{title}</i>}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSheet(true)} className="chip md:hidden"><SlidersHorizontal className="h-4 w-4" /> Filter{activeCount ? ` (${activeCount})` : ""}</button>
          <select value={f.sort} onChange={(e) => setF((x) => ({ ...x, sort: e.target.value }))} className="chip cursor-pointer bg-transparent pr-8 outline-none" aria-label="Sort">
            {SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {CATS.map(([k, l]) => <button key={k} className="chip shrink-0" data-active={f.c === k} onClick={() => setF((x) => ({ ...x, c: k }))}>{l}</button>)}
        {f.q && <button className="chip shrink-0 bg-butter" onClick={() => setF((x) => ({ ...x, q: "" }))}>“{f.q}” <X className="h-3.5 w-3.5" /></button>}
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-[240px_1fr]">
        <aside className="hidden md:block"><div className="sticky top-28">{filterPanel}</div></aside>
        <div>
          {list.length === 0 ? (
            <div className="card grid place-items-center px-6 py-20 text-center">
              <p className="font-display text-4xl italic">Nothing here… yet.</p>
              <p className="mt-2 text-cocoa">Try fewer filters, or ask us on WhatsApp – we might have it in the back.</p>
              <button className="btn-ink mt-6" onClick={() => { setF({ c: "", m: "", v: "", q: "", sort: "" }); setMaxPrice(0); setInStock(false); }}>Show everything</button>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-8 lg:grid-cols-3">
              {list.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {sheet && (
          <>
            <motion.div className="fixed inset-0 z-[75] bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
            <motion.div className="fixed inset-x-0 bottom-0 z-[76] max-h-[85vh] overflow-y-auto rounded-t-[32px] border-t border-ink/10 bg-paper p-6 pb-10" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} role="dialog" aria-label="Filters">
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-ink/20" />
              {filterPanel}
              <button className="btn-ink mt-8 w-full" onClick={() => setSheet(false)}>Show {list.length} pieces</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
