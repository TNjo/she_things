"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X, Truck } from "lucide-react";
import { useEffect } from "react";
import { useStore } from "../providers/StoreProvider";
import JewelArt from "../JewelArt";
import ProductImage from "@/components/ProductImage";
import { formatLKR, instalment } from "@/lib/money";
import { FREE_SHIPPING_OVER } from "@/lib/pricing";

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, setQty, removeFromCart, subtotal } = useStore();
  const remaining = Math.max(0, FREE_SHIPPING_OVER - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_OVER) * 100);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCartOpen]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div className="fixed inset-0 z-[75] bg-ink/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            className="fixed bottom-0 right-0 top-0 z-[76] flex w-full max-w-[440px] flex-col border-l border-ink/10 bg-paper"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-3xl italic">Your bag</h2>
              <button onClick={() => setCartOpen(false)} className="rounded-full border border-ink/10 p-1.5" aria-label="Close bag"><X className="h-5 w-5" /></button>
            </div>

            {cart.length > 0 && (
              <div className="border-b border-line px-5 py-3">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Truck className="h-4 w-4" />
                  {remaining > 0 ? <>You&apos;re {formatLKR(remaining)} away from free delivery</> : <>Free island-wide delivery unlocked</>}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10">
                  <motion.div className="h-full rounded-full bg-cherry" initial={{ width: 0 }} animate={{ width: `${pct}%` }} />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="h-32 w-32 animate-sway"><JewelArt art={{ kind: "hoop", metal: "gold" }} bare /></div>
                  <p className="mt-4 font-display text-2xl italic">Empty bag, bare ears.</p>
                  <p className="mt-1 text-sm text-cocoa">Let&apos;s fix both.</p>
                  <Link href="/shop?c=earrings" onClick={() => setCartOpen(false)} className="btn-ink mt-6">Shop earrings</Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {cart.map((it) => (
                    <motion.li layout key={it.productId} className="flex gap-3.5">
                      <Link href={`/shop/${it.slug}`} onClick={() => setCartOpen(false)} className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-ink/10">
                        <ProductImage src={it.image} art={it.art} alt={it.name} />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <p className="truncate font-semibold">{it.name}</p>
                          <button onClick={() => removeFromCart(it.productId)} className="text-xs font-semibold text-cocoa underline-offset-2 hover:underline">Remove</button>
                        </div>
                        <p className="text-sm text-cocoa">{formatLKR(it.price)}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-ink/10">
                            <button onClick={() => setQty(it.productId, it.qty - 1)} className="p-1.5" aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                            <span className="w-7 text-center text-sm font-bold" aria-live="polite">{it.qty}</span>
                            <button onClick={() => setQty(it.productId, it.qty + 1)} disabled={it.qty >= it.maxQty} className="p-1.5 disabled:opacity-30" aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                          </div>
                          <span className="font-bold">{formatLKR(it.price * it.qty)}</span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-ink/10 bg-cream px-5 pb-6 pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold uppercase tracking-widest">Subtotal</span>
                  <span className="font-display text-3xl">{formatLKR(subtotal)}</span>
                </div>
                <p className="mt-1 text-xs text-cocoa">or 3 × {instalment(subtotal)} with Koko / Mintpay. Delivery calculated at checkout.</p>
                <Link href="/checkout" onClick={() => setCartOpen(false)} className="btn-cherry mt-4 w-full text-base">Checkout</Link>
                <button onClick={() => setCartOpen(false)} className="mt-2 w-full py-2 text-sm font-semibold underline-offset-4 hover:underline">Keep browsing</button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
