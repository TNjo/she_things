import { handle, ok, readJson } from "@/lib/http";
import { registerSchema } from "@/lib/validation";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { newId } from "@/lib/ids";
import { startCustomerSession } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export const POST = handle(
  async (req) => {
    const input = await readJson(req, registerSchema);
    if (await db.customers.getByEmail(input.email)) {
      throw new AppError("An account with this email already exists. Try signing in.", 409, "DUPLICATE");
    }
    const c = await db.customers.create({
      id: newId("cus"),
      email: input.email,
      name: input.name,
      phone: input.phone || undefined,
      passwordHash: await hashPassword(input.password),
      addresses: [],
      createdAt: new Date().toISOString(),
    });
    // Link earlier guest orders placed with the same email
    for (const o of await db.orders.list({ email: c.email })) if (!o.customerId) await db.orders.update(o.id, { customerId: c.id });
    await startCustomerSession({ sub: c.id, email: c.email, name: c.name, role: "customer" });
    return ok({ user: { name: c.name, email: c.email } });
  },
  { rate: { key: "register", limit: 5, windowMs: 10 * 60_000 } },
);
