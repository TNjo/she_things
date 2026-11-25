import { db } from "@/lib/db";
import StackStudio from "@/components/stack/StackStudio";

export const metadata = { title: "Ear Stack Studio", description: "Design your dream ear stack piercing by piercing, then bag the whole look." };
export const dynamic = "force-dynamic";

export default async function StackPage() {
  const products = (await db.products.list()).filter((p) => p.category === "earrings" && p.earSpots?.length);
  return <StackStudio products={products} />;
}
