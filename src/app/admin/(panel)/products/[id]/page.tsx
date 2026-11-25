import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageTitle } from "@/components/admin/ui";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "Edit product" };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await db.products.getById(id);
  if (!p) notFound();
  const log = (await db.inventory.list(id)).slice(0, 15);
  return (
    <>
      <Link href="/admin/products" className="text-sm font-semibold underline">← Products</Link>
      <PageTitle title={p.name} sub={`${p.sku} · ${p.stock} in stock`} action={<Link href={`/shop/${p.slug}`} target="_blank" className="chip">View in shop ↗</Link>} />
      <ProductForm product={p} />
      <section className="mt-8 rounded-[24px] border border-ink/10 bg-cream p-5">
        <h2 className="text-xl italic">Stock history</h2>
        <ul className="mt-3 divide-y divide-line text-sm">
          {log.map((l) => (
            <li key={l.id} className="flex justify-between gap-4 py-2">
              <span><b className={l.delta > 0 ? "text-green-800" : "text-cherry"}>{l.delta > 0 ? "+" : ""}{l.delta}</b> · {l.reason}</span>
              <span className="text-cocoa">{new Date(l.at).toLocaleString("en-LK")} · {l.by} · now {l.stockAfter}</span>
            </li>
          ))}
          {!log.length && <li className="py-2 text-cocoa">No stock movements yet.</li>}
        </ul>
      </section>
    </>
  );
}
