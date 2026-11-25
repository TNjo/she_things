import { z } from "zod";
import { SRI_LANKA_DISTRICTS } from "./data/seed";
import { MAX_LINES_PER_ORDER, MAX_QTY_PER_ITEM } from "./pricing";

const text = (min: number, max: number, label: string) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(min, min <= 1 ? `${label} is required` : `${label} is too short`)
    .max(max, `${label} is too long`)
    // strip control characters
    .transform((s) => s.replace(/[\u0000-\u001F\u007F]/g, ""));

export const emailSchema = z
  .string({ error: "Email is required" })
  .trim()
  .toLowerCase()
  .max(254)
  .email("Enter a valid email");

/** Sri Lankan mobile: 07XXXXXXXX or +947XXXXXXXX – normalised to +947XXXXXXXX */
export const phoneSchema = z
  .string({ error: "Phone is required" })
  .transform((s) => s.replace(/[\s\-()]/g, ""))
  .refine((s) => /^(?:\+94|0094|94|0)?7\d{8}$/.test(s), "Enter a valid Sri Lankan mobile number (07X XXX XXXX)")
  .transform((s) => "+94" + s.slice(-9));

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128)
  .refine((s) => /[A-Za-z]/.test(s) && /\d/.test(s), "Use letters and at least one number");

export const addressSchema = z.object({
  fullName: text(2, 80, "Full name"),
  phone: phoneSchema,
  line1: text(3, 120, "Address"),
  line2: z.string().trim().max(120).optional().or(z.literal("")),
  city: text(2, 60, "City"),
  district: z.enum(SRI_LANKA_DISTRICTS, { error: "Choose your district" }),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Postal code is 5 digits")
    .optional()
    .or(z.literal("")),
});

export const checkoutSchema = z.object({
  idempotencyKey: z.string().min(16).max(64).regex(/^[A-Za-z0-9_-]+$/),
  email: emailSchema,
  shipping: addressSchema,
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(40).regex(/^[A-Za-z0-9_]+$/),
        qty: z.number().int().min(1).max(MAX_QTY_PER_ITEM, `Max ${MAX_QTY_PER_ITEM} per item`),
      }),
    )
    .min(1, "Your bag is empty")
    .max(MAX_LINES_PER_ORDER),
  paymentMethod: z.enum(["card", "koko", "mintpay", "bank", "cod"], { error: "Choose a payment method" }),
  couponCode: z.string().trim().toUpperCase().max(30).optional().or(z.literal("")),
  giftWrap: z.boolean().default(false),
  giftNote: z.string().trim().max(240, "Gift note is too long").optional().or(z.literal("")),
  customerNote: z.string().trim().max(500).optional().or(z.literal("")),
  createAccount: z
    .object({ name: text(2, 60, "Name"), password: passwordSchema })
    .optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password").max(128) });

export const registerSchema = z.object({
  name: text(2, 60, "Name"),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal("")),
  password: passwordSchema,
});

export const trackSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^ST-[A-Z0-9]{6}$/, "Order numbers look like ST-AB12CD"),
  contact: z.string().trim().min(5, "Enter the email or phone used for the order").max(254),
});

export const productInputSchema = z.object({
  name: text(2, 80, "Name"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes"),
  tagline: text(2, 120, "Tagline"),
  description: text(10, 2000, "Description"),
  category: z.enum(["earrings", "necklaces", "rings", "bracelets", "anklets", "sets"]),
  material: z.enum(["gold", "gold-plated", "silver", "sterling-silver", "rose-gold", "pearl", "brass"]),
  vibes: z.array(z.enum(["minimal", "romantic", "bold", "boho", "vintage", "y2k"])).max(6),
  price: z.number().int().min(1, "Price must be above 0").max(5_000_000),
  compareAt: z.number().int().min(0).max(5_000_000).optional().nullable(),
  stock: z.number().int().min(0).max(100_000),
  lowStockThreshold: z.number().int().min(0).max(1000),
  sku: z.string().trim().min(2).max(40).regex(/^[A-Za-z0-9-]+$/, "Letters, numbers and dashes only"),
  images: z.array(z.string().url().max(500).refine((u) => u.startsWith("https://"), "Image URLs must use https")).max(8),
  cutoutImage: z.string().url().max(500).refine((u) => u.startsWith("https://"), "Image URLs must use https").optional().or(z.literal("")),
  art: z.object({
    kind: z.enum(["hoop", "huggie", "drop", "stud", "pearl-drop", "chandelier", "cuff", "star", "heart", "flower", "chain", "pendant", "ring", "bangle", "anklet"]),
    metal: z.enum(["gold", "silver", "rose"]),
    gem: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().or(z.literal("")),
    bg: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().or(z.literal("")),
  }),
  earSpots: z.array(z.enum(["lobe", "upper-lobe", "helix", "tragus", "conch"])).optional(),
  isNew: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  hypoallergenic: z.boolean().optional(),
  antiTarnish: z.boolean().optional(),
  active: z.boolean(),
});
export type ProductInput = z.infer<typeof productInputSchema>;
