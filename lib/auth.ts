import crypto from "crypto"
import mongoose, { Schema } from "mongoose"

import { connectMongo } from "@/lib/mongodb"

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.MONGODB_URI || "gamevault-dev-session-secret"

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
  },
  { collection: "users", timestamps: true }
)

export const User = mongoose.models.User || mongoose.model("User", userSchema)

export type PublicUser = {
  id: string
  name: string
  email: string
}

export function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase()
}

export function toPublicUser(user: any): PublicUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
  }
}

export async function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = await new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(password, salt, 120000, 64, "sha512", (error, derivedKey) => {
      if (error) reject(error)
      else resolve(derivedKey.toString("hex"))
    })
  })

  return { salt, hash }
}

export async function verifyPassword(password: string, salt: string, expectedHash: string) {
  const { hash } = await hashPassword(password, salt)
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(expectedHash, "hex"))
}

function sign(value: string) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("base64url")
}

export function createSessionToken(user: PublicUser) {
  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  const payload = Buffer.from(JSON.stringify({ sub: user.id, email: user.email, exp: expiresAt })).toString("base64url")
  return `${payload}.${sign(payload)}`
}

export async function userFromToken(token: string | null) {
  if (!token) return null

  const [payload, signature] = token.split(".")
  if (!payload || !signature || sign(payload) !== signature) return null

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { sub: string; exp: number }
    if (!data.sub || !data.exp || data.exp < Math.floor(Date.now() / 1000)) return null

    await connectMongo()
    const user = await User.findById(data.sub).lean()
    return user ? toPublicUser(user) : null
  } catch {
    return null
  }
}

export function bearerToken(authorization: string | null) {
  if (!authorization?.startsWith("Bearer ")) return null
  return authorization.slice("Bearer ".length).trim()
}
