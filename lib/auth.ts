import { NextResponse } from "next/server"

import { supabaseAuth, supabaseRest } from "@/lib/supabase"

export const AUTH_COOKIE = "gamevault_supabase_session"

type StoredSession = {
  access_token: string
  refresh_token: string
  expires_at?: number
}

export type PublicUser = {
  id: string
  name: string
  email: string
}

export function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase()
}

export function toPublicUser(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }, name?: string | null): PublicUser {
  return {
    id: user.id,
    name: String(name || user.user_metadata?.name || user.email?.split("@")[0] || "Player"),
    email: String(user.email || ""),
  }
}

export function sessionFromCookie(value: string | undefined) {
  if (!value) return null

  try {
    const session = JSON.parse(value) as StoredSession
    if (!session.access_token || !session.refresh_token) return null
    return session
  } catch {
    return null
  }
}

export function setAuthCookie(response: NextResponse, session: StoredSession) {
  response.cookies.set(AUTH_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
}

export async function createUserAccount(input: { name: string; email: string; password: string }) {
  const data = await supabaseAuth<{
    user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }
    session?: StoredSession | null
    access_token?: string
    refresh_token?: string
    expires_at?: number
  }>("signup", {
    method: "POST",
    body: {
    email: input.email,
    password: input.password,
      data: { name: input.name },
    },
  })

  if (!data.user) throw new Error("Supabase did not return a created user.")

  await supabaseRest("profiles", {
    method: "POST",
    query: new URLSearchParams({ on_conflict: "id" }),
    headers: {
      Prefer: "resolution=merge-duplicates",
    },
    body: {
      id: data.user.id,
      name: input.name,
      email: input.email,
      updated_at: new Date().toISOString(),
    },
  })

  return {
    user: data.user,
    session: data.session || (data.access_token && data.refresh_token
      ? {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
        }
      : null),
  }
}

export async function loginUser(input: { email: string; password: string }) {
  const data = await supabaseAuth<{
    user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }
    access_token: string
    refresh_token: string
    expires_at?: number
  }>("token?grant_type=password", {
    method: "POST",
    body: input,
  })

  if (!data.user || !data.access_token || !data.refresh_token) throw new Error("Unable to create Supabase session.")

  return {
    user: data.user,
    session: {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    },
  }
}

export async function userFromSession(session: StoredSession | null) {
  if (!session) return null

  const user = await supabaseAuth<{ id: string; email?: string | null; user_metadata?: Record<string, unknown> }>(
    "user",
    { accessToken: session.access_token }
  ).catch(() => null)

  if (!user) return null

  const query = new URLSearchParams({
    select: "name,email",
    id: `eq.${user.id}`,
  })
  const profiles = await supabaseRest<Array<{ name: string; email: string }>>("profiles", { query }).catch(() => [])

  return toPublicUser(user, profiles[0]?.name)
}
