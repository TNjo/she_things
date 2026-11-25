"use client";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { useStore } from "../providers/StoreProvider";
import ProductCard from "../product/ProductCard";

export default function WishlistClient({ products }: { products: Product[] }) {
  const { wishlist, recent, hydrated } = useStore();
  const saved = wishlist.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[];
  const seen = recent.filter((id) => !wishlist.includes(id)).map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 4) as Product[];

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-10 md:px-8">
      <p className="font-hand text-[32px] text-cherry">things you&apos;re thinking about</p>
      <h1 className="text-6xl leading-none md:text-8xl">Wish<i>list</i></h1>
      {!hydrated ? null : saved.length === 0 ? (
        <div className="card mt-10 p-10 text-center">
          <p className="font-display text-3xl italic">Nothing saved yet</p>
          <p className="mt-2 text-cocoa">Tap the heart on anything you love – it lives here.</p>
          <Link href="/shop" className="btn-ink mt-6">Browse</Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-8">
          {saved.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
        </div>
      )}
      {hydrated && seen.length > 0 && (
        <section className="mt-20">
          <h2 className="text-4xl">Recently <i>viewed</i></h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-8">
            {seen.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
