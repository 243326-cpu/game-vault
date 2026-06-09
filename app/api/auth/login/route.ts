import { NextRequest, NextResponse } from "next/server"

import { loginUser, normalizeEmail, setAuthCookie, toPublicUser } from "@/lib/auth"
import { hasSupabaseConfig, SupabaseApiError } from "@/lib/supabase"

function authErrorStatus(error: unknown) {
  if (!(error instanceof SupabaseApiError)) return 500
  if (error.status === 400 || error.status === 422) return 401
  return error.status >= 500 ? 503 : error.status
}

export async function POST(request: NextRequest) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json(
        { error: "Supabase is not configured. Add Supabase environment variables before logging in." },
        { status: 503 }
      )
    }

    const body = await request.json()
    const email = normalizeEmail(body.email)
    const password = String(body.password || "")

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
    }

    const data = await loginUser({ email, password })
    const user = toPublicUser(data.user)
    const response = NextResponse.json({ user })

    setAuthCookie(response, {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to log in." },
      { status: authErrorStatus(error) }
    )
  }
}
