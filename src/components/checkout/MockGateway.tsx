"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, FlaskConical } from "lucide-react";
import { formatLKR, instalment } from "@/lib/money";
import { api, isApiError } from "@/lib/client/api";

const THEME = {
  card: { name: "PayHere", bg: "#1C1917", accent: "#F3E6CC" },
  koko: { name: "Koko", bg: "#2B2160", accent: "#FFC845" },
  mintpay: { name: "Mintpay", bg: "#0E5E54", accent: "#7CF2C4" },
};

export default function MockGateway({ number, token, total, method, email, expiresAt }: { number: string; token: string; total: number; method: "card" | "koko" | "mintpay"; email: string; expiresAt: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"" | "approve" | "decline">("");
  const [error, setError] = useState("");
  const [left, setLeft] = useState("");
  const theme = THEME[method];

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const ms = Date.parse(expiresAt) - Date.now();
      if (ms <= 0) return setLeft("expired");
      setLeft(`${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  async function go(outcome: "approve" | "decline") {
    setBusy(outcome);
    setError("");
    try {
      const r = await api<{ redirect: string }>("/api/payments/mock", { body: { number, t: token, outcome } });
      router.replace(r.redirect);
    } catch (e) {
      setError(isApiError(e) ? e.message : "Payment failed");
      setBusy("");
    }
  }

  const today = new Date();
  const schedule = [0, 1, 2].map((i) => new Date(today.getFullYear(), today.getMonth() + i, today.getDate()).toLocaleDateString("en-LK", { day: "numeric", month: "short" }));

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <p className="mb-4 flex items-center justify-center gap-2 rounded-full bg-butter px-4 py-2 text-center text-sm font-bold">
        <FlaskConical className="h-4 w-4" /> Test mode – no real money moves
      </p>
      <div className="overflow-hidden rounded-[28px] border border-ink/10 shadow-soft">
        <div className="p-6 text-white" style={{ background: theme.bg }}>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black tracking-tight" style={{ color: theme.accent }}>{theme.name}</span>
            <span className="flex items-center gap-1 text-xs opacity-80"><Lock className="h-3.5 w-3.5" /> secure</span>
          </div>
          <p className="mt-6 text-sm opacity-70">Paying She Things · {number}</p>
          <p className="font-display text-5xl">{formatLKR(total)}</p>
          {left && <p className="mt-2 text-xs opacity-70">Session {left === "expired" ? "expired" : `expires in ${left}`}</p>}
        </div>
        <div className="space-y-4 bg-cream p-6">
          {method === "card" ? (
            <>
              <div>
                <label className="label">Card number</label>
                <input className="field font-mono" defaultValue="4242 4242 4242 4242" readOnly aria-readonly />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Expiry</label><input className="field font-mono" defaultValue="12 / 29" readOnly /></div>
                <div><label className="label">CVC</label><input className="field font-mono" defaultValue="123" readOnly /></div>
              </div>
            </>
          ) : (
            <div>
              <p className="label">Your plan · {email}</p>
              <ol className="space-y-2">
                {schedule.map((d, i) => (
                  <li key={d} className="flex items-center justify-between rounded-xl border border-ink/15 bg-paper px-4 py-3">
                    <span><b>{i === 0 ? "Today" : d}</b> <span className="text-sm text-cocoa">· payment {i + 1} of 3</span></span>
                    <span className="font-bold">{instalment(total)}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {error && <p className="rounded-xl bg-petal p-3 text-sm font-semibold text-cherry" role="alert">{error}</p>}
          <button onClick={() => go("approve")} disabled={!!busy || left === "expired"} className="btn w-full text-base text-white" style={{ background: theme.bg }}>
            {busy === "approve" ? <Loader2 className="h-5 w-5 animate-spin" /> : `Pay ${method === "card" ? formatLKR(total) : instalment(total) + " now"}`}
          </button>
          <button onClick={() => go("decline")} disabled={!!busy} className="w-full py-2 text-sm font-semibold text-cocoa underline-offset-4 hover:underline">
            {busy === "decline" ? "Cancelling…" : "Simulate a declined payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
