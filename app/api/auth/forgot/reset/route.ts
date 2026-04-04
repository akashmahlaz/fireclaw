import { NextRequest } from "next/server"
import { verifyOTP } from "@/lib/otp"
import { hashPassword, getUserByEmail } from "@/lib/auth-utils"
import { rateLimitByIp } from "@/lib/rate-limit"
import client from "@/lib/db"

const DB_NAME = "fireclaw"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const rl = rateLimitByIp(ip, "forgot:reset", 5, 60 * 60 * 1000)
  if (rl) return rl

  try {
    const { email, code, newPassword } = await request.json()

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return Response.json({ error: "Valid email is required" }, { status: 400 })
    }

    if (!code || typeof code !== "string" || code.length !== 6) {
      return Response.json({ error: "Invalid code" }, { status: 400 })
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Verify user exists and has a password-based account
    const user = await getUserByEmail(email)
    if (!user || !user.hashedPassword) {
      return Response.json({ error: "Invalid or expired code" }, { status: 400 })
    }

    const valid = await verifyOTP(email, "password-reset", code)
    if (!valid) {
      return Response.json({ error: "Invalid or expired code" }, { status: 400 })
    }

    // Update password
    const hashedPassword = await hashPassword(newPassword)
    await client.db(DB_NAME).collection("users").updateOne(
      { _id: user._id },
      { $set: { hashedPassword, updatedAt: new Date() } },
    )

    return Response.json({ success: true })
  } catch (err) {
    console.error("[forgot/reset] Error:", err)
    return Response.json({ error: "Password reset failed" }, { status: 500 })
  }
}
