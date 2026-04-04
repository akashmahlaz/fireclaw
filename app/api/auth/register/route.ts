import { createUserWithCredentials } from "@/lib/auth-utils"
import { rateLimitByIp } from "@/lib/rate-limit"
import { sendVerificationOTP } from "@/lib/email"
import { createOTP } from "@/lib/otp"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  // Rate limit: 5 registrations per hour per IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const rl = rateLimitByIp(ip, "auth:register", 5, 60 * 60 * 1000)
  if (rl) return rl

  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return Response.json({ error: "Name must be at least 2 characters" }, { status: 400 })
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return Response.json({ error: "Valid email is required" }, { status: 400 })
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const user = await createUserWithCredentials({
      name: name.trim(),
      email: email.trim(),
      password,
    })

    // Send verification OTP (non-blocking — user will verify on the next screen)
    const code = await createOTP(user.email, "email-verify")
    sendVerificationOTP(user.email, code).catch(() => {})

    return Response.json({ success: true, needsVerification: true, user: { id: user.id, email: user.email, name: user.name } }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message === "Email already registered") {
      return Response.json({ error: "Email already registered" }, { status: 409 })
    }
    console.error("[register] Error:", err)
    return Response.json({ error: "Registration failed" }, { status: 500 })
  }
}
