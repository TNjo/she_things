import Link from "next/link";
import NewsletterForm from "./NewsletterForm";
import { PHOTO_CREDITS } from "@/lib/photos";

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-ink pb-28 pt-16 text-cream md:pb-10">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-4xl italic leading-tight md:text-5xl">Join the <span className="text-blush">She List.</span></p>
            <p className="mt-3 max-w-sm text-cream/70">Early access to drops, restock alerts and the occasional love letter. No spam, pinky promise.</p>
            <NewsletterForm />
          </div>
          <FooterCol title="Shop" links={[["Earrings", "/shop?c=earrings"], ["Necklaces", "/shop?c=necklaces"], ["Rings", "/shop?c=rings"], ["Real gold", "/shop?m=gold"], ["Gift sets", "/shop?c=sets"]]} />
          <FooterCol title="Play" links={[["Ear Stack Studio", "/stack"], ["Vibe quiz", "/quiz"], ["Wishlist", "/wishlist"]]} />
          <FooterCol title="Help" links={[["Track my order", "/track"], ["My account", "/account"], ["Delivery & returns", "/help#delivery"], ["Jewellery care", "/help#care"], ["Payments", "/help#payments"]]} />
        </div>
        <div className="mt-16 select-none font-display text-[22vw] italic leading-[0.8] text-cream/[0.06] md:text-[16vw]" aria-hidden>
          she things
        </div>
        <div className="mt-6 flex flex-col justify-between gap-3 border-t border-cream/15 pt-6 text-xs text-cream/60 md:flex-row">
          <p>© {new Date().getFullYear()} She Things. Handpicked & packed in Colombo, Sri Lanka.</p>
          <p>Visa · Mastercard · Amex · Koko · Mintpay · Bank transfer · Cash on delivery</p>
        </div>
        <p className="mt-3 text-[11px] text-cream/40">
          Mood photography via <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-cream">Unsplash</a>: {PHOTO_CREDITS.join(", ")}.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-blush">{title}</p>
      <ul className="space-y-2.5">
        {links.map(([l, h]) => (
          <li key={h}><Link href={h} className="text-cream/85 transition hover:pl-1 hover:text-white">{l}</Link></li>
        ))}
      </ul>
    </div>
  );
}
