"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Search, ShoppingBag, User, X, Menu } from "lucide-react";
import Logo from "./Logo";
import { useStore } from "../providers/StoreProvider";

const NAV = [
  { href: "/shop?c=earrings", label: "Earrings", note: "the main event" },
  { href: "/shop", label: "Shop all" },
  { href: "/stack", label: "Ear Stack Studio", note: "new" },
  { href: "/quiz", label: "Vibe quiz" },
  { href: "/track", label: "Track order" },
];

export default function Header() {
  const { cartCount, setCartOpen, wishlist, hydrated } = useStore();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { setMenu(false); setSearch(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menu]);

  return (
    <>
      <div className="relative z-40 overflow-hidden bg-ink py-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-cream">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-10" aria-hidden={k === 1}>
              <span>Free island-wide delivery over Rs 10,000</span><span className="text-blush">✦</span>
              <span>Pay in 3 with Koko or Mintpay</span><span className="text-blush">✦</span>
              <span>Code HELLOSHE = 10% off your first order</span><span className="text-blush">✦</span>
              <span>Gift-wrapped by hand in Colombo</span><span className="text-blush">✦</span>
            </div>
          ))}
        </div>
      </div>

      <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "bg-paper/85 shadow-[0_1px_0_0_#1C19171F] backdrop-blur-md" : "bg-transparent"}`}>
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:h-20 md:px-8">
          <button className="-ml-2 rounded-full p-2 lg:hidden" aria-label="Open menu" onClick={() => setMenu(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {NAV.slice(0, 5).map((n) => (
              <Link key={n.href} href={n.href} className="group relative text-[15px] font-semibold">
                {n.label}
                {n.note === "new" && <span className="sticker absolute -right-7 -top-3 rotate-12 bg-cherry px-1.5 py-0.5 text-[9px] text-white">new</span>}
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-cherry transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-0.5 md:gap-1.5">
            <IconBtn label="Search" onClick={() => setSearch((s) => !s)}><Search className="h-[21px] w-[21px]" /></IconBtn>
            <Link href="/wishlist" aria-label="Wishlist" className="relative hidden rounded-full p-2.5 hover:bg-ink/5 sm:block">
              <Heart className="h-[21px] w-[21px]" />
              {hydrated && wishlist.length > 0 && <Dot n={wishlist.length} />}
            </Link>
            <Link href="/account" aria-label="Account" className="hidden rounded-full p-2.5 hover:bg-ink/5 sm:block"><User className="h-[21px] w-[21px]" /></Link>
            <button onClick={() => setCartOpen(true)} aria-label={`Open bag, ${cartCount} items`} className="relative rounded-full p-2.5 hover:bg-ink/5" data-bag-icon>
              <ShoppingBag className="h-[21px] w-[21px]" />
              {hydrated && cartCount > 0 && <Dot n={cartCount} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {search && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-line"
              onSubmit={(e) => { e.preventDefault(); router.push(`/shop?q=${encodeURIComponent(q.trim())}`); }}
            >
              <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-4 md:px-8">
                <Search className="h-5 w-5 text-cocoa" />
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} maxLength={60} placeholder="hoops, pearls, gold, gifts for her…" className="w-full bg-transparent font-display text-2xl italic outline-none placeholder:text-ink/30 md:text-3xl" aria-label="Search products" />
                <button type="submit" className="btn-ink py-2.5">Search</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div className="fixed inset-0 z-[70] flex flex-col bg-blush lg:hidden" initial={{ clipPath: "circle(0% at 8% 4%)" }} animate={{ clipPath: "circle(150% at 8% 4%)" }} exit={{ clipPath: "circle(0% at 8% 4%)" }} transition={{ duration: 0.55, ease: [0.7, 0, 0.2, 1] }}>
            <div className="flex h-16 items-center justify-between px-4">
              <Logo />
              <button onClick={() => setMenu(false)} aria-label="Close menu" className="rounded-full border border-ink/10 p-2"><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex flex-1 flex-col justify-center gap-1 px-6" aria-label="Mobile">
              {NAV.map((n, i) => (
                <motion.div key={n.href} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.05 }}>
                  <Link href={n.href} className="flex items-baseline gap-3 py-1.5 font-display text-[44px] leading-tight">
                    {n.label}
                    {n.note && <span className="font-hand text-[28px] text-cherry">{n.note}</span>}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="flex gap-3 p-6">
              <Link href="/account" className="btn-ink flex-1">My account</Link>
              <Link href="/wishlist" className="btn-ghost flex-1">Wishlist</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function IconBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return <button onClick={onClick} aria-label={label} className="rounded-full p-2.5 hover:bg-ink/5">{children}</button>;
}

function Dot({ n }: { n: number }) {
  return (
    <motion.span key={n} initial={{ scale: 0.4 }} animate={{ scale: 1 }} className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-cherry px-1 text-[10px] font-bold text-white">
      {n > 99 ? "99+" : n}
    </motion.span>
  );
}
