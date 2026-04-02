import { createHmac, randomUUID } from "crypto";
import Razorpay from "razorpay";

export type BillingTier = "starter" | "standard" | "pro" | "enterprise";

/**
 * Fallback tier prices in INR paise (used only if dynamic pricing is unavailable).
 * These should roughly match Hetzner cost + margin converted to INR.
 */
const TIER_PRICE_INR_PAISE: Record<BillingTier, number> = {
  starter: 42000,   // ~$5/mo
  standard: 100800, // ~$12/mo
  pro: 226800,      // ~$27/mo
  enterprise: 462000, // ~$55/mo
};

/**
 * When RAZORPAY_TEST_AMOUNT is set (e.g. "100" for ₹1),
 * all orders use that amount instead of real tier pricing.
 * Remove this env var for production.
 */
function getAmount(tier: BillingTier, dynamicPriceInr?: number): number {
  const testAmount = process.env.RAZORPAY_TEST_AMOUNT;
  if (testAmount) return Number(testAmount);
  // Use dynamic per-region pricing if provided, otherwise fallback
  if (dynamicPriceInr && dynamicPriceInr > 0) return dynamicPriceInr;
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
  const amount = getAmount(opts.tier, opts.priceInr);
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
