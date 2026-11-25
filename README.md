# She Things ✦ — earrings with a little drama

A Next.js 15 storefront and admin back office for She Things (Sri Lanka). It runs on dummy data today and is built to switch to Firebase.

## Run it

```bash
npm install
cp .env.example .env.local     # then set real secrets (see below)
npm run dev                    # http://localhost:3000
```

| Who | Where | Login |
|---|---|---|
| Shopper (demo) | `/account/login` | `demo@shethings.lk` / `Demo1234` |
| Admin | `/admin/login` | `ADMIN_EMAIL` / `ADMIN_PASSWORD` from env (dev: `admin@shethings.lk` / `SheThings@2026`) |

Promo codes: `HELLOSHE` (10% off) and `STACKIT` (Rs 750 off over Rs 6,000).

> **Dummy data mode:** data lives in server memory and resets when the server restarts. On Vercel each serverless instance has its own memory. That's fine for a demo but not for real orders, so connect Firebase before launch (see `docs/FIREBASE.md`).

## What's inside

**Storefront**
- 3D hero (three.js): a gold hoop, pearl and gem that follow the pointer and scroll. Falls back to SVG if WebGL isn't available.
- **Ear Stack Studio** (`/stack`): tap piercing spots on an illustrated ear (4 skin tones). Each spot only offers pieces made for it. Includes "Surprise me", a shareable link, and "Bag the whole stack".
- **Vibe quiz** (`/quiz`): 5 questions that give a jewel personality and matching picks.
- Shop with category, metal, vibe, price and stock filters, search and sort. Filters are kept in the URL so they can be shared.
- Product pages: Koko/Mintpay instalment price, delivery date estimate, low-stock urgency, restock alerts and reviews.
- Wishlist, recently viewed, bag drawer with a free-delivery progress bar, app-style bottom bar on mobile, WhatsApp button.
- Guest checkout or account checkout (with optional account creation). Sri Lankan districts and mobile validation, gift wrap with a handwritten note.
- Payments: Card (PayHere), Koko, Mintpay, bank transfer (slip upload) and cash on delivery.
- Order page with live status timeline, slip upload and self-cancel. Tracking (`/track`) by order number plus email or phone.

**Admin** (`/admin`)
- Dashboard: revenue, today's orders, orders to pack, slips to verify, 7-day chart, top sellers, low stock.
- Orders: filters and search, a strict status flow, bank slip verify/reject, courier and tracking number, printable packing slip.
- Products: create/edit with live artwork preview, quick ± stock, archive (instead of delete) when a product has orders.
- Inventory: full stock movement log plus a "notify me" restock waiting list. Customers: accounts and guest buyers with total spend.

## Security & reliability
- **Server-side price recalculation.** Client totals are never trusted.
- **Atomic stock reservation** (lock / Firestore transaction), so the last item can't be sold twice. Stock is rolled back if any step fails.
- **Idempotent checkout:** double-clicks, retries and lost connections never create duplicate orders or charges.
- Unpaid online orders auto-cancel after 30 minutes (bank transfer: 48 hours) and their stock is released.
- Payment webhooks are signature-verified (PayHere md5sig), amount-checked and idempotent. A payment that arrives after an order was cancelled is flagged for refund, never lost.
- scrypt password hashing. Signed httpOnly session cookies, with separate secrets and cookies for admin and customers. Admin cookie is `SameSite=Strict` and lasts 8h.
- Admin is guarded twice: in middleware and again in every admin API.
- CSRF protection via same-origin checks on every write. Zod validation on every input. Body size limits.
- Rate limits on login, register, checkout, tracking and coupons, plus per-account login lockout.
- Bank slips are checked by magic bytes and re-encoded in the browser, which strips EXIF/location data.
- Security headers: CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy.
- Errors are never leaked: customers see friendly messages, logs get a reference id. Error, 404 and global-error pages are included.
- Guest order links use a secret token, and tracking masks the address.

## Deploy to Vercel
1. Push to GitHub and import the repo in Vercel.
2. Add these environment variables (Production):
   - `SESSION_SECRET` and `ADMIN_SESSION_SECRET`: two **different** random strings. Generate each with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. The app refuses to run in production without them.
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`: a strong password.
   - `NEXT_PUBLIC_SITE_URL`: e.g. `https://shethings.lk`
   - `PAYMENT_MODE=mock` until your merchant accounts are live, then `live` with the PayHere / Koko / Mintpay keys.
   - Bank details and `NEXT_PUBLIC_WHATSAPP`.
3. Deploy.

## Going live with payments
- **PayHere (cards):** fully wired. Set `PAYMENT_MODE=live`, `PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET`, and `PAYHERE_SANDBOX=false` when ready. Register `https://your-domain/api/payments/payhere/notify` as the notify URL.
- **Koko / Mintpay:** these providers give each merchant their own API docs and keys at onboarding. The order flow, timeouts, stock release and status updates are all wired. Only the "create payment" call in `src/lib/payments/index.ts` (marked `TODO(live)`) and the matching webhook still need to be added. Until then, choosing them in live mode shows a friendly "not available" message.
- The built-in **test gateway** (`PAYMENT_MODE=mock`) lets you click Approve/Decline for card, Koko and Mintpay, so every flow can be tested now.

## Still to plug in before launch
- Firebase (`docs/FIREBASE.md`)
- Transactional email/SMS: order confirmation, shipped, restock alerts (e.g. Resend, Notify.lk)
- Real product photos: add https URLs in the admin product form; the SVG art is used until then
- Distributed rate limiting (Upstash Redis) for multi-instance production

## Tests
`npm run build` type-checks everything. An 80-check end-to-end script (pages, orders, payments, stock race, tracking, accounts, admin, security headers, rate limits) was run against a production build, and all checks passed.
