// Small fetch wrapper for the browser: consistent errors, timeouts, no thrown JSON parse errors.
export interface ApiError {
  status: number;
  code: string;
  message: string;
  fields?: Record<string, string>;
  details?: unknown;
  network?: boolean;
}

export async function api<T = Record<string, unknown>>(url: string, init: { method?: string; body?: unknown; timeoutMs?: number } = {}): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), init.timeoutMs ?? 20000);
  let res: Response;
  try {
    res = await fetch(url, {
      method: init.method ?? (init.body ? "POST" : "GET"),
      headers: init.body ? { "Content-Type": "application/json" } : undefined,
      body: init.body ? JSON.stringify(init.body) : undefined,
      signal: ctrl.signal,
      credentials: "same-origin",
    });
  } catch {
    clearTimeout(timer);
    const err: ApiError = { status: 0, code: "NETWORK", message: "Connection problem – check your internet and try again.", network: true };
    throw err;
  }
  clearTimeout(timer);
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    const err: ApiError = {
      status: res.status,
      code: json?.code ?? "UNKNOWN",
      message: json?.error ?? (res.status >= 500 ? "Our server hiccuped. Please try again." : "Something went wrong."),
      fields: json?.fields,
      details: json?.details,
    };
    throw err;
  }
  return json as T;
}

export const isApiError = (e: unknown): e is ApiError => typeof e === "object" && e !== null && "code" in e && "message" in e;

/** Orders placed on this device (lets guests find them again) */
export function rememberOrder(number: string, token: string) {
  try {
    const list = JSON.parse(localStorage.getItem("st_orders") || "[]") as { number: string; token: string; at: string }[];
    localStorage.setItem("st_orders", JSON.stringify([{ number, token, at: new Date().toISOString() }, ...list.filter((o) => o.number !== number)].slice(0, 20)));
  } catch { /* ignore */ }
}
export function rememberedOrders(): { number: string; token: string; at: string }[] {
  try {
    const v = JSON.parse(localStorage.getItem("st_orders") || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
