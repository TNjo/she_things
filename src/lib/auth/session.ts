import { cookies } from "next/headers";
import { ADMIN_COOKIE, CUSTOMER_COOKIE, signSession, verifySession, type SessionClaims } from "./jwt";
import { Errors } from "../errors";

const CUSTOMER_MAX_AGE = 60 * 60 * 24 * 14; // 14 days
const ADMIN_MAX_AGE = 60 * 60 * 8; // 8 hours

const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function startCustomerSession(claims: SessionClaims) {
  const token = await signSession("customer", claims, CUSTOMER_MAX_AGE);
  (await cookies()).set(CUSTOMER_COOKIE, token, { ...cookieBase, maxAge: CUSTOMER_MAX_AGE });
}

export async function startAdminSession(claims: SessionClaims) {
  const token = await signSession("admin", claims, ADMIN_MAX_AGE);
  (await cookies()).set(ADMIN_COOKIE, token, { ...cookieBase, sameSite: "strict", maxAge: ADMIN_MAX_AGE });
}

export async function endSession(kind: "customer" | "admin") {
  const jar = await cookies();
  jar.set(kind === "admin" ? ADMIN_COOKIE : CUSTOMER_COOKIE, "", { ...cookieBase, maxAge: 0 });
}

export async function getCustomer(): Promise<SessionClaims | null> {
  return verifySession("customer", (await cookies()).get(CUSTOMER_COOKIE)?.value);
}

export async function getAdmin(): Promise<SessionClaims | null> {
  return verifySession("admin", (await cookies()).get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin(): Promise<SessionClaims> {
  const a = await getAdmin();
  if (!a || (a.role !== "owner" && a.role !== "staff")) throw Errors.unauthorized();
  return a;
}
