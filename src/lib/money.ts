export const CURRENCY = "LKR";

export function formatLKR(amount: number): string {
  return "Rs " + Math.round(amount).toLocaleString("en-LK");
}

/** BNPL providers (Koko / Mintpay) split into 3 interest-free instalments */
export function instalment(amount: number, parts = 3): string {
  return formatLKR(Math.ceil(amount / parts));
}
