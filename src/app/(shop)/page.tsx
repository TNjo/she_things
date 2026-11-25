import { db } from "@/lib/db";
import Hero from "@/components/home/Hero";
import EarringRail from "@/components/home/EarringRail";
import PlaySection from "@/components/home/PlaySection";
import CategoryArches from "@/components/home/CategoryArches";
import GoldCorner from "@/components/home/GoldCorner";
import FridgeNotes from "@/components/home/FridgeNotes";
import Promises from "@/components/home/Promises";
import Lookbook from "@/components/home/Lookbook";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await db.products.list();
  const earrings = products.filter((p) => p.category === "earrings");
  const gold = products.filter((p) => p.material === "gold" || p.material === "gold-plated").slice(0, 4);
  const realGold = products.filter((p) => p.material === "gold");

  return (
    <>
      <Hero />
      <Ticker />
      <EarringRail products={earrings} />
      <Lookbook />
      <PlaySection />
      <CategoryArches />
      <GoldCorner products={realGold.length ? realGold : gold} />
      <FridgeNotes />
      <Promises />
    </>
  );
}

function Ticker() {
  const words = ["won't turn green", "sensitive-ear safe", "island-wide delivery", "pay in 3", "gift-wrapped", "7-day swaps"];
  return (
    <div className="relative z-10 -mx-4 rotate-[-1.5deg] overflow-hidden bg-lime py-4">
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap font-display text-4xl uppercase md:text-5xl">
        {[...words, ...words, ...words, ...words].map((w, i) => (
          <span key={i} className="flex items-center gap-8">{w}<span className="text-cherry" aria-hidden>●</span></span>
        ))}
      </div>
    </div>
  );
}
