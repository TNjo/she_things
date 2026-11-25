import { handle, ok, readJson, clientIp } from "@/lib/http";
import { loginSchema } from "@/lib/validation";
import { db } from "@/lib/db";
import { burnPasswordCheck, verifyPassword } from "@/lib/auth/password";
import { startCustomerSession } from "@/lib/auth/session";
import { AppError, Errors } from "@/lib/errors";
import { rateLimit } from "@/lib/security/rateLimit";

export const dynamic = "force-dynamic";

export const POST = handle(
  async (req) => {
    const { email, password } = await readJson(req, loginSchema);
    // Per-account limit too, so one IP rotation can't brute force a single account
    if (!rateLimit(`login-acct:${email}`, 8, 15 * 60_000)) throw Errors.rateLimited();
    const c = await db.customers.getByEmail(email);
    if (!c) {
      await burnPasswordCheck(password);
      throw new AppError("Email or password is incorrect", 401, "BAD_CREDENTIALS");
    }
    if (!(await verifyPassword(password, c.passwordHash))) {
      console.warn("Failed customer login", email, clientIp(req));
      throw new AppError("Email or password is incorrect", 401, "BAD_CREDENTIALS");
    }
    await startCustomerSession({ sub: c.id, email: c.email, name: c.name, role: "customer" });
    return ok({ user: { name: c.name, email: c.email } });
  },
  { rate: { key: "login", limit: 10, windowMs: 60_000 } },
);
