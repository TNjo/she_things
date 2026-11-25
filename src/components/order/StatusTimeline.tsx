"use client";
import { motion } from "framer-motion";
import { Check, Package, Truck, Home, CircleDollarSign, XCircle } from "lucide-react";
import clsx from "clsx";
import type { OrderStatus, StatusEvent } from "@/lib/types";

const STEPS: { key: OrderStatus; label: string; Icon: typeof Check }[] = [
  { key: "confirmed", label: "Confirmed", Icon: CircleDollarSign },
  { key: "processing", label: "Packing", Icon: Package },
  { key: "shipped", label: "On the way", Icon: Truck },
  { key: "delivered", label: "Delivered", Icon: Home },
];

export default function StatusTimeline({ status, history, courier, trackingNumber }: { status: OrderStatus; history: StatusEvent[]; courier?: string; trackingNumber?: string }) {
  if (status === "cancelled" || status === "refunded") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-petal p-5">
        <XCircle className="h-6 w-6 text-cherry" />
        <div>
          <p className="font-bold">Order {status}</p>
          <p className="text-sm text-cocoa">{history.at(-1)?.note || "Any stock has been released. If you paid, a refund is on its way."}</p>
        </div>
      </div>
    );
  }
  const current = STEPS.findIndex((s) => s.key === status);
  const at = (k: OrderStatus) => history.filter((h) => h.status === k).at(-1)?.at;

  return (
    <div>
      <ol className="relative grid grid-cols-4">
        <div className="absolute left-[12.5%] right-[12.5%] top-6 h-1 rounded-full bg-ink/10" aria-hidden />
        <motion.div className="absolute left-[12.5%] top-6 h-1 rounded-full bg-cherry" initial={{ width: 0 }} animate={{ width: `${Math.max(0, current) * 25}%` }} transition={{ duration: 1, ease: "easeOut" }} aria-hidden />
        {STEPS.map((s, i) => {
          const done = current >= i;
          const t = at(s.key);
          return (
            <li key={s.key} className="relative flex flex-col items-center text-center">
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.15 }}
                className={clsx("relative z-10 grid h-12 w-12 place-items-center rounded-full border border-ink/10", done ? "bg-ink text-cream" : "bg-cream", i === current && "ring-4 ring-blush")}
              >
                <s.Icon className="h-5 w-5" />
              </motion.span>
              <span className={clsx("mt-2 text-xs font-bold sm:text-sm", !done && "text-ink/40")}>{s.label}</span>
              {t && <span className="text-[11px] text-cocoa">{new Date(t).toLocaleDateString("en-LK", { day: "numeric", month: "short" })}</span>}
            </li>
          );
        })}
      </ol>
      {current < 0 && (
        <p className="mt-6 rounded-2xl bg-butter p-4 text-center text-sm font-semibold">
          {status === "pending_payment" ? "Waiting for your payment to go through…" : "We're checking your bank transfer – usually within a few hours."}
        </p>
      )}
      {trackingNumber && (
        <p className="mt-6 rounded-2xl bg-cream p-4 text-center text-sm">
          Courier: <b>{courier || "—"}</b> · Tracking no: <b className="font-mono">{trackingNumber}</b>
        </p>
      )}
    </div>
  );
}
