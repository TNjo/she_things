import Link from "next/link";
import { PageTitle } from "@/components/admin/ui";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "New product" };

export default function NewProduct() {
  return (
    <>
      <Link href="/admin/products" className="text-sm font-semibold underline">← Products</Link>
      <PageTitle title="New product" />
      <ProductForm />
    </>
  );
}
