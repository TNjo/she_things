"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import ProductImage from "../ProductImage";
import Photo from "../Photo";
import { PHOTOS } from "@/lib/photos";
import { formatLKR } from "@/lib/money";

export default function GoldCorner({ products }: { products: Product[] }) {
  return (
    <section className="relative mt-24 overflow-hidden bg-ink py-20 text-white md:mt-36 md:py-28">
      <div className="pointer-events-none absolute -left-40 top-10 h-[520px] w-[520px] rounded-full bg-gold/25 blur-[140px]" aria-hidden />
      <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-4 md:grid-cols-12 md:px-8">
        <div className="md:col-span-5">
          <p className="eyebrow text-[#E9C46A]">The real-real corner</p>
          <h2 className="mt-3 text-5xl md:text-7xl">Solid <span className="gold-text italic">22k gold</span>, for keeps.</h2>
          <p className="mt-6 max-w-md text-white/70">
            Most of our pieces are plated and priced for playing. These ones are solid gold, hallmarked and certified — the kind you hand down one day.
          </p>
          <Link href="/shop?m=gold" className="btn mt-8 bg-[#E9C46A] text-ink hover:bg-white">Shop real gold</Link>
        </div>

        <div className="relative md:col-span-7">
          <div className="grid grid-cols-5 gap-4 md:gap-5">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="col-span-3">
              <Photo photo={PHOTOS.layered} aspect={4 / 5} sizes="(min-width: 768px) 30vw, 60vw" className="arch" />
            </motion.div>
            <div className="col-span-2 flex flex-col gap-4 pt-16 md:gap-5">
              {products.slice(0, 2).map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.15 * (i + 1) }}>
                  <Link href={`/shop/${p.slug}`} className="group block rounded-[24px] bg-white/[0.06] p-3 ring-1 ring-white/10 transition hover:bg-white/10">
                    <div className="aspect-square overflow-hidden rounded-[18px] bg-[#2a2420]">
                      <div className="h-full w-full transition-transform duration-700 group-hover:scale-110"><ProductImage src={p.images[0]} art={p.art} alt={p.name} /></div>
                    </div>
                    <p className="mt-3 truncate px-1 text-sm font-semibold">{p.name}</p>
                    <p className="px-1 text-sm text-[#E9C46A]">{formatLKR(p.price)}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
