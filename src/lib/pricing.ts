// Pricing rules shared by the UI (for preview) and the server (authoritative).
// The server ALWAYS recalculates – client numbers are never trusted.
import type { Coupon } from "./types";

export const FREE_SHIPPING_OVER = 10000;
export const GIFT_WRAP_FEE = 350;
export const MAX_QTY_PER_ITEM = 10;
export const MAX_LINES_PER_ORDER = 30;

export function shippingFor(district: string | undefined, subtotalAfterDiscount: number): number {
  if (subtotalAfterDiscount >= FREE_SHIPPING_OVER) return 0;
  if (!district) return 400;
  return district === "Colombo" ? 350 : district === "Gampaha" ? 400 : 450;
}

export function discountFor(coupon: Coupon | null | undefined, subtotal: number): number {
  if (!coupon || !coupon.active || subtotal < coupon.minSubtotal) return 0;
  const d = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return Math.min(d, subtotal);
}
