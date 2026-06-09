import { NextRequest, NextResponse } from "next/server"

import { connectMongo } from "@/lib/mongodb"
import { createSessionToken, normalizeEmail, toPublicUser, User, verifyPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await connectMongo()
    const body = await request.json()
    const email = normalizeEmail(body.email)
    const password = String(body.password || "")

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
    }

    const account = await User.findOne({ email })
    if (!account || !(await verifyPassword(password, account.passwordSalt, account.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
    }

    const user = toPublicUser(account)
    return NextResponse.json({ user, token: createSessionToken(user) })
  } catch {
    return NextResponse.json({ error: "Unable to log in." }, { status: 500 })
  }
}
