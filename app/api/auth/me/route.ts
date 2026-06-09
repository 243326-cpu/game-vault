import { NextRequest, NextResponse } from "next/server"

import { AUTH_COOKIE, clearAuthCookie, sessionFromCookie, userFromSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = await userFromSession(sessionFromCookie(request.cookies.get(AUTH_COOKIE)?.value))

  if (!user) {
    const response = NextResponse.json({ user: null })
    clearAuthCookie(response)
    return response
  }

  return NextResponse.json({ user })
}
