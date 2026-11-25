# Connecting Firebase (Firestore)

The app talks to storage only through the `Repository` interface in `src/lib/db/repository.ts`. To switch from the dummy store:

1. `npm install firebase-admin`
2. In the Firebase console, go to Project settings → Service accounts → generate a key. Add to Vercel env:
   `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (keep the `\n`s).
3. Create `src/lib/db/firebase.ts` that implements `Repository` with the Admin SDK, using these collections:

| Collection | Doc id | Notes |
|---|---|---|
| `products` | product id | index `slug`, `active` |
| `reviews` | auto | field `productId` |
| `customers` | customer id | unique email: also write `customerEmails/{email}` inside a transaction |
| `admins` | email | create the owner once with a hashed password (`hashPassword()` from `src/lib/auth/password.ts`) |
| `orders` | order id | index `number`, `idempotencyKey`, `customerId`, `email`, `status`+`createdAt` |
| `coupons` | code | |
| `inventoryLogs` | auto | field `productId`, `at` |
| `stockAlerts` | `${productId}_${email}` | |

4. **Important:** implement `withLock("stock", fn)` using `db.runTransaction()`. Read the product docs and check stock, then decrement inside the transaction. Do the same for `order:{id}`. This is what prevents overselling across Vercel instances.
5. Change `src/lib/db/index.ts`:
   ```ts
   export const db = process.env.DATA_BACKEND === "firebase" ? firebaseRepository : memoryRepository;
   ```
6. Bank slips: store them in Firebase Storage (private bucket) and save only the path on the order. Serve them to admins through a signed URL.
7. Firestore rules: deny all client access (`allow read, write: if false;`). Everything goes through the server using the Admin SDK.
8. Auto-cancel: add a Vercel Cron (e.g. every 10 min) that calls a protected route running `sweepExpiredOrders()`. It already runs lazily on order and admin pages.
