import { Suspense } from "react";
import { redirect } from "next/navigation";
import AuthForm from "@/components/account/AuthForm";
import { getCustomer } from "@/lib/auth/session";
import AuthShell from "@/components/account/AuthShell";

export const metadata = { title: "Create account" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await getCustomer()) redirect("/account");
  return <AuthShell title={<>Join the <i>club</i></>} sub="Track orders, save addresses, get first dibs on drops."><Suspense><AuthForm mode="register" /></Suspense></AuthShell>;
}
