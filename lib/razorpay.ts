import { createHmac, randomUUID } from "crypto";
import Razorpay from "razorpay";

export type BillingTier = "starter" | "standard" | "pro" | "enterprise";

const TIER_PRICE_INR_PAISE: Record<BillingTier, number> = {
  starter: 79900,
  standard: 149900,
  pro: 299900,
  enterprise: 599900,
};

/**
 * When RAZORPAY_TEST_AMOUNT is set (e.g. "100" for ₹1),
 * all orders use that amount instead of real tier pricing.
 * Remove this env var for production.
 */
function getAmount(tier: BillingTier): number {
  const testAmount = process.env.RAZORPAY_TEST_AMOUNT;
  if (testAmount) return Number(testAmount);
  return TIER_PRICE_INR_PAISE[tier];
}

function getKeyId() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) throw new Error("Missing RAZORPAY_KEY_ID");
  return keyId;
}

function getKeySecret() {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw new Error("Missing RAZORPAY_KEY_SECRET");
  return keySecret;
}

function getClient() {
  return new Razorpay({
    key_id: getKeyId(),
    key_secret: getKeySecret(),
  });
}

export function getTierAmount(tier: BillingTier): number {
  return getAmount(tier);
}

export async function createRazorpayOrder(opts: {
  userId: string;
  tier: BillingTier;
  region?: string;
  priceInr?: number;
  agentName: string;
}) {
  // Use dynamic per-region pricing if provided, otherwise fall back to tier default
  // TODO: restore dynamic pricing for production
  // const amount = opts.priceInr ? opts.priceInr : getAmount(opts.tier);
  const amount = 100; // ₹1 for testing
  const client = getClient();

  const order = await client.orders.create({
    amount,
    currency: "INR",
    receipt: `fc_${opts.userId.slice(-6)}_${randomUUID().slice(0, 8)}`,
    notes: {
      userId: opts.userId,
      tier: opts.tier,
      region: opts.region ?? "eu-central",
      agentName: opts.agentName,
      product: "fireclaw-agent-deploy",
    },
  });

  return {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    keyId: getKeyId(),
  };
}

export function verifyRazorpayPaymentSignature(opts: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const body = `${opts.orderId}|${opts.paymentId}`;
  const expected = createHmac("sha256", getKeySecret())
    .update(body)
    .digest("hex");

  return expected === opts.signature;
}
