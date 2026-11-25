"use client";
import type { JewelArtSpec, Product } from "@/lib/types";
import JewelArt from "../JewelArt";

/** How an earring is shown on the Ear Stack Studio ear: cut-out > round photo pin > drawing */
export interface TryOnLook {
  art: JewelArtSpec;
  cutout?: string;
  photo?: string;
}

export const tryOnLook = (p: Pick<Product, "art" | "cutoutImage" | "images">): TryOnLook => ({
  art: p.art,
  cutout: p.cutoutImage,
  photo: p.images[0],
});

/** Thumbnail for pickers: real product photo if there is one, else the drawing */
export function ProductThumb({ p }: { p: Pick<Product, "images" | "art" | "name"> }) {
  if (p.images[0]) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" loading="lazy" />;
  }
  return <JewelArt art={p.art} title={p.name} />;
}
