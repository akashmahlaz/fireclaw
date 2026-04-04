import crypto from "crypto"
import client from "./db"

const DB_NAME = "fireclaw"

function otpCollection() {
  return client.db(DB_NAME).collection("otp_codes")
}

/** Generate a secure 6-digit OTP */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString()
}

/** Store OTP — one active code per email+purpose. Expires in 10 minutes. */
export async function createOTP(
  email: string,
  purpose: "email-verify" | "password-reset",
): Promise<string> {
  const col = otpCollection()
  const code = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min

  // Delete any existing OTP for this email+purpose
  await col.deleteMany({ email: email.toLowerCase(), purpose })

  await col.insertOne({
    email: email.toLowerCase(),
    purpose,
    code,
    expiresAt,
    attempts: 0,
    createdAt: new Date(),
  })

  return code
}

/** Verify OTP. Returns true if valid, false otherwise. Max 5 attempts. */
export async function verifyOTP(
  email: string,
  purpose: "email-verify" | "password-reset",
  code: string,
): Promise<boolean> {
  const col = otpCollection()
  const entry = await col.findOne({
    email: email.toLowerCase(),
    purpose,
    expiresAt: { $gt: new Date() },
  })

  if (!entry) return false

  // Too many attempts — burn the OTP
  if (entry.attempts >= 5) {
    await col.deleteOne({ _id: entry._id })
    return false
  }

  if (entry.code !== code) {
    await col.updateOne({ _id: entry._id }, { $inc: { attempts: 1 } })
    return false
  }

  // Valid — delete the OTP
  await col.deleteOne({ _id: entry._id })
  return true
}

/** Ensure TTL index exists for auto-cleanup of expired OTPs */
export async function ensureOTPIndexes() {
  const col = otpCollection()
  await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  await col.createIndex({ email: 1, purpose: 1 })
}
