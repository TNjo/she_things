"use client";
import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import ProductCard from "../product/ProductCard";

export default function EarringRail({ products }: { products: Product[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section className="pt-24 md:pt-32">
      <div className="mx-auto flex max-w-[1400px] items-end justify-between gap-6 px-4 md:px-8">
        <div>
          <p className="font-hand text-[32px] text-cherry">the main event</p>
          <h2 className="text-5xl leading-[0.95] md:text-7xl">The Earring <i>Edit</i></h2>
        </div>
        <div className="hidden gap-2 md:flex">
          <button onClick={() => scroll(-1)} className="rounded-full border border-ink/10 p-3 hover:bg-ink hover:text-cream" aria-label="Scroll left"><ArrowLeft className="h-5 w-5" /></button>
          <button onClick={() => scroll(1)} className="rounded-full border border-ink/10 p-3 hover:bg-ink hover:text-cream" aria-label="Scroll right"><ArrowRight className="h-5 w-5" /></button>
        </div>
      </div>
      <div ref={rail} className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 md:gap-8 md:px-8">
        {products.map((p, i) => (
          <ProductCard key={p.id} p={p} index={i} className="w-[72vw] shrink-0 snap-start sm:w-[42vw] md:w-[300px]" />
        ))}
        <Link href="/shop?c=earrings" className="arch flex aspect-[4/5] w-[60vw] shrink-0 snap-start flex-col items-center justify-center border border-dashed border-ink/25 text-center sm:w-[36vw] md:w-[260px]">
          <span className="font-display text-4xl italic">See all</span>
          <span className="mt-1 text-sm font-semibold">{products.length} earrings →</span>
        </Link>
      </div>
    </section>
  );
}
