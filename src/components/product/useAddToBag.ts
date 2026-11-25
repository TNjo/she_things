"use client";
import { useCallback } from "react";
import type { Product } from "@/lib/types";
import { useStore } from "../providers/StoreProvider";
import { burst } from "../layout/Cursor";

export function useAddToBag() {
  const { addToCart, toast } = useStore();
  return useCallback(
    (p: Product, qty = 1, origin?: HTMLElement | null) => {
      const added = addToCart({ productId: p.id, slug: p.slug, name: p.name, price: p.price, art: p.art, image: p.images[0], maxQty: p.stock }, qty);
      if (!added) return;
      if (origin) {
        const r = origin.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, 16);
      }
      document.querySelectorAll<HTMLElement>("[data-bag-icon]").forEach((b) =>
        b.animate([{ transform: "scale(1)" }, { transform: "scale(1.35) rotate(-10deg)" }, { transform: "scale(1)" }], { duration: 450 }),
      );
      toast(`${p.name} is in your bag`);
    },
    [addToCart, toast],
  );
}
