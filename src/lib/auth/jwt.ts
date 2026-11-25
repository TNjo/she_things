// Edge-compatible JWT helpers (used by middleware AND route handlers)
import { SignJWT, jwtVerify } from "jose";

export const CUSTOMER_COOKIE = "st_session";
export const ADMIN_COOKIE = "st_admin";

const DEV_FALLBACK = "dev-only-insecure-secret-please-change-0123456789";

function secretFor(kind: "customer" | "admin"): Uint8Array {
  const raw = kind === "admin" ? process.env.ADMIN_SESSION_SECRET : process.env.SESSION_SECRET;
  const insecure = !raw || raw.length < 32 || raw.startsWith("change-me");
  if (insecure && process.env.NODE_ENV === "production" && process.env.ALLOW_INSECURE_DEMO !== "true") {
    throw new Error(
      `${kind === "admin" ? "ADMIN_SESSION_SECRET" : "SESSION_SECRET"} must be a random 32+ char string in production`,
    );
  }
  return new TextEncoder().encode(insecure ? DEV_FALLBACK + kind : (raw as string));
}

export interface SessionClaims {
  sub: string;
  email: string;
  name: string;
  role: "customer" | "owner" | "staff";
}

export async function signSession(kind: "customer" | "admin", claims: SessionClaims, maxAgeSec: number) {
  return new SignJWT({ email: claims.email, name: claims.name, role: claims.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setAudience(kind)
    .setIssuer("she-things")
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSec)
    .sign(secretFor(kind));
}

export async function verifySession(kind: "customer" | "admin", token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretFor(kind), {
      audience: kind,
      issuer: "she-things",
      algorithms: ["HS256"],
    });
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as SessionClaims["role"],
    };
  } catch {
    return null;
  }
}
