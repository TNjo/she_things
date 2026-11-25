"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Ear, { SKIN_TONES } from "../stack/Ear";
import Photo from "../Photo";
import { PHOTOS } from "@/lib/photos";

const demoStack = {
  "helix-1": { kind: "stud" as const, metal: "gold" as const },
  conch: { kind: "cuff" as const, metal: "gold" as const },
  "upper-lobe": { kind: "huggie" as const, metal: "gold" as const },
  lobe: { kind: "pearl-drop" as const, metal: "gold" as const },
};

export default function PlaySection() {
  return (
    <section className="mx-auto mt-24 max-w-[1400px] px-4 md:mt-36 md:px-8">
      <div className="mb-12 max-w-2xl">
        <p className="font-hand text-[32px] text-cherry">not your usual jewellery shop</p>
        <h2 className="text-5xl leading-[0.95] md:text-7xl">Come <i>play</i> before you pay.</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Stack studio – the big one */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card relative overflow-hidden bg-petal md:col-span-7 md:row-span-2">
          <Link href="/stack" className="grid h-full gap-4 p-6 md:grid-cols-[1fr_1.1fr] md:p-10">
            <div className="flex flex-col">
              <span className="sticker w-fit bg-ink text-cream">Ear Stack Studio</span>
              <h3 className="mt-4 text-4xl leading-tight md:text-5xl">Design your <i>dream ear</i>, piercing by piercing.</h3>
              <p className="mt-3 text-cocoa">Tap a spot, pick a piece, see the whole stack on an ear that matches your skin tone. Then bag the lot in one go.</p>
              <span className="btn-ink mt-auto w-fit translate-y-0 pt-3.5">Open the studio →</span>
            </div>
            <div className="relative mx-auto w-full max-w-[320px]">
              <Ear tone={SKIN_TONES[1]} placed={demoStack} className="w-full" />
              <span className="absolute -left-2 top-1/3 -rotate-12 font-hand text-[28px]">helix ✦</span>
              <span className="absolute -right-2 bottom-10 rotate-6 font-hand text-[28px]">lobe pearl!</span>
            </div>
          </Link>
        </motion.div>

        {/* Gift mode */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="md:col-span-5">
          <Link href="/shop?c=sets" className="card group flex h-full items-center gap-5 overflow-hidden bg-ink p-6 text-cream md:p-8">
            <div className="relative w-28 shrink-0 rotate-[-4deg] bg-white p-1.5 pb-5 transition-transform duration-500 group-hover:rotate-3">
              <Photo photo={PHOTOS.ringDish} aspect={1} sizes="112px" />
            </div>
            <div>
              <span className="sticker bg-butter text-ink">Gift mode</span>
              <h3 className="mt-3 text-3xl leading-tight">Buying for your bestie?</h3>
              <p className="mt-2 text-sm text-cream/70">Hand gift-wrap, a handwritten note from you, and no prices inside the box.</p>
            </div>
          </Link>
        </motion.div>

        {/* Quiz */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="md:col-span-5">
          <Link href="/quiz" className="card group relative flex h-full flex-col justify-between overflow-hidden bg-butter p-6 md:p-8">
            <div className="absolute -right-6 -top-6 h-32 w-32 rotate-12 rounded-full border border-ink/10 bg-sage transition-transform group-hover:rotate-45" />
            <span className="sticker relative w-fit bg-cherry text-white">60-second quiz</span>
            <h3 className="relative mt-3 text-3xl leading-tight">What&apos;s your <i>jewel personality?</i></h3>
            <p className="relative mt-2 text-sm text-cocoa">Romantic minimalist? Boho baddie? Five questions, a few picks made for you.</p>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
