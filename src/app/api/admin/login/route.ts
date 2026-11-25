import { handle, ok, readJson, clientIp } from "@/lib/http";
import { loginSchema } from "@/lib/validation";
import { db } from "@/lib/db";
import { burnPasswordCheck, verifyPassword } from "@/lib/auth/password";
import { startAdminSession } from "@/lib/auth/session";
import { AppError, Errors } from "@/lib/errors";
import { rateLimit } from "@/lib/security/rateLimit";

export const dynamic = "force-dynamic";

export const POST = handle(
  async (req) => {
    const { email, password } = await readJson(req, loginSchema);
    if (!rateLimit(`admin-acct:${email}`, 5, 15 * 60_000)) throw Errors.rateLimited();
    const admin = await db.admins.getByEmail(email);
    const valid = admin ? await verifyPassword(password, admin.passwordHash) : (await burnPasswordCheck(password), false);
    if (!admin || !valid) {
      console.warn("[security] failed admin login", email, clientIp(req));
      await new Promise((r) => setTimeout(r, 400)); // slow down guessing
      throw new AppError("Invalid credentials", 401, "BAD_CREDENTIALS");
    }
    await startAdminSession({ sub: admin.id, email: admin.email, name: admin.name, role: admin.role });
    return ok({});
  },
  { rate: { key: "admin-login", limit: 5, windowMs: 60_000 } },
);
