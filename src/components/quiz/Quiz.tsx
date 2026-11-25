"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import type { Product, Vibe } from "@/lib/types";
import ProductCard from "../product/ProductCard";
import { burst } from "../layout/Cursor";

type Opt = { label: string; v: Partial<Record<Vibe, number>> };
const QUESTIONS: { q: string; options: Opt[] }[] = [
  { q: "Pick a Saturday.", options: [
    { label: "Galle Fort café, linen dress", v: { romantic: 2, vintage: 1 } },
    { label: "Arugam Bay, salty hair", v: { boho: 2 } },
    { label: "Rooftop in Colombo, heels on", v: { bold: 2, y2k: 1 } },
    { label: "Home, matcha, journal", v: { minimal: 2 } },
  ] },
  { q: "Your playlist right now?", options: [
    { label: "Lana Del Rey on repeat", v: { vintage: 2, romantic: 1 } },
    { label: "2000s pop throwbacks", v: { y2k: 2 } },
    { label: "Lo-fi beats", v: { minimal: 2 } },
    { label: "Whatever's loudest", v: { bold: 2 } },
  ] },
  { q: "The colour you always end up wearing:", options: [
    { label: "Cream & beige", v: { minimal: 2 } },
    { label: "Blush pink", v: { romantic: 2 } },
    { label: "Cherry red", v: { bold: 2 } },
    { label: "Earthy olive", v: { boho: 2, vintage: 1 } },
  ] },
  { q: "Pick an emoji, no thinking.", options: [
    { label: "🦋", v: { y2k: 2, romantic: 1 } },
    { label: "🌙", v: { boho: 1, vintage: 1, minimal: 1 } },
    { label: "🍒", v: { bold: 1, y2k: 1 } },
    { label: "🕊️", v: { minimal: 1, romantic: 1 } },
  ] },
  { q: "Jewellery rule you live by?", options: [
    { label: "Less is more", v: { minimal: 3 } },
    { label: "More is more", v: { bold: 2, boho: 1 } },
    { label: "Every piece tells a story", v: { vintage: 2, boho: 1 } },
    { label: "Match the mood, always", v: { romantic: 1, y2k: 1, bold: 1 } },
  ] },
];

const RESULTS: Record<Vibe, { title: string; blurb: string; bg: string }> = {
  minimal: { title: "The Quiet Luxe", blurb: "Clean lines, tiny gold, zero effort that somehow looks like a lot. You'd rather own one perfect huggie than ten okay ones.", bg: "#F5EFE9" },
  romantic: { title: "The Soft Romantic", blurb: "Pearls, blush tones, things that catch the light at golden hour. You probably name your plants.", bg: "#F3D3DC" },
  bold: { title: "The Main Character", blurb: "Chunky hoops, statement stones and the confidence to wear both on a Tuesday.", bg: "#BE185D" },
  boho: { title: "The Free Spirit", blurb: "Daisies, little bells, beach-y gold. You stack without rules and it always works.", bg: "#DDE3D3" },
  vintage: { title: "The Old Soul", blurb: "Jhumkas, pearls and anything that looks like it came from your aachchi's jewellery box.", bg: "#F3E6CC" },
  y2k: { title: "The Y2K Sweetheart", blurb: "Butterflies, cherries and pure 2003 energy. Glitter is a neutral.", bg: "#C9B6F2" },
};

export default function Quiz({ products }: { products: Product[] }) {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState<Partial<Record<Vibe, number>>>({});

  const result = useMemo<Vibe | null>(() => {
    if (step < QUESTIONS.length) return null;
    return (Object.entries(score).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0] as Vibe) ?? "minimal";
  }, [step, score]);

  const picks = result ? products.filter((p) => p.vibes.includes(result) && p.stock > 0).sort((a, b) => b.rating - a.rating).slice(0, 4) : [];

  function choose(o: Opt, e: React.MouseEvent) {
    setScore((s) => { const n = { ...s }; for (const [k, v] of Object.entries(o.v)) n[k as Vibe] = (n[k as Vibe] ?? 0) + (v ?? 0); return n; });
    if (step === QUESTIONS.length - 1) burst(e.clientX, e.clientY, 30);
    setStep((s) => s + 1);
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-10 pt-8 md:px-8">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key={step} initial={{ opacity: 0, x: 60, rotate: 2 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: -60, rotate: -2 }} transition={{ duration: 0.35 }} className="mx-auto max-w-2xl">
            <div className="mb-8 flex gap-2">
              {QUESTIONS.map((_, i) => <span key={i} className={`h-2 flex-1 rounded-full ${i <= step ? "bg-cherry" : "bg-ink/10"}`} />)}
            </div>
            <p className="font-hand text-[32px] text-cherry">question {step + 1} of {QUESTIONS.length}</p>
            <h1 className="text-5xl leading-tight md:text-7xl">{QUESTIONS[step].q}</h1>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {QUESTIONS[step].options.map((o, i) => (
                <button key={o.label} onClick={(e) => choose(o, e)} className="card group flex items-center gap-4 p-5 text-left text-lg font-semibold transition hover:-translate-y-1 hover:bg-butter hover:shadow-soft">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/10 font-display italic group-hover:bg-ink group-hover:text-cream">{"abcd"[i]}</span>
                  {o.label}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="card overflow-hidden p-8 text-center md:p-14" style={{ background: RESULTS[result].bg, color: result === "bold" ? "#fff" : undefined }}>
              <p className="font-hand text-[40px]">you are…</p>
              <h1 className="mt-2 text-6xl italic leading-none md:text-8xl">{RESULTS[result].title}</h1>
              <p className="mx-auto mt-6 max-w-xl text-lg">{RESULTS[result].blurb}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href={`/shop?v=${result}`} className="btn-ink">Shop my vibe</Link>
                <button onClick={() => { setStep(0); setScore({}); }} className="btn-ghost bg-cream text-ink"><RotateCcw className="h-4 w-4" /> Retake</button>
              </div>
            </div>
            <h2 className="mt-16 text-4xl">Picked <i>for you</i></h2>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-8">
              {picks.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
