import type { Metadata } from "next";
import { db } from "@/lib/db";
import ShopClient from "@/components/shop/ShopClient";

export const metadata: Metadata = { title: "Shop" };
export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function ShopPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const products = await db.products.list();
  return (
    <ShopClient
      products={products}
      initial={{ c: one(sp.c).slice(0, 20), m: one(sp.m).slice(0, 20), v: one(sp.v).slice(0, 20), q: one(sp.q).slice(0, 60), sort: one(sp.sort).slice(0, 20) }}
    />
  );
}
