"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { JewelArtSpec } from "@/lib/types";
import { MAX_QTY_PER_ITEM } from "@/lib/pricing";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number; // display only – server recalculates
  art: JewelArtSpec;
  image?: string;
  qty: number;
  maxQty: number;
}

interface Toast { id: number; text: string; tone: "ok" | "err" }

interface StoreCtx {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => boolean;
  setQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  wishlist: string[];
  toggleWish: (productId: string) => void;
  recent: string[];
  pushRecent: (productId: string) => void;
  toast: (text: string, tone?: Toast["tone"]) => void;
  hydrated: boolean;
}

const Ctx = createContext<StoreCtx | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / disabled – the shop still works for this visit */
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const tid = useRef(0);

  useEffect(() => {
    const c = load<CartItem[]>("st_cart", []);
    setCart(Array.isArray(c) ? c.filter((i) => i && typeof i.productId === "string" && i.qty > 0) : []);
    setWishlist(load<string[]>("st_wish", []));
    setRecent(load<string[]>("st_recent", []));
    setHydrated(true);
    // keep tabs in sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === "st_cart") setCart(load("st_cart", []));
      if (e.key === "st_wish") setWishlist(load("st_wish", []));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => { if (hydrated) save("st_cart", cart); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) save("st_wish", wishlist); }, [wishlist, hydrated]);
  useEffect(() => { if (hydrated) save("st_recent", recent); }, [recent, hydrated]);

  const toast = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = ++tid.current;
    setToasts((t) => [...t.slice(-2), { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const addToCart = useCallback<StoreCtx["addToCart"]>((item, qty = 1) => {
    const limit = Math.min(item.maxQty, MAX_QTY_PER_ITEM);
    if (limit <= 0) {
      toast("Sorry, that one's sold out", "err");
      return false;
    }
    let capped = false;
    setCart((c) => {
      const existing = c.find((i) => i.productId === item.productId);
      if (existing) {
        const next = Math.min(existing.qty + qty, limit);
        capped = next < existing.qty + qty;
        return c.map((i) => (i.productId === item.productId ? { ...i, ...item, qty: next } : i));
      }
      capped = qty > limit;
      return [...c, { ...item, qty: Math.min(qty, limit) }];
    });
    if (capped) toast(`Only ${limit} available – we've added the max`, "err");
    return true;
  }, [toast]);

  const setQty = useCallback((productId: string, qty: number) => {
    setCart((c) =>
      c.flatMap((i) => (i.productId !== productId ? [i] : qty <= 0 ? [] : [{ ...i, qty: Math.min(qty, i.maxQty, MAX_QTY_PER_ITEM) }])),
    );
  }, []);

  const value = useMemo<StoreCtx>(() => ({
    cart,
    cartCount: cart.reduce((s, i) => s + i.qty, 0),
    subtotal: cart.reduce((s, i) => s + i.qty * i.price, 0),
    addToCart,
    setQty,
    removeFromCart: (id) => setCart((c) => c.filter((i) => i.productId !== id)),
    clearCart: () => setCart([]),
    cartOpen,
    setCartOpen,
    wishlist,
    toggleWish: (id) => setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [id, ...w].slice(0, 100))),
    recent,
    pushRecent: (id) => setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 12)),
    toast,
    hydrated,
  }), [cart, addToCart, setQty, cartOpen, wishlist, recent, toast, hydrated]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex flex-col items-center gap-2 px-4 md:bottom-8" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ y: 30, opacity: 0, rotate: -3 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 10, opacity: 0 }}
              className={`pointer-events-auto rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold shadow-soft ${t.tone === "ok" ? "bg-butter" : "bg-cherry text-white"}`}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside StoreProvider");
  return v;
}
