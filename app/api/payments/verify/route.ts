import { auth } from "@/auth";
import { markPaymentCaptured } from "@/lib/payments";
import { verifyRazorpayPaymentSignature } from "@/lib/razorpay";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const orderId = body?.orderId as string;
  const paymentId = body?.paymentId as string;
  const signature = body?.signature as string;

  if (!orderId || !paymentId || !signature) {
    return Response.json({ error: "Missing payment fields" }, { status: 400 });
  }

  const valid = verifyRazorpayPaymentSignature({
    orderId,
    paymentId,
    signature,
  });

  if (!valid) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  await markPaymentCaptured({
    userId: session.user.id,
    orderId,
    paymentId,
    signature,
  });

  return Response.json({ success: true });
}
