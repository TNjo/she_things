"use client";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { Product } from "@/lib/types";
import JewelArt from "../JewelArt";
import { formatLKR } from "@/lib/money";
import { useStore } from "../providers/StoreProvider";
import { useAddToBag } from "./useAddToBag";

const TILES = ["bg-blush", "bg-butter", "bg-sage", "bg-petal", "bg-lime/70"];

export default function ProductCard({ p, index = 0, className }: { p: Product; index?: number; className?: string }) {
  const { wishlist, toggleWish, hydrated } = useStore();
  const add = useAddToBag();
  const wished = hydrated && wishlist.includes(p.id);
  const soldOut = p.stock <= 0;
  const low = !soldOut && p.stock <= p.lowStockThreshold;
  const badge = p.compareAt
    ? { t: `−${Math.round(100 - (p.price / p.compareAt) * 100)}%`, c: "bg-cherry text-white" }
    : p.material === "gold" ? { t: "22k gold", c: "bg-ink text-[#E9C46A]" }
    : p.isNew ? { t: "New drop!", c: "bg-butter text-ink" }
    : p.isBestseller ? { t: "Cult fave", c: "bg-white text-ink" }
    : null;

  const tile = TILES[index % TILES.length];

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={clsx("group relative", className)}
    >
      <div className="relative">
      <Link href={`/shop/${p.slug}`} className="block" aria-label={p.name}>
        <div
          className={clsx("relative aspect-[4/5] overflow-hidden rounded-[28px] transition-transform duration-300 group-hover:-rotate-1 group-hover:scale-[1.02]", p.images[0] ? "bg-white" : tile)}
        >
          {p.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="absolute inset-[8%] transition-transform duration-700 ease-out group-hover:scale-110">
              <JewelArt art={p.art} bare title={p.name} />
            </div>
          )}
          {badge && <span className={clsx("sticker absolute left-4 top-4 -rotate-6", badge.c)}>{badge.t}</span>}
          {soldOut && (
            <div className="absolute inset-0 grid place-items-center bg-paper/50 backdrop-blur-[2px]">
              <span className="rotate-[-8deg] rounded-full bg-ink px-5 py-2 font-hand text-[30px] leading-none text-white">aney, sold out</span>
            </div>
          )}
        </div>
      </Link>

      <button
        onClick={() => toggleWish(p.id)}
        aria-pressed={wished}
        aria-label={wished ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
        className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-white transition hover:scale-110"
      >
        <Heart className={clsx("h-[18px] w-[18px] transition", wished && "fill-cherry text-cherry")} />
      </button>

      {!soldOut && (
        <button
          onClick={(e) => add(p, 1, e.currentTarget)}
          className="absolute inset-x-5 bottom-5 hidden min-h-[44px] translate-y-2 items-center justify-center gap-2 rounded-full bg-ink text-sm font-bold text-white opacity-0 transition duration-300 hover:bg-cherry group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 md:flex"
          aria-label={`Add ${p.name} to bag`}
        >
          <Plus className="h-4 w-4" aria-hidden /> Add to bag
        </button>
      )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <Link href={`/shop/${p.slug}`} className="block truncate font-display text-[24px] uppercase leading-tight transition-colors hover:text-cherry">{p.name}</Link>
          <p className="mt-0.5 truncate text-[13px] text-cocoa">{p.tagline}</p>
          <p className="mt-2 flex items-baseline gap-2 text-[15px]">
            <span className="font-bold">{formatLKR(p.price)}</span>
            {p.compareAt && <span className="text-sm text-cocoa line-through">{formatLKR(p.compareAt)}</span>}
            {low && <span className="text-xs font-semibold text-cherry">Only {p.stock} left</span>}
          </p>
        </div>
        {!soldOut && (
          <button
            onClick={(e) => add(p, 1, e.currentTarget)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-white transition hover:bg-cherry active:scale-90 md:hidden"
            aria-label={`Add ${p.name} to bag`}
          >
            <Plus className="h-5 w-5" aria-hidden />
          </button>
        )}
      </div>
    </motion.article>
  );
}
