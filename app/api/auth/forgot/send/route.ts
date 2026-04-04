import { NextRequest } from "next/server"
import { createOTP } from "@/lib/otp"
import { getUserByEmail } from "@/lib/auth-utils"
import { sendPasswordResetOTP } from "@/lib/email"
import { rateLimitByIp } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const rl = rateLimitByIp(ip, "forgot:send", 5, 60 * 60 * 1000)
  if (rl) return rl

  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return Response.json({ error: "Valid email is required" }, { status: 400 })
    }

    const user = await getUserByEmail(email)
    // Don't reveal whether email exists — always return success
    if (user && user.hashedPassword) {
      const code = await createOTP(email, "password-reset")
      await sendPasswordResetOTP(email, code)
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error("[forgot/send] Error:", err)
    return Response.json({ error: "Failed to send reset code" }, { status: 500 })
  }
}
