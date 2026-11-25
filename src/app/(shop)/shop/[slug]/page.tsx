import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProductDetail from "@/components/product/ProductDetail";
import ProductCard from "@/components/product/ProductCard";

export const dynamic = "force-dynamic";
type P = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const { slug } = await params;
  const p = await db.products.getBySlug(slug);
  if (!p || !p.active) return { title: "Not found" };
  return { title: p.name, description: `${p.tagline}. ${p.description}`.slice(0, 160) };
}

export default async function ProductPage({ params }: { params: P }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) notFound();
  const p = await db.products.getBySlug(slug);
  if (!p || !p.active) notFound();

  const [reviews, all] = await Promise.all([db.reviews.listFor(p.id), db.products.list()]);
  const pairs = all
    .filter((x) => x.id !== p.id && x.stock > 0)
    .map((x) => ({ x, score: (x.category === "earrings" ? 2 : 0) + x.vibes.filter((v) => p.vibes.includes(v)).length + (x.art.metal === p.art.metal ? 1 : 0) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => s.x);

  return (
    <>
      <ProductDetail p={p} reviews={reviews} />
      <section className="mx-auto mt-24 max-w-[1400px] px-4 md:px-8">
        <p className="font-hand text-[32px] text-cherry">stack it with</p>
        <h2 className="text-5xl md:text-6xl">Complete the <i>look</i></h2>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-8">
          {pairs.map((x, i) => <ProductCard key={x.id} p={x} index={i} />)}
        </div>
      </section>
    </>
  );
}
