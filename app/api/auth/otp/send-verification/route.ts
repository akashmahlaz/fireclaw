import { NextRequest } from "next/server"
import { createOTP } from "@/lib/otp"
import { getUserByEmail } from "@/lib/auth-utils"
import { sendVerificationOTP } from "@/lib/email"
import { rateLimitByIp } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const rl = rateLimitByIp(ip, "otp:send-verify", 5, 60 * 60 * 1000)
  if (rl) return rl

  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return Response.json({ error: "Valid email is required" }, { status: 400 })
    }

    const user = await getUserByEmail(email)
    if (!user) {
      // Don't reveal whether email exists
      return Response.json({ success: true })
    }

    if (user.emailVerified) {
      return Response.json({ error: "Email already verified" }, { status: 400 })
    }

    const code = await createOTP(email, "email-verify")
    await sendVerificationOTP(email, code)

    return Response.json({ success: true })
  } catch (err) {
    console.error("[otp/send-verification] Error:", err)
    return Response.json({ error: "Failed to send verification code" }, { status: 500 })
  }
}
