import Link from "next/link";
import Photo from "../Photo";
import { PHOTOS, type StockPhoto } from "@/lib/photos";

const cats: { label: string; href: string; photo: StockPhoto; bg: string; shape: string }[] = [
  { label: "Earrings", href: "/shop?c=earrings", photo: PHOTOS.twistedHoops, bg: "bg-pink", shape: "rounded-full" },
  { label: "Necklaces", href: "/shop?c=necklaces", photo: PHOTOS.snakeChain, bg: "bg-lime", shape: "rounded-[40px]" },
  { label: "Pearls", href: "/shop?m=pearl", photo: PHOTOS.pearls, bg: "bg-butter", shape: "arch" },
  { label: "Rings", href: "/shop?c=rings", photo: PHOTOS.ringsPink, bg: "bg-cobalt", shape: "rounded-full" },
  { label: "Bracelets", href: "/shop?c=bracelets", photo: PHOTOS.bracelet, bg: "bg-blush", shape: "rounded-[40px]" },
  { label: "Gift sets", href: "/shop?c=sets", photo: PHOTOS.ringDish, bg: "bg-sage", shape: "arch" },
];

export default function CategoryArches() {
  return (
    <section className="mx-auto mt-24 max-w-[1400px] px-4 md:mt-32 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-6xl md:text-8xl">What are we <i>shopping</i>?</h2>
        <p className="font-hand text-[32px] text-cherry">(it&apos;s earrings. it&apos;s always earrings.)</p>
      </div>
      <div className="no-scrollbar -mx-4 mt-10 flex snap-x gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-6 md:gap-5 md:overflow-visible md:px-0">
        {cats.map((c) => (
          <Link key={c.label} href={c.href} className={`group w-[42vw] shrink-0 snap-start rounded-[30px] p-3 transition-transform duration-300 hover:-rotate-3 hover:scale-[1.03] sm:w-[30vw] md:w-auto ${c.bg}`}>
            <div className={`overflow-hidden ${c.shape}`}>
              <Photo photo={c.photo} aspect={1} sizes="(min-width: 768px) 16vw, 42vw" imgClassName="transition-transform duration-700 group-hover:scale-110" />
            </div>
            <p className={`mt-3 text-center font-display text-2xl uppercase md:text-3xl ${c.bg === "bg-cobalt" ? "text-white" : "text-ink"}`}>{c.label}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
