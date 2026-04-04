import { auth } from "@/auth";
import { createPaymentRecord } from "@/lib/payments";
import {
  createRazorpayOrder,
  type BillingTier,
} from "@/lib/razorpay";
import { rateLimitByUser } from "@/lib/rate-limit";

const ALLOWED_TIERS: BillingTier[] = ["starter", "standard", "pro", "enterprise"];

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 10 payment orders per hour per user
  const rl = rateLimitByUser(session.user.id, "payments:create", 10, 60 * 60 * 1000);
  if (rl) return rl;

  const body = await request.json();
  const tier = body?.tier as BillingTier;
  const region = (body?.region as string) ?? "eu-central";
  const priceInr = body?.priceInr as number | undefined;
  const agentName = (body?.agentName as string | undefined)?.trim() || "OpenClaw Agent";

  if (!ALLOWED_TIERS.includes(tier)) {
    return Response.json({ error: "Invalid tier" }, { status: 400 });
  }

  try {
    const order = await createRazorpayOrder({
      userId: session.user.id,
      tier,
      region,
      priceInr,
      agentName,
    });

    await createPaymentRecord({
      userId: session.user.id,
      orderId: order.id,
      tier,
      amount: order.amount,
      currency: order.currency,
      agentName,
      status: "created",
    });

    return Response.json(order);
  } catch (error) {
    console.error("Failed to create Razorpay order", error);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}
