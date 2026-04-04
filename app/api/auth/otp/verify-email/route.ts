import { NextRequest } from "next/server"
import { verifyOTP } from "@/lib/otp"
import { rateLimitByIp } from "@/lib/rate-limit"
import client from "@/lib/db"

const DB_NAME = "fireclaw"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const rl = rateLimitByIp(ip, "otp:verify-email", 10, 60 * 60 * 1000)
  if (rl) return rl

  try {
    const { email, code } = await request.json()

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return Response.json({ error: "Valid email is required" }, { status: 400 })
    }

    if (!code || typeof code !== "string" || code.length !== 6) {
      return Response.json({ error: "Invalid code" }, { status: 400 })
    }

    const valid = await verifyOTP(email, "email-verify", code)
    if (!valid) {
      return Response.json({ error: "Invalid or expired code" }, { status: 400 })
    }

    // Mark email as verified
    await client.db(DB_NAME).collection("users").updateOne(
      { email: email.toLowerCase() },
      { $set: { emailVerified: new Date() } },
    )

    return Response.json({ success: true })
  } catch (err) {
    console.error("[otp/verify-email] Error:", err)
    return Response.json({ error: "Verification failed" }, { status: 500 })
  }
}
