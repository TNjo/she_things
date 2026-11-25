"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Store, Heart, ShoppingBag } from "lucide-react";
import { useStore } from "../providers/StoreProvider";

/** App-style bottom bar on phones – thumbs live at the bottom of the screen */
export default function MobileTabBar() {
  const path = usePathname();
  const { cartCount, setCartOpen, hydrated } = useStore();
  if (path.startsWith("/admin") || path.startsWith("/checkout")) return null;
  const tabs = [
    { href: "/", label: "Home", Icon: Home },
    { href: "/shop", label: "Shop", Icon: Store },
    { href: "/stack", label: "Stack", Icon: Sparkles },
    { href: "/wishlist", label: "Saved", Icon: Heart },
  ];
  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 md:hidden" aria-label="Quick">
      <div className="flex items-center justify-between rounded-full border border-ink/10 bg-cream/95 px-2 py-1.5 shadow-soft backdrop-blur">
        {tabs.map(({ href, label, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href} className={`flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-bold ${active ? "text-cherry" : "text-ink/70"}`}>
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
              {label}
            </Link>
          );
        })}
        <button onClick={() => setCartOpen(true)} className="relative ml-1 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-cream" aria-label="Open bag">
          <ShoppingBag className="h-5 w-5" />
          {hydrated && cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cherry px-1 text-[10px] font-bold">{cartCount}</span>}
        </button>
      </div>
    </nav>
  );
}
