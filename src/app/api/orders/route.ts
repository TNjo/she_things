import { handle, ok, readJson } from "@/lib/http";
import { checkoutSchema } from "@/lib/validation";
import { createOrder } from "@/lib/orders";
import { getCustomer, startCustomerSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const POST = handle(
  async (req) => {
    const input = await readJson(req, checkoutSchema);
    const session = await getCustomer();
    const { order, payment, accountCreated } = await createOrder(input, session);
    if (accountCreated && order.customerId && input.createAccount) {
      await startCustomerSession({ sub: order.customerId, email: order.email, name: input.createAccount.name, role: "customer" });
    }
    return ok({ orderNumber: order.number, token: order.accessToken, total: order.total, payment, accountCreated });
  },
  { rate: { key: "order", limit: 8, windowMs: 60_000 } },
);
