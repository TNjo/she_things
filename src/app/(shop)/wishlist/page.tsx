import { db } from "@/lib/db";
import WishlistClient from "@/components/shop/WishlistClient";

export const metadata = { title: "Wishlist" };
export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const products = await db.products.list();
  return <WishlistClient products={products} />;
}
