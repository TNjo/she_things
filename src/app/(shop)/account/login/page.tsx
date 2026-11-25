import { Suspense } from "react";
import { redirect } from "next/navigation";
import AuthForm from "@/components/account/AuthForm";
import AuthShell from "@/components/account/AuthShell";
import { getCustomer } from "@/lib/auth/session";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCustomer()) redirect("/account");
  return (
    <AuthShell title={<>Welcome <i>back</i></>} sub="Sign in to see your orders and check out faster.">
      <Suspense><AuthForm mode="login" /></Suspense>
    </AuthShell>
  );
}
