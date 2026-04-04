import { hash, compare } from "bcryptjs"
import client from "./db"

const DB_NAME = "fireclaw"

function users() {
  return client.db(DB_NAME).collection("users")
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return compare(password, hashedPassword)
}

export async function getUserByEmail(email: string) {
  return users().findOne({ email: email.toLowerCase() })
}

export async function createUserWithCredentials(data: {
  name: string
  email: string
  password: string
}) {
  const existing = await getUserByEmail(data.email)
  if (existing) {
    throw new Error("Email already registered")
  }

  const hashedPassword = await hashPassword(data.password)
  const now = new Date()

  const result = await users().insertOne({
    name: data.name,
    email: data.email.toLowerCase(),
    hashedPassword,
    emailVerified: null,
    image: null,
    createdAt: now,
    updatedAt: now,
  })

  return { id: result.insertedId.toString(), email: data.email.toLowerCase(), name: data.name }
}
