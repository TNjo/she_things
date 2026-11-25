// ---------- Catalogue ----------
export type Category = "earrings" | "necklaces" | "rings" | "bracelets" | "anklets" | "sets";
export type Material = "gold" | "gold-plated" | "silver" | "sterling-silver" | "rose-gold" | "pearl" | "brass";
export type Vibe = "minimal" | "romantic" | "bold" | "boho" | "vintage" | "y2k";
export type EarSpot = "lobe" | "upper-lobe" | "helix" | "tragus" | "conch";

/** Procedural artwork spec – used until real product photos are uploaded */
export type ArtKind =
  | "hoop" | "huggie" | "drop" | "stud" | "pearl-drop" | "chandelier" | "cuff" | "star"
  | "heart" | "flower" | "chain" | "pendant" | "ring" | "bangle" | "anklet";

export interface JewelArtSpec {
  kind: ArtKind;
  metal: "gold" | "silver" | "rose";
  gem?: string; // hex colour
  bg?: string;  // background card colour
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  material: Material;
  vibes: Vibe[];
  price: number;          // LKR, integer rupees
  compareAt?: number;     // original price for sale items
  stock: number;
  lowStockThreshold: number;
  sku: string;
  images: string[];       // real image URLs (optional – falls back to art)
  /** transparent PNG of ONE earring (background removed) for Ear Stack Studio */
  cutoutImage?: string;
  art: JewelArtSpec;
  earSpots?: EarSpot[];   // for the Ear Stack Builder
  isNew?: boolean;
  isBestseller?: boolean;
  hypoallergenic?: boolean;
  antiTarnish?: boolean;
  active: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  body: string;
  createdAt: string;
}

// ---------- Customers ----------
export interface Address {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  district: string;
  postalCode?: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  passwordHash: string;
  addresses: Address[];
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: "owner" | "staff";
}

// ---------- Orders ----------
export type PaymentMethod = "card" | "koko" | "mintpay" | "bank" | "cod";
export type PaymentStatus = "unpaid" | "pending" | "awaiting_verification" | "paid" | "failed" | "refunded";
export type OrderStatus =
  | "pending_payment"
  | "awaiting_verification"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
  art: JewelArtSpec;
  image?: string;
}

export interface StatusEvent {
  status: OrderStatus;
  at: string;
  note?: string;
  by?: string;
}

export interface Order {
  id: string;
  number: string;          // public order number e.g. ST-48213
  accessToken: string;     // secret token for guest order view
  customerId?: string;
  email: string;
  phone: string;
  shipping: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  giftWrapFee: number;
  total: number;
  couponCode?: string;
  giftWrap: boolean;
  giftNote?: string;
  customerNote?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentRef?: string;
  bankSlip?: { dataUrl: string; uploadedAt: string; reference?: string };
  status: OrderStatus;
  history: StatusEvent[];
  courier?: string;
  trackingNumber?: string;
  stockReleased: boolean;
  idempotencyKey: string;
  expiresAt?: string;      // unpaid online orders auto-cancel after this
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  active: boolean;
  description: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  delta: number;
  reason: string;
  by: string;
  at: string;
  stockAfter: number;
}

export interface StockAlert {
  productId: string;
  email: string;
  at: string;
}
