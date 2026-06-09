import { NextRequest, NextResponse } from "next/server"

import { hasSupabaseConfig, supabaseRest } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json([])
    }

    const game = request.nextUrl.searchParams.get("game")
    const query = new URLSearchParams({ select: "*", order: "name.asc" })

    if (game) {
      query.set("game", `ilike.${game}`)
    }

    return NextResponse.json(await supabaseRest("teams", { query }))
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load teams" },
      { status: 500 }
    )
  }
}
