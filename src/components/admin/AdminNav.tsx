"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Boxes, ExternalLink } from "lucide-react";
import clsx from "clsx";
import LogoutButton from "../account/LogoutButton";

const LINKS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/inventory", label: "Inventory", Icon: Boxes },
  { href: "/admin/customers", label: "Customers", Icon: Users },
];

export default function AdminNav({ name, email }: { name: string; email: string }) {
  const path = usePathname();
  return (
    <aside className="no-print sticky top-0 z-30 bg-ink text-cream md:h-screen">
      <div className="flex items-center justify-between px-5 py-4 md:block md:py-6">
        <div>
          <p className="font-display text-2xl italic">she ✦ things</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blush">back office</p>
        </div>
      </div>
      <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0" aria-label="Admin">
        {LINKS.map(({ href, label, Icon }) => {
          const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
          return (
            <Link key={href} href={href} className={clsx("flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition", active ? "bg-cream text-ink" : "text-cream/75 hover:bg-cream/10")}>
              <Icon className="h-4 w-4" /> {label}
            </Link>
          );
        })}
        <Link href="/" target="_blank" className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-cream/75 hover:bg-cream/10">
          <ExternalLink className="h-4 w-4" /> View shop
        </Link>
      </nav>
      <div className="absolute bottom-0 left-0 right-0 hidden border-t border-cream/10 p-5 md:block">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="truncate text-xs text-cream/60">{email}</p>
        <LogoutButton admin className="mt-3 w-full rounded-full border border-cream/30 py-2 text-sm font-semibold hover:bg-cream hover:text-ink" />
      </div>
    </aside>
  );
}
