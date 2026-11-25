"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client/api";

export default function LogoutButton({ admin = false, className = "btn-ghost py-2.5" }: { admin?: boolean; className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className={className}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await api(admin ? "/api/admin/logout" : "/api/auth/logout", { body: {} }).catch(() => undefined);
        router.replace(admin ? "/admin/login" : "/");
        router.refresh();
      }}
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
