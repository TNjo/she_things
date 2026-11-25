"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { api, isApiError } from "@/lib/client/api";

function safeNext(n: string | null) {
  // only allow same-site relative paths (prevents open redirects)
  return n && n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/\\") ? n : "/account";
}

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [v, setV] = useState({ name: "", email: "", phone: "", password: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setFields({});
    try {
      await api(`/api/auth/${mode}`, { body: mode === "login" ? { email: v.email, password: v.password } : v });
      router.replace(safeNext(sp.get("next")));
      router.refresh();
    } catch (e) {
      if (isApiError(e)) {
        setErr(e.message);
        if (e.fields) setFields(e.fields);
      } else setErr("Something went wrong");
      setBusy(false);
    }
  }

  const input = (k: keyof typeof v, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="label" htmlFor={k}>{label}</label>
      <div className="relative">
        <input id={k} name={k} className="field" value={v[k]} aria-invalid={!!fields[k]} onChange={(e) => setV((x) => ({ ...x, [k]: e.target.value }))} {...props} />
        {k === "password" && (
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      {fields[k] && <p className="mt-1 text-sm text-cherry">{fields[k]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {mode === "register" && input("name", "Your name", { autoComplete: "name", maxLength: 60 })}
      {input("email", "Email", { type: "email", autoComplete: "email", maxLength: 254 })}
      {mode === "register" && input("phone", "Mobile (optional)", { type: "tel", autoComplete: "tel", placeholder: "07X XXX XXXX" })}
      {input("password", "Password", { type: show ? "text" : "password", autoComplete: mode === "login" ? "current-password" : "new-password", maxLength: 128 })}
      {mode === "register" && <p className="text-xs text-cocoa">8+ characters, with letters and at least one number.</p>}
      {err && <p className="rounded-xl bg-petal p-3 text-sm font-semibold text-cherry" role="alert">{err}</p>}
      <button disabled={busy} className="btn-ink w-full py-4 text-base">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : mode === "login" ? "Sign in" : "Create account"}</button>
      <p className="text-center text-sm">
        {mode === "login" ? <>New here? <Link className="font-semibold underline" href={`/account/register${sp.get("next") ? `?next=${encodeURIComponent(sp.get("next")!)}` : ""}`}>Create an account</Link></> : <>Already have one? <Link className="font-semibold underline" href="/account/login">Sign in</Link></>}
      </p>
      {mode === "login" && <p className="text-center text-xs text-cocoa">Demo account: demo@shethings.lk / Demo1234</p>}
    </form>
  );
}
