"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  return done ? (
    <p className="mt-6 font-hand text-[40px] text-butter">You&apos;re on the list, babe ✦</p>
  ) : (
    <form
      className="mt-6 flex max-w-md overflow-hidden rounded-full border border-cream/40 focus-within:border-cream"
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("That email looks a little off");
        setDone(true); // TODO: connect to your email tool (Mailchimp / Firebase)
      }}
      noValidate
    >
      <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} placeholder="your@email.com" aria-label="Email" aria-invalid={!!err} className="flex-1 bg-transparent px-5 py-3 text-cream outline-none placeholder:text-cream/40" />
      <button className="bg-cream px-5 font-semibold text-ink transition hover:bg-blush">Join</button>
      {err && <span className="sr-only" role="alert">{err}</span>}
    </form>
  );
}
