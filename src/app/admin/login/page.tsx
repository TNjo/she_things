import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth/session";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  if (await getAdmin()) redirect("/admin");
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-[28px] border border-ink/10 bg-paper p-8 shadow-soft">
        <p className="font-display text-3xl italic">she ✦ things</p>
        <p className="mb-6 mt-1 text-xs font-bold uppercase tracking-[0.2em] text-cocoa">Back office</p>
        <AdminLoginForm />
      </div>
    </div>
  );
}
