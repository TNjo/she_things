import { NextResponse, type NextRequest } from "next/server";
import { ZodError, type ZodType } from "zod";
import { AppError, Errors } from "./errors";
import { rateLimit } from "./security/rateLimit";
import { newId } from "./ids";

type Handler<C> = (req: NextRequest, ctx: C) => Promise<Response>;

interface Options {
  /** Skip same-origin check (payment provider webhooks) */
  allowCrossOrigin?: boolean;
  /** e.g. { key: "login", limit: 5, windowMs: 60_000 } */
  rate?: { key: string; limit: number; windowMs: number };
}

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/** CSRF defence: state-changing requests must come from our own origin. */
function assertSameOrigin(req: NextRequest) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return;
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!origin || !host) throw new AppError("Invalid request origin", 403, "BAD_ORIGIN");
  try {
    if (new URL(origin).host !== host) throw new Error();
  } catch {
    throw new AppError("Invalid request origin", 403, "BAD_ORIGIN");
  }
}

/** Wraps a route handler with origin check, rate limit and safe error handling. */
export function handle<C = unknown>(fn: Handler<C>, opts: Options = {}): Handler<C> {
  return async (req, ctx) => {
    try {
      if (!opts.allowCrossOrigin) assertSameOrigin(req);
      if (opts.rate && !rateLimit(`${opts.rate.key}:${clientIp(req)}`, opts.rate.limit, opts.rate.windowMs)) {
        throw Errors.rateLimited();
      }
      return await fn(req, ctx);
    } catch (err) {
      return errorResponse(err);
    }
  };
}

export function errorResponse(err: unknown) {
  if (err instanceof AppError) {
    return NextResponse.json({ ok: false, error: err.message, code: err.code, details: err.details }, { status: err.status });
  }
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      const k = issue.path.join(".") || "_";
      if (!fields[k]) fields[k] = issue.message;
    }
    return NextResponse.json(
      { ok: false, error: "Please check the highlighted fields.", code: "VALIDATION", fields },
      { status: 422 },
    );
  }
  // Unknown error: log with a reference id, never leak internals to the client
  const ref = newId("err");
  console.error(`[${ref}]`, err);
  return NextResponse.json(
    { ok: false, error: `Something went wrong on our side. Please try again. (ref ${ref.slice(-6)})`, code: "INTERNAL" },
    { status: 500 },
  );
}

const MAX_JSON_BYTES = 3_000_000; // 3MB (bank slip images are compressed client side)

export async function readJson<T>(req: NextRequest, schema: ZodType<T>): Promise<T> {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > MAX_JSON_BYTES) throw new AppError("Request is too large", 413, "TOO_LARGE");
  let raw: unknown;
  try {
    const text = await req.text();
    if (text.length > MAX_JSON_BYTES) throw new AppError("Request is too large", 413, "TOO_LARGE");
    raw = JSON.parse(text);
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError("Malformed request body", 400, "BAD_JSON");
  }
  return schema.parse(raw);
}

export const ok = <T>(data: T, init?: ResponseInit) => NextResponse.json({ ok: true, ...data }, init);
