import { NextRequest, NextResponse } from "next/server"

import { createUserAccount, normalizeEmail, setAuthCookie, toPublicUser } from "@/lib/auth"
import { hasSupabaseConfig, SupabaseApiError } from "@/lib/supabase"

function authErrorStatus(error: unknown) {
  if (!(error instanceof SupabaseApiError)) return 500
  if (error.status === 422 || error.status === 400) return 400
  if (error.status === 409) return 409
  return error.status >= 500 ? 503 : error.status
}

function authErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return "Unable to create account."

  if (error.message.toLowerCase().includes("invalid")) {
    return `${error.message}. Check your Supabase Auth email settings if this address should be allowed.`
  }

  return error.message
}

export async function POST(request: NextRequest) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json(
        { error: "Supabase is not configured. Add Supabase environment variables before creating accounts." },
        { status: 503 }
      )
    }

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

    const created = await createUserAccount({
      name,
      email,
      password,
    })
    const user = toPublicUser(created.user, name)
    const response = NextResponse.json({ user }, { status: 201 })

    if (created.session) {
      setAuthCookie(response, {
        access_token: created.session.access_token,
        refresh_token: created.session.refresh_token,
        expires_at: created.session.expires_at,
      })
    }

    return response
  } catch (error) {
    return NextResponse.json(
      { error: authErrorMessage(error) },
      { status: authErrorStatus(error) }
    )
  }
}
