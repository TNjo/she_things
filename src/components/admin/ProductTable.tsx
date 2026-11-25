"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Minus, Plus, Loader2 } from "lucide-react";
import clsx from "clsx";
import type { Product } from "@/lib/types";
import ProductImage from "@/components/ProductImage";
import { formatLKR } from "@/lib/money";
import { api, isApiError } from "@/lib/client/api";

export default function ProductTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out" | "hidden">("all");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  const list = useMemo(() => {
    const s = q.toLowerCase();
    return products
      .filter((p) => !s || `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(s))
      .filter((p) => filter === "all" || (filter === "low" ? p.stock > 0 && p.stock <= p.lowStockThreshold : filter === "out" ? p.stock === 0 : !p.active));
  }, [products, q, filter]);

  async function adjust(p: Product, delta: number) {
    setBusy(p.id + delta);
    setErr("");
    try {
      await api(`/api/admin/products/${p.id}/stock`, { body: { delta, reason: delta > 0 ? "Quick restock" : "Quick adjust" } });
      router.refresh();
    } catch (e) {
      setErr(isApiError(e) ? e.message : "Failed");
    } finally {
      setBusy("");
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or SKU…" className="field max-w-xs py-2.5" />
        {(["all", "low", "out", "hidden"] as const).map((f) => (
          <button key={f} className="chip" data-active={filter === f} onClick={() => setFilter(f)}>{f === "all" ? "All" : f === "low" ? "Low stock" : f === "out" ? "Sold out" : "Hidden"}</button>
        ))}
      </div>
      {err && <p className="mb-3 rounded-xl bg-petal p-3 text-sm font-semibold text-cherry" role="alert">{err}</p>}
      <div className="overflow-x-auto rounded-[24px] border border-ink/10 bg-cream">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-ink/10 text-left text-xs uppercase tracking-wider text-cocoa">
            <tr><th className="p-4">Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((p) => {
              const low = p.stock <= p.lowStockThreshold;
              return (
                <tr key={p.id} className={clsx("hover:bg-paper", !p.active && "opacity-50")}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-ink"><ProductImage src={p.images[0]} art={p.art} alt={p.name} /></div>
                      <div><p className="font-semibold">{p.name}</p><p className="font-mono text-xs text-cocoa">{p.sku}</p></div>
                    </div>
                  </td>
                  <td className="capitalize">{p.category}<br /><span className="text-xs text-cocoa">{p.material}</span></td>
                  <td className="font-semibold">{formatLKR(p.price)}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => adjust(p, -1)} disabled={!!busy || p.stock === 0} className="rounded-full border border-ink p-1 disabled:opacity-30" aria-label={`Remove one ${p.name}`}><Minus className="h-3.5 w-3.5" /></button>
                      <span className={clsx("w-10 text-center font-bold", p.stock === 0 ? "text-cherry" : low && "text-amber-700")}>
                        {busy.startsWith(p.id) ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : p.stock}
                      </span>
                      <button onClick={() => adjust(p, 1)} disabled={!!busy} className="rounded-full border border-ink p-1" aria-label={`Add one ${p.name}`}><Plus className="h-3.5 w-3.5" /></button>
                      <button onClick={() => adjust(p, 10)} disabled={!!busy} className="ml-1 rounded-full border border-ink px-2 py-0.5 text-xs font-bold">+10</button>
                    </div>
                  </td>
                  <td>{!p.active ? <span className="sticker bg-ink/10">hidden</span> : p.stock === 0 ? <span className="sticker bg-cherry text-white">sold out</span> : low ? <span className="sticker bg-butter">low</span> : <span className="sticker bg-sage">live</span>}</td>
                  <td className="pr-4 text-right"><Link href={`/admin/products/${p.id}`} className="font-semibold underline">Edit</Link></td>
                </tr>
              );
            })}
            {!list.length && <tr><td colSpan={6} className="p-8 text-center text-cocoa">No products match.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
