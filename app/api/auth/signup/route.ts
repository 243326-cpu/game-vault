import { NextRequest, NextResponse } from "next/server"

import { connectMongo } from "@/lib/mongodb"
import { createSessionToken, hashPassword, normalizeEmail, toPublicUser, User } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await connectMongo()
    const body = await request.json()
    const name = String(body.name || "").trim()
    const email = normalizeEmail(body.email)
    const password = String(body.password || "")

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 })
    }

    const existing = await User.findOne({ email }).lean()
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 })
    }

    const { salt, hash } = await hashPassword(password)
    const created = await User.create({
      name,
      email,
      passwordSalt: salt,
      passwordHash: hash,
    })
    const user = toPublicUser(created)

    return NextResponse.json({ user, token: createSessionToken(user) }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Unable to create account." }, { status: 500 })
  }
}
