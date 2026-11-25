"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CreditCard, Gift, Landmark, Lock, Banknote, CalendarClock, Check, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useStore } from "../providers/StoreProvider";
import JewelArt from "../JewelArt";
import ProductImage from "@/components/ProductImage";
import { formatLKR, instalment } from "@/lib/money";
import { discountFor, GIFT_WRAP_FEE, shippingFor } from "@/lib/pricing";
import { api, isApiError, rememberOrder, type ApiError } from "@/lib/client/api";
import type { Coupon, PaymentMethod } from "@/lib/types";

type Fields = Record<string, string>;
type Me = { name: string; email: string; phone?: string; addresses: { fullName: string; phone: string; line1: string; line2?: string; city: string; district: string; postalCode?: string }[] } | null;

const PAY: { id: PaymentMethod; title: string; sub: string; Icon: typeof CreditCard }[] = [
  { id: "card", title: "Card", sub: "Visa, Mastercard, Amex – secured by PayHere", Icon: CreditCard },
  { id: "koko", title: "Koko", sub: "3 interest-free payments", Icon: CalendarClock },
  { id: "mintpay", title: "Mintpay", sub: "3 interest-free payments", Icon: CalendarClock },
  { id: "bank", title: "Bank transfer", sub: "Transfer & upload your slip", Icon: Landmark },
  { id: "cod", title: "Cash on delivery", sub: "Pay the rider (up to Rs 50,000)", Icon: Banknote },
];

function hash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
function baseKey() {
  try {
    let k = sessionStorage.getItem("st_idem");
    if (!k) {
      k = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("");
      sessionStorage.setItem("st_idem", k);
    }
    return k;
  } catch {
    return Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("");
  }
}

