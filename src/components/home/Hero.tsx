"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Photo from "../Photo";
import { PHOTOS, photoUrl } from "@/lib/photos";

const Hero3D = dynamic(() => import("./Hero3D"), { ssr: false });
const pop = { type: "spring", stiffness: 260, damping: 18 } as const;

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-14 pt-4 md:pb-20">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        {/* giant word filled with a real photo */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative select-none text-center text-[31vw] leading-[0.8] md:text-[24vw] xl:text-[340px]"
          aria-label="Ears deserve a little drama"
        >
          <span
            className="block bg-cover bg-center"
            style={{ backgroundImage: `url(${photoUrl(PHOTOS.heroPearl, 1600, 2)})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
            aria-hidden
          >
            EARS
          </span>
          <motion.span
            initial={{ rotate: -14, scale: 0 }}
            animate={{ rotate: -8, scale: 1 }}
            transition={{ ...pop, delay: 0.5 }}
            className="absolute left-[2%] top-[8%] rounded-full bg-lime px-4 py-1 font-hand text-[clamp(28px,4vw,56px)] normal-case leading-tight text-ink shadow-sticker"
            aria-hidden
          >
            deserve a little
          </motion.span>
          <motion.span
            initial={{ rotate: 18, scale: 0 }}
            animate={{ rotate: 6, scale: 1 }}
            transition={{ ...pop, delay: 0.7 }}
            className="absolute bottom-[6%] right-[1%] rounded-[14px] bg-cherry px-4 py-1 text-[clamp(40px,7vw,104px)] leading-none text-white"
            aria-hidden
          >
            DRAMA!
          </motion.span>
        </motion.h1>

        <div className="mt-8 grid items-center gap-10 md:mt-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="max-w-md text-lg leading-relaxed">
              Hoops, huggies, pearls &amp; a lil bit of real gold. Handpicked in Colombo for girls who change their earrings more than their minds.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/shop?c=earrings" className="btn-ink group">
                Shop earrings <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/stack" className="btn-ghost">Build your ear stack</Link>
            </div>
            <p className="mt-6 font-hand text-[30px] leading-none text-cocoa">
              ↳ free delivery over Rs 10k · pay in 3 with Koko / Mintpay
            </p>
          </div>

          {/* taped polaroid collage */}
          <div className="relative h-[420px] md:col-span-7 md:h-[480px]">
            <Polaroid className="left-[2%] top-[6%] w-[46%] md:w-[38%]" rotate={-7} delay={0.3} caption="the pearl one ♡" photoKey="pearlDrop" />
            <Polaroid className="left-[34%] top-[0%] w-[44%] md:left-[33%] md:w-[34%]" rotate={4} delay={0.45} caption="huggies 4 life" photoKey="heroHuggie" />
            <Polaroid className="right-[0%] top-[22%] hidden w-[34%] sm:block" rotate={9} delay={0.6} caption="statement szn" photoKey="colourHoop" />
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: -12 }}
              transition={{ ...pop, delay: 0.9 }}
              className="absolute bottom-[4%] left-[8%] grid h-28 w-28 place-items-center bg-butter text-center text-ink md:h-32 md:w-32"
              style={{ clipPath: "polygon(50% 0,61% 14%,79% 8%,80% 26%,98% 30%,88% 46%,100% 60%,82% 68%,84% 88%,65% 84%,54% 100%,42% 86%,24% 94%,20% 76%,2% 70%,12% 54%,0 38%,18% 30%,16% 10%,36% 14%)" }}
            >
              <span className="font-display text-2xl leading-none md:text-3xl">NEW<br />DROP</span>
            </motion.div>
            {/* the real-time 3D gold hoop, just for fun */}
            <div className="absolute bottom-[0%] right-[6%] h-40 w-40 md:h-52 md:w-52" aria-hidden>
              <Hero3D />
            </div>
            <svg viewBox="0 0 120 60" className="absolute bottom-[30%] right-[34%] hidden w-28 text-cherry md:block" aria-hidden>
              <path d="M4 50 C 30 10, 70 0, 112 18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M100 8 L 113 18 L 98 26" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

function Polaroid({ className, rotate, delay, caption, photoKey }: { className: string; rotate: number; delay: number; caption: string; photoKey: keyof typeof PHOTOS }) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 40, rotate: rotate * 2 }}
      animate={{ opacity: 1, y: 0, rotate }}
      whileHover={{ rotate: 0, scale: 1.04, zIndex: 20 }}
      transition={{ type: "spring", stiffness: 200, damping: 18, delay }}
      className={`absolute bg-white p-2.5 pb-1 shadow-soft ${className}`}
    >
      <span className="tape -top-3 left-1/2 -translate-x-1/2 rotate-[-4deg]" aria-hidden />
      <Photo photo={PHOTOS[photoKey]} aspect={4 / 5} sizes="(min-width: 768px) 22vw, 45vw" priority={photoKey === "pearlDrop"} />
      <figcaption className="py-1.5 text-center font-hand text-[26px] leading-none">{caption}</figcaption>
    </motion.figure>
  );
}
