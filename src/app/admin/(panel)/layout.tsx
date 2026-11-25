import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth/session";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";
export const metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <AdminNav name={admin.name} email={admin.email} />
      <main className="min-w-0 px-4 pb-16 pt-6 md:px-10 md:pt-10">{children}</main>
    </div>
  );
}
