import type { Metadata } from "next";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import { SRI_LANKA_DISTRICTS } from "@/lib/data/seed";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return <CheckoutClient districts={[...SRI_LANKA_DISTRICTS]} />;
}