export default function CheckoutClient({ districts }: { districts: string[] }) {
  const router = useRouter();
  const { cart, subtotal, hydrated, clearCart, setQty, removeFromCart } = useStore();
  const [me, setMe] = useState<Me>(null);
  const [form, setForm] = useState({ email: "", fullName: "", phone: "", line1: "", line2: "", city: "", district: "", postalCode: "", giftNote: "", customerNote: "" });
  const [giftWrap, setGiftWrap] = useState(false);
  const [pay, setPay] = useState<PaymentMethod>("card");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [makeAccount, setMakeAccount] = useState(false);
  const [acct, setAcct] = useState({ name: "", password: "" });
  const [errors, setErrors] = useState<Fields>({});
  const [banner, setBanner] = useState<{ tone: "err" | "warn"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [agree, setAgree] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [idemBase, setIdemBase] = useState("");
  const rotateKey = () => {
    try { sessionStorage.removeItem("st_idem"); } catch { /* ignore */ }
    setIdemBase(baseKey());
  };

  useEffect(() => {
    setIdemBase(baseKey());
    api<{ user: Me }>("/api/auth/me")
      .then(({ user }) => {
        if (!user) return;
        setMe(user);
        const a = user.addresses[0];
        setForm((f) => ({ ...f, email: user.email, fullName: a?.fullName ?? user.name, phone: a?.phone ?? user.phone ?? "", line1: a?.line1 ?? "", line2: a?.line2 ?? "", city: a?.city ?? "", district: a?.district ?? "", postalCode: a?.postalCode ?? "" }));
      })
      .catch(() => undefined);
  }, []);

  const discount = discountFor(coupon, subtotal);
  const shipping = shippingFor(form.district || undefined, subtotal - discount);
  const wrapFee = giftWrap ? GIFT_WRAP_FEE : 0;
  const total = subtotal - discount + shipping + wrapFee;
  const codBlocked = total > 50000;

  useEffect(() => { if (codBlocked && pay === "cod") setPay("card"); }, [codBlocked, pay]);

  const idempotencyKey = useMemo(
    () => `${idemBase}-${hash(JSON.stringify([cart.map((i) => [i.productId, i.qty]), pay, form.email, giftWrap, coupon?.code, form.district]))}`,
    [cart, pay, form.email, giftWrap, coupon, idemBase, form.district],
  );

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => { const n = { ...er }; delete n[k]; delete n[`shipping.${k}`]; return n; });
  };
  const err = (k: string) => errors[k] || errors[`shipping.${k}`];

  async function applyCoupon() {
    setCouponMsg("");
    if (!couponInput.trim()) return;
    try {
      const { coupon: c } = await api<{ coupon: Coupon }>("/api/coupons/validate", { body: { code: couponInput } });
      if (subtotal < c.minSubtotal) {
        setCouponMsg(`Spend ${formatLKR(c.minSubtotal)} to use this code`);
        return;
      }
      setCoupon(c);
      setCouponMsg(c.description);
    } catch (e) {
      setCoupon(null);
      setCouponMsg(isApiError(e) ? e.message : "Couldn't check that code");
    }
  }

  function clientValidate(): Fields {
    const e: Fields = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (form.fullName.trim().length < 2) e.fullName = "Full name is required";
    if (!/^(?:\+94|0094|94|0)?7\d{8}$/.test(form.phone.replace(/[\s\-()]/g, ""))) e.phone = "Enter a valid Sri Lankan mobile (07X XXX XXXX)";
    if (form.line1.trim().length < 3) e.line1 = "Address is required";
    if (form.city.trim().length < 2) e.city = "City is required";
    if (!form.district) e.district = "Choose your district";
    if (form.postalCode && !/^\d{5}$/.test(form.postalCode)) e.postalCode = "Postal code is 5 digits";
    if (makeAccount && !me) {
      if (acct.password.length < 8 || !/\d/.test(acct.password) || !/[A-Za-z]/.test(acct.password)) e["createAccount.password"] = "8+ characters with letters and a number";
    }
    if (!agree) e.agree = "Please accept the terms";
    return e;
  }

  function focusFirstError(fields: Fields) {
    const first = Object.keys(fields)[0]?.replace(/^shipping\./, "");
    const el = first ? formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`) : null;
    el?.focus();
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return; // double-click guard
    setBanner(null);
    const ce = clientValidate();
    if (Object.keys(ce).length) {
      setErrors(ce);
      focusFirstError(ce);
      return;
    }
    if (!idemBase) return;
    setSubmitting(true);
    try {
      const res = await api<{ orderNumber: string; token: string; payment: { type: "redirect"; url: string } | { type: "form_post"; action: string; fields: Record<string, string> } | { type: "none" } }>("/api/orders", {
        timeoutMs: 30000,
        body: {
          idempotencyKey,
          email: form.email,
          shipping: { fullName: form.fullName, phone: form.phone, line1: form.line1, line2: form.line2, city: form.city, district: form.district, postalCode: form.postalCode },
          items: cart.map((i) => ({ productId: i.productId, qty: i.qty })),
          paymentMethod: pay,
          couponCode: coupon?.code ?? "",
          giftWrap,
          giftNote: giftWrap ? form.giftNote : "",
          customerNote: form.customerNote,
          createAccount: makeAccount && !me ? { name: acct.name || form.fullName, password: acct.password } : undefined,
        },
      });
      // Order is safely stored server-side from here on.
      rememberOrder(res.orderNumber, res.token);
      try { sessionStorage.removeItem("st_idem"); } catch { /* ignore */ }
      clearCart();
      if (res.payment.type === "form_post") {
        const f = document.createElement("form");
        f.method = "POST";
        f.action = res.payment.action;
        for (const [k, v] of Object.entries(res.payment.fields)) {
          const i = document.createElement("input");
          i.type = "hidden"; i.name = k; i.value = v;
          f.appendChild(i);
        }
        document.body.appendChild(f);
        f.submit();
        return;
      }
      router.push(res.payment.type === "redirect" ? res.payment.url : `/order/${res.orderNumber}?t=${res.token}`);
    } catch (e) {
      setSubmitting(false);
      if (!isApiError(e)) {
        setBanner({ tone: "err", text: "Something unexpected happened. Your card has not been charged – please try again." });
        return;
      }
      handleError(e);
    }
  }

  function handleError(e: ApiError) {
    if (e.network) {
      setBanner({ tone: "warn", text: "We lost connection while placing your order. Tap “Place order” again – you won't be charged twice." });
      return;
    }
    if (e.code === "VALIDATION" && e.fields) {
      setErrors(e.fields);
      focusFirstError(e.fields);
      setBanner({ tone: "err", text: e.message });
      return;
    }
    if (e.code === "OUT_OF_STOCK" && Array.isArray(e.details)) {
      const names: string[] = [];
      for (const d of e.details as { productId: string; name?: string; available: number }[]) {
        const item = cart.find((c) => c.productId === d.productId);
        names.push(`${item?.name ?? d.name ?? "An item"} (${d.available} left)`);
        if (d.available <= 0) removeFromCart(d.productId);
        else setQty(d.productId, d.available);
      }
      setBanner({ tone: "warn", text: `Heads up – stock changed while you were shopping: ${names.join(", ")}. We've updated your bag; please review and place the order again.` });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (["PROVIDER_UNAVAILABLE", "IDEMPOTENCY_STALE", "IDEMPOTENCY_MISMATCH"].includes(e.code)) rotateKey();
    if (e.code === "BAD_COUPON") { setCoupon(null); setCouponMsg(e.message); }
    setBanner({ tone: "err", text: e.message });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!hydrated) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  if (cart.length === 0) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-lg place-items-center px-4 text-center">
        <div>
          <div className="mx-auto h-40 w-40"><JewelArt art={{ kind: "huggie", metal: "gold" }} bare sway /></div>
          <h1 className="mt-4 text-5xl italic">Your bag is empty</h1>
          <p className="mt-2 text-cocoa">Nothing to check out yet – go find something shiny.</p>
          <Link href="/shop" className="btn-ink mt-6">Start shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-8 md:px-8">
      <div className="flex items-end justify-between">
        <h1 className="text-5xl md:text-7xl">Check<i>out</i></h1>
        <p className="hidden items-center gap-1.5 text-sm font-semibold text-cocoa sm:flex"><Lock className="h-4 w-4" /> Secure checkout</p>
      </div>

      <AnimatePresence>
        {banner && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className={clsx("mt-6 flex gap-3 rounded-2xl border border-ink/10 p-4 font-medium", banner.tone === "err" ? "bg-petal" : "bg-butter")}>
            <AlertTriangle className="h-5 w-5 shrink-0" /> <p>{banner.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form ref={formRef} onSubmit={submit} noValidate className="mt-8 grid gap-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-10">
          {/* Contact */}
          <Section n={1} title="Contact">
            {me ? (
              <p className="rounded-2xl bg-cream p-4 text-sm">Signed in as <b>{me.email}</b> – this order will be saved to your account.</p>
            ) : (
              <p className="mb-4 text-sm text-cocoa">Checking out as a guest is totally fine. <Link href="/account/login?next=/checkout" className="font-semibold text-ink underline">Sign in</Link> for faster checkout.</p>
            )}
            {!me && <Input name="email" label="Email" type="email" autoComplete="email" value={form.email} onChange={set("email")} error={err("email")} placeholder="you@example.com" />}
          </Section>

          {/* Delivery */}
          <Section n={2} title="Delivery">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="fullName" label="Full name" autoComplete="name" value={form.fullName} onChange={set("fullName")} error={err("fullName")} />
              <Input name="phone" label="Mobile" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} error={err("phone")} placeholder="07X XXX XXXX" />
              <Input className="sm:col-span-2" name="line1" label="Address" autoComplete="address-line1" value={form.line1} onChange={set("line1")} error={err("line1")} placeholder="House no, street" />
              <Input className="sm:col-span-2" name="line2" label="Apartment, landmark (optional)" autoComplete="address-line2" value={form.line2} onChange={set("line2")} error={err("line2")} />
              <Input name="city" label="City / Town" autoComplete="address-level2" value={form.city} onChange={set("city")} error={err("city")} />
              <div>
                <label className="label" htmlFor="district">District</label>
                <select id="district" name="district" value={form.district} onChange={set("district")} className="field" aria-invalid={!!err("district")}>
                  <option value="">Choose…</option>
                  {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {err("district") && <p className="mt-1 text-sm text-cherry">{err("district")}</p>}
              </div>
              <Input name="postalCode" label="Postal code (optional)" inputMode="numeric" autoComplete="postal-code" value={form.postalCode} onChange={set("postalCode")} error={err("postalCode")} />
            </div>
          </Section>

          {/* Gift */}
          <Section n={3} title="Make it a gift?">
            <button type="button" onClick={() => setGiftWrap((g) => !g)} aria-pressed={giftWrap} className={clsx("flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition", giftWrap ? "border-ink bg-petal" : "border-ink/25 bg-cream")}>
              <Gift className="h-6 w-6 shrink-0" />
              <span className="flex-1"><b>Hand gift-wrap + handwritten note</b><br /><span className="text-sm text-cocoa">Ribbon, tissue, no prices inside. +{formatLKR(GIFT_WRAP_FEE)}</span></span>
              <span className={clsx("grid h-6 w-6 place-items-center rounded-full border border-ink/10", giftWrap && "bg-ink text-cream")}>{giftWrap && <Check className="h-4 w-4" />}</span>
            </button>
            <AnimatePresence>
              {giftWrap && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <label className="label mt-4" htmlFor="giftNote">Your note (we&apos;ll write it by hand)</label>
                  <textarea id="giftNote" name="giftNote" maxLength={240} rows={3} value={form.giftNote} onChange={set("giftNote")} className="field font-hand text-[32px]" placeholder="Happy birthday, gorgeous…" />
                  <p className="mt-1 text-right text-xs text-cocoa">{form.giftNote.length}/240</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Section>

          {/* Payment */}
          <Section n={4} title="Payment">
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
              {PAY.map(({ id, title, sub, Icon }) => {
                const disabled = id === "cod" && codBlocked;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={pay === id}
                    disabled={disabled}
                    onClick={() => setPay(id)}
                    className={clsx("relative flex items-start gap-3 rounded-2xl border p-4 text-left transition disabled:opacity-40", pay === id ? "border-ink bg-butter shadow-soft" : "border-ink/25 bg-cream hover:border-ink")}
                  >
                    <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                    <span>
                      <b>{title}</b>
                      <span className="block text-sm text-cocoa">{id === "koko" || id === "mintpay" ? `3 × ${instalment(total)} · 0% interest` : sub}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {pay === "bank" && <p className="mt-3 rounded-2xl bg-cream p-4 text-sm">You&apos;ll see our bank details on the next page. Upload your slip within 48 hours and we&apos;ll confirm your order.</p>}
            {(pay === "card" || pay === "koko" || pay === "mintpay") && <p className="mt-3 flex items-center gap-2 text-sm text-cocoa"><Lock className="h-4 w-4" /> You&apos;ll finish paying on the secure {pay === "card" ? "PayHere" : pay === "koko" ? "Koko" : "Mintpay"} page. We never see or store card numbers.</p>}
          </Section>

          {!me && (
            <Section n={5} title="Save your details? (optional)">
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={makeAccount} onChange={(e) => setMakeAccount(e.target.checked)} className="h-5 w-5 accent-cherry" />
                <span>Create an account to track orders & check out faster next time</span>
              </label>
              {makeAccount && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input name="acctName" label="Your name" value={acct.name} onChange={(e) => setAcct((a) => ({ ...a, name: e.target.value }))} placeholder={form.fullName} />
                  <Input name="password" label="Password" type="password" autoComplete="new-password" value={acct.password} onChange={(e) => { setAcct((a) => ({ ...a, password: e.target.value })); setErrors((er) => { const n = { ...er }; delete n["createAccount.password"]; return n; }); }} error={errors["createAccount.password"]} />
                </div>
              )}
            </Section>
          )}

          <div>
            <label className="label" htmlFor="customerNote">Note for us (optional)</label>
            <textarea id="customerNote" name="customerNote" maxLength={500} rows={2} value={form.customerNote} onChange={set("customerNote")} className="field" placeholder="Delivery instructions, etc." />
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card overflow-hidden">
            <div className="border-b border-ink/10 bg-petal px-6 py-4">
              <h2 className="text-2xl italic">Order summary</h2>
            </div>
            <ul className="max-h-72 space-y-3 overflow-y-auto px-6 py-5">
              {cart.map((i) => (
                <li key={i.productId} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-ink/10">
                    <ProductImage src={i.image} art={i.art} alt={i.name} />
                    <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] font-bold text-cream">{i.qty}</span>
                  </div>
                  <span className="flex-1 truncate text-sm font-semibold">{i.name}</span>
                  <span className="text-sm">{formatLKR(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-6 py-4">
              <div className="flex gap-2">
                <input value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} maxLength={30} placeholder="Promo code" className="field py-2.5 uppercase" aria-label="Promo code" />
                <button type="button" onClick={applyCoupon} className="btn-ghost py-2.5">Apply</button>
              </div>
              {couponMsg && <p className={clsx("mt-2 text-sm", coupon ? "text-green-800" : "text-cherry")}>{couponMsg}</p>}
            </div>
            <dl className="space-y-2 border-t border-line px-6 py-4 text-sm">
              <Row k="Subtotal" v={formatLKR(subtotal)} />
              {discount > 0 && <Row k={`Discount (${coupon?.code})`} v={`− ${formatLKR(discount)}`} />}
              <Row k="Delivery" v={!form.district ? "Choose district" : shipping === 0 ? "Free" : formatLKR(shipping)} />
              {giftWrap && <Row k="Gift wrap" v={formatLKR(wrapFee)} />}
            </dl>
            <div className="flex items-baseline justify-between border-t border-ink/10 px-6 py-4">
              <span className="font-bold uppercase tracking-widest">Total</span>
              <span className="font-display text-4xl">{formatLKR(total)}</span>
            </div>
            <div className="px-6 pb-6">
              <label className="mb-4 flex cursor-pointer items-start gap-3 text-sm">
                <input type="checkbox" name="agree" checked={agree} onChange={(e) => { setAgree(e.target.checked); setErrors((er) => { const n = { ...er }; delete n.agree; return n; }); }} className="mt-0.5 h-5 w-5 accent-cherry" />
                <span>I agree to the <Link href="/help#delivery" className="underline">delivery & exchange policy</Link>.</span>
              </label>
              {errors.agree && <p className="-mt-2 mb-3 text-sm text-cherry">{errors.agree}</p>}
              <button type="submit" disabled={submitting} className="btn-cherry w-full py-4 text-base">
                {submitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Placing your order…</> : <>Place order · {formatLKR(total)}</>}
              </button>
              <p className="mt-3 text-center text-xs text-cocoa">Prices & stock are re-checked when you place the order.</p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-3 text-3xl">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-ink font-sans text-base font-bold not-italic text-cream">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Input({ label, error, className, name, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; name: string }) {
  return (
    <div className={className}>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} className="field" aria-invalid={!!error} aria-describedby={error ? `${name}-err` : undefined} {...rest} />
      {error && <p id={`${name}-err`} className="mt-1 text-sm text-cherry">{error}</p>}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><dt className="text-cocoa">{k}</dt><dd className="font-semibold">{v}</dd></div>;
}
