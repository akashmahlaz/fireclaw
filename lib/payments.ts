import client from "@/lib/db";

const DB_NAME = "fireclaw";

type PaymentStatus = "created" | "captured" | "failed";

export interface PaymentRecord {
  userId: string;
  orderId: string;
  paymentId?: string;
  signature?: string;
  tier: "starter" | "standard" | "pro" | "enterprise";
  amount: number;
  currency: string;
  agentName: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

function payments() {
  return client.db(DB_NAME).collection<PaymentRecord>("payments");
}

export async function createPaymentRecord(data: Omit<PaymentRecord, "createdAt" | "updatedAt">) {
  const now = new Date();
  await payments().insertOne({
    ...data,
    createdAt: now,
    updatedAt: now,
  });
}

export async function markPaymentCaptured(opts: {
  userId: string;
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  await payments().updateOne(
    { userId: opts.userId, orderId: opts.orderId },
    {
      $set: {
        status: "captured",
        paymentId: opts.paymentId,
        signature: opts.signature,
        updatedAt: new Date(),
      },
    }
  );
}
