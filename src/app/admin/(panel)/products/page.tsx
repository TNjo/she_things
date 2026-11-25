import Link from "next/link";
import { db } from "@/lib/db";
import { PageTitle } from "@/components/admin/ui";
import ProductTable from "@/components/admin/ProductTable";

export const metadata = { title: "Products" };

export default async function ProductsAdmin() {
  const products = await db.products.list({ includeInactive: true });
  const units = products.reduce((s, p) => s + p.stock, 0);
  const value = products.reduce((s, p) => s + p.stock * p.price, 0);
  return (
    <>
      <PageTitle
        title="Products"
        sub={`${products.length} products · ${units} units in stock · Rs ${value.toLocaleString()} retail value`}
        action={<Link href="/admin/products/new" className="btn-ink">+ New product</Link>}
      />
      <ProductTable products={products} />
    </>
  );
}
