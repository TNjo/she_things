import { handle, ok } from "@/lib/http";
import { getCustomer } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const s = await getCustomer();
  if (!s) return ok({ user: null });
  const c = await db.customers.getById(s.sub);
  if (!c) return ok({ user: null });
  return ok({ user: { name: c.name, email: c.email, phone: c.phone, addresses: c.addresses } });
});
