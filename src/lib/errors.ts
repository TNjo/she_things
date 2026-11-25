/** Errors that are safe to show to the customer. Anything else becomes a generic message. */
export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code = "BAD_REQUEST",
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const Errors = {
  notFound: (what = "Resource") => new AppError(`${what} not found`, 404, "NOT_FOUND"),
  unauthorized: () => new AppError("Please sign in to continue", 401, "UNAUTHORIZED"),
  forbidden: () => new AppError("You don't have access to this", 403, "FORBIDDEN"),
  rateLimited: () => new AppError("Too many attempts. Please wait a minute and try again.", 429, "RATE_LIMITED"),
  outOfStock: (details: unknown) =>
    new AppError("Some items in your bag just sold out or have limited stock.", 409, "OUT_OF_STOCK", details),
};
