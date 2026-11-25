"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { ArtKind, Product } from "@/lib/types";
import JewelArt from "../JewelArt";
import { api, isApiError } from "@/lib/client/api";

const KINDS: ArtKind[] = ["hoop", "huggie", "drop", "stud", "pearl-drop", "chandelier", "cuff", "star", "heart", "flower", "chain", "pendant", "ring", "bangle", "anklet"];
const VIBES = ["minimal", "romantic", "bold", "boho", "vintage", "y2k"] as const;
const SPOTS = ["lobe", "upper-lobe", "helix", "tragus", "conch"] as const;
const BGS = ["#F8E6EA", "#F3D3DC", "#F3E6CC", "#DDE3D3", "#F5EFE9", "#1C1917"];

function F({ err, children }: { err?: string; children: React.ReactNode }) {
  return <div>{children}{err && <p className="mt-1 text-sm text-cherry">{err}</p>}</div>;
}

const slugify =(s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [v, setV] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    tagline: product?.tagline ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "earrings",
    material: product?.material ?? "gold-plated",
    vibes: product?.vibes ?? [],
    price: product?.price ?? 0,
    compareAt: product?.compareAt ?? 0,
    stock: product?.stock ?? 0,
    lowStockThreshold: product?.lowStockThreshold ?? 5,
    sku: product?.sku ?? "",
    images: (product?.images ?? []).join("\n"),
    cutoutImage: product?.cutoutImage ?? "",
    art: { kind: product?.art.kind ?? "hoop", metal: product?.art.metal ?? "gold", gem: product?.art.gem ?? "", bg: product?.art.bg ?? "#F8E6EA" },
    earSpots: product?.earSpots ?? [],
    isNew: product?.isNew ?? false,
    isBestseller: product?.isBestseller ?? false,
    hypoallergenic: product?.hypoallergenic ?? false,
    antiTarnish: product?.antiTarnish ?? false,
    active: product?.active ?? true,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [confirmDel, setConfirmDel] = useState(false);

  const set = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) => setV((x) => ({ ...x, [k]: val }));
  const toggle = <T extends string>(arr: T[], item: T) => (arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setFields({});
    try {
      const body = {
        ...v,
        slug: v.slug || slugify(v.name),
        compareAt: v.compareAt || null,
        images: v.images.split("\n").map((s) => s.trim()).filter(Boolean),
        earSpots: v.category === "earrings" ? v.earSpots : [],
      };
      if (product) await api(`/api/admin/products/${product.id}`, { method: "PATCH", body });
      else await api("/api/admin/products", { body });
      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      if (isApiError(e)) { setErr(e.message); if (e.fields) setFields(e.fields); } else setErr("Save failed");
      setBusy(false);
    }
  }

  async function remove() {
    if (!product) return;
    setBusy(true);
    try {
      const r = await api<{ archived?: boolean }>(`/api/admin/products/${product.id}`, { method: "DELETE" });
      if (r.archived) setErr("This product has orders, so it was hidden from the shop instead of deleted.");
      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      setErr(isApiError(e) ? e.message : "Delete failed");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="grid gap-6 xl:grid-cols-[1fr_320px]" noValidate>
      <div className="space-y-6 rounded-[24px] border border-ink/10 bg-cream p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <F err={fields.name}><label className="label">Name</label><input className="field" value={v.name} onChange={(e) => { set("name", e.target.value); if (!product) set("slug", slugify(e.target.value)); }} /></F>
          <F err={fields.slug}><label className="label">URL slug</label><input className="field font-mono" value={v.slug} onChange={(e) => set("slug", e.target.value)} /></F>
          <F err={fields.tagline}><label className="label">Tagline</label><input className="field" value={v.tagline} onChange={(e) => set("tagline", e.target.value)} /></F>
          <F err={fields.sku}><label className="label">SKU</label><input className="field font-mono" value={v.sku} onChange={(e) => set("sku", e.target.value.toUpperCase())} /></F>
        </div>
        <F err={fields.description}><label className="label">Description</label><textarea rows={4} className="field" value={v.description} onChange={(e) => set("description", e.target.value)} /></F>
        <div className="grid gap-4 sm:grid-cols-4">
          <F err={fields.price}><label className="label">Price (Rs)</label><input type="number" min={0} className="field" value={v.price || ""} onChange={(e) => set("price", Math.round(Number(e.target.value)))} /></F>
          <F err={fields.compareAt}><label className="label">Was (optional)</label><input type="number" min={0} className="field" value={v.compareAt || ""} onChange={(e) => set("compareAt", Math.round(Number(e.target.value)))} /></F>
          <F err={fields.stock}><label className="label">Stock</label><input type="number" min={0} className="field" value={v.stock} onChange={(e) => set("stock", Math.max(0, Math.round(Number(e.target.value))))} /></F>
          <F err={fields.lowStockThreshold}><label className="label">Low-stock alert at</label><input type="number" min={0} className="field" value={v.lowStockThreshold} onChange={(e) => set("lowStockThreshold", Math.max(0, Math.round(Number(e.target.value))))} /></F>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Category</label>
            <select className="field" value={v.category} onChange={(e) => set("category", e.target.value as Product["category"])}>
              {["earrings", "necklaces", "rings", "bracelets", "anklets", "sets"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="label">Material</label>
            <select className="field" value={v.material} onChange={(e) => set("material", e.target.value as Product["material"])}>
              {["gold", "gold-plated", "silver", "sterling-silver", "rose-gold", "pearl", "brass"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div><p className="label">Vibes</p><div className="flex flex-wrap gap-2">{VIBES.map((x) => <button type="button" key={x} className="chip" data-active={v.vibes.includes(x)} onClick={() => set("vibes", toggle(v.vibes, x))}>{x}</button>)}</div></div>
        {v.category === "earrings" && (
          <div><p className="label">Ear spots (for Ear Stack Studio)</p><div className="flex flex-wrap gap-2">{SPOTS.map((x) => <button type="button" key={x} className="chip" data-active={v.earSpots.includes(x)} onClick={() => set("earSpots", toggle(v.earSpots, x))}>{x}</button>)}</div></div>
        )}
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {(["active", "isNew", "isBestseller", "antiTarnish", "hypoallergenic"] as const).map((k) => (
            <label key={k} className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={v[k]} onChange={(e) => set(k, e.target.checked)} className="h-4 w-4 accent-cherry" />
              {{ active: "Visible in shop", isNew: "New drop", isBestseller: "Bestseller", antiTarnish: "Anti-tarnish", hypoallergenic: "Hypoallergenic" }[k]}
            </label>
          ))}
        </div>
        <F err={fields.images}><label className="label">Photo URLs (https, one per line – optional)</label><textarea rows={2} className="field font-mono text-sm" value={v.images} onChange={(e) => set("images", e.target.value)} placeholder="https://…" /></F>
        {v.category === "earrings" && (
          <F err={fields.cutoutImage}>
            <label className="label">Try-on cut-out (optional)</label>
            <input className="field font-mono text-sm" value={v.cutoutImage} onChange={(e) => set("cutoutImage", e.target.value)} placeholder="https://… transparent PNG of ONE earring" />
            <p className="mt-1 text-xs text-cocoa">One earring with the background removed (remove.bg / Canva), hanging point at the top. Optional: Ear Stack Studio shows a round photo pin without it; with a cut-out the earring sits right on the ear.</p>
          </F>
        )}
        {err && <p className="rounded-xl bg-petal p-3 text-sm font-semibold text-cherry" role="alert">{err}</p>}
        <div className="flex flex-wrap gap-3">
          <button disabled={busy} className="btn-ink">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : product ? "Save changes" : "Create product"}</button>
          {product && (confirmDel ? (
            <span className="flex items-center gap-2 text-sm">Delete for good? <button type="button" onClick={remove} className="btn-cherry py-2">Yes</button><button type="button" onClick={() => setConfirmDel(false)} className="btn-ghost py-2">No</button></span>
          ) : <button type="button" onClick={() => setConfirmDel(true)} className="btn-ghost">Delete</button>)}
        </div>
      </div>

      <aside className="space-y-4 rounded-[24px] border border-ink/10 bg-cream p-5 xl:sticky xl:top-6 xl:self-start">
        <p className="label">Artwork preview</p>
        <div className="arch aspect-[4/5] overflow-hidden border border-ink/10"><JewelArt art={{ ...v.art, gem: v.art.gem || undefined }} sway /></div>
        <div><label className="label">Shape</label>
          <select className="field" value={v.art.kind} onChange={(e) => set("art", { ...v.art, kind: e.target.value as ArtKind })}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select>
        </div>
        <div className="flex gap-2">{(["gold", "silver", "rose"] as const).map((m) => <button type="button" key={m} className="chip" data-active={v.art.metal === m} onClick={() => set("art", { ...v.art, metal: m })}>{m}</button>)}</div>
        <div className="flex items-center gap-3"><label className="label m-0">Gem</label><input type="color" value={v.art.gem || "#b8202f"} onChange={(e) => set("art", { ...v.art, gem: e.target.value })} className="h-9 w-14 cursor-pointer rounded border border-ink" /><button type="button" className="text-xs underline" onClick={() => set("art", { ...v.art, gem: "" })}>none</button></div>
        <div><p className="label">Background</p><div className="flex gap-2">{BGS.map((b) => <button type="button" key={b} onClick={() => set("art", { ...v.art, bg: b })} className={`h-8 w-8 rounded-full border ${v.art.bg === b ? "border-ink ring-2 ring-cherry" : "border-ink/30"}`} style={{ background: b }} aria-label={`Background ${b}`} />)}</div></div>
        <p className="text-xs text-cocoa">Used until real photos are added above.</p>
      </aside>
    </form>
  );
}
