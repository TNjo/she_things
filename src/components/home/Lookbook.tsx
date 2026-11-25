"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Photo from "../Photo";
import { PHOTOS, type StockPhoto } from "@/lib/photos";

const looks: { photo: StockPhoto; title: string; href: string; rot: number; bg: string; aspect: number }[] = [
  { photo: PHOTOS.colourHoop, title: "statement hoops = instant main character", href: "/shop?v=bold", rot: -4, bg: "bg-pink", aspect: 4 / 5 },
  { photo: PHOTOS.pearlDrop, title: "pearls for golden hour", href: "/shop?v=romantic", rot: 3, bg: "bg-butter", aspect: 4 / 5 },
  { photo: PHOTOS.marbleHoop, title: "y2k resin, very 2003", href: "/shop?v=y2k", rot: -2, bg: "bg-lime", aspect: 4 / 5 },
  { photo: PHOTOS.whiteShirt, title: "white shirt + tiny drops", href: "/shop?v=minimal", rot: 5, bg: "bg-blush", aspect: 4 / 5 },
  { photo: PHOTOS.twistedHoops, title: "the everyday twist", href: "/shop?c=earrings", rot: -5, bg: "bg-cobalt", aspect: 4 / 5 },
];

export default function Lookbook() {
  return (
    <section className="relative mt-24 overflow-hidden bg-ink py-20 text-white md:mt-32 md:py-28">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-[16vw] leading-[0.85] md:text-[9vw] xl:text-[130px]">
            How do u<br /><span className="text-lime">wear yours?</span>
          </h2>
          <p className="max-w-xs font-hand text-[34px] leading-none text-blush">our mood board rn → tap one to shop the vibe</p>
        </div>
        <div className="no-scrollbar -mx-4 mt-14 flex snap-x gap-6 overflow-x-auto px-4 pb-10 pt-6 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
          {looks.map((l, i) => (
            <motion.div
              key={l.title}
              initial={{ opacity: 0, y: 60, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: l.rot }}
              whileHover={{ rotate: 0, y: -10, scale: 1.04 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", stiffness: 180, damping: 18, delay: i * 0.06 }}
              className={`w-[62vw] shrink-0 snap-center sm:w-[40vw] md:w-auto ${i % 2 ? "md:mt-16" : ""}`}
            >
              <Link href={l.href} className={`relative block rounded-[22px] p-2.5 pb-3 text-ink ${l.bg} ${l.bg === "bg-cobalt" ? "text-white" : ""}`}>
                <span className="tape -top-3 left-6 rotate-[-6deg]" aria-hidden />
                <Photo photo={l.photo} aspect={l.aspect} sizes="(min-width: 768px) 18vw, 62vw" className="rounded-[16px]" />
                <p className="mt-2 px-1 font-hand text-[28px] leading-[0.95]">{l.title}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
