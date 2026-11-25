"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { api, isApiError } from "@/lib/client/api";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr("");
        try {
          await api("/api/admin/login", { body: { email, password } });
          router.replace("/admin");
          router.refresh();
        } catch (e) {
          setErr(isApiError(e) ? e.message : "Sign in failed");
          setBusy(false);
        }
      }}
    >
      <div>
        <label className="label" htmlFor="ae">Email</label>
        <input id="ae" type="email" autoComplete="username" className="field" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="label" htmlFor="ap">Password</label>
        <input id="ap" type="password" autoComplete="current-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {err && <p className="rounded-xl bg-petal p-3 text-sm font-semibold text-cherry" role="alert">{err}</p>}
      <button disabled={busy} className="btn-ink w-full">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in"}</button>
      {process.env.NODE_ENV !== "production" && <p className="text-center text-xs text-cocoa">Dev login: admin@shethings.lk / SheThings@2026</p>}
    </form>
  );
}
