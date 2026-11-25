import clsx from "clsx";
import type { OrderStatus, PaymentStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/orderLabels";

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl md:text-5xl">{title}</h1>
        {sub && <p className="mt-1 text-cocoa">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending_payment: "bg-butter",
  awaiting_verification: "bg-[#FFD9A8]",
  confirmed: "bg-blush",
  processing: "bg-[#C9B6F2]",
  shipped: "bg-[#A8D5FF]",
  delivered: "bg-sage",
  cancelled: "bg-ink/10 text-ink/60",
  refunded: "bg-ink/10 text-ink/60",
};

export function StatusPill({ status }: { status: OrderStatus }) {
  return <span className={clsx("sticker normal-case tracking-normal", STATUS_STYLE[status])}>{STATUS_LABEL[status]}</span>;
}

export function PayPill({ status }: { status: PaymentStatus }) {
  const tone = status === "paid" ? "bg-sage" : status === "failed" ? "bg-petal text-cherry" : status === "refunded" ? "bg-ink/10" : "bg-butter";
  return <span className={clsx("sticker normal-case tracking-normal", tone)}>{status.replace(/_/g, " ")}</span>;
}

export function Stat({ label, value, hint, tone = "bg-cream" }: { label: string; value: string; hint?: string; tone?: string }) {
  return (
    <div className={clsx("rounded-[24px] border border-ink/10 p-5", tone)}>
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-cocoa">{label}</p>
      <p className="mt-2 font-display text-4xl">{value}</p>
      {hint && <p className="mt-1 text-sm text-cocoa">{hint}</p>}
    </div>
  );
}
