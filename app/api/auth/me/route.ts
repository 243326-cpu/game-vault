import { NextRequest, NextResponse } from "next/server"

import { bearerToken, userFromToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = await userFromToken(bearerToken(request.headers.get("authorization")))

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  return NextResponse.json({ user })
}
