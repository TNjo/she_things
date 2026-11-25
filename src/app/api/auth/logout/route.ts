import { handle, ok } from "@/lib/http";
import { endSession } from "@/lib/auth/session";

export const POST = handle(async () => {
  await endSession("customer");
  return ok({});
});
