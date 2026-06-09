import { NextRequest, NextResponse } from "next/server"

import { hasSupabaseConfig, supabaseRest } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json([])
    }

    const { searchParams } = request.nextUrl
    const game = searchParams.get("game")
    const rank = searchParams.get("rank")
    const name = searchParams.get("name")
    const limit = searchParams.get("limit")
    const query = new URLSearchParams({ select: "*", order: "score.desc" })

    if (name) {
      query.set("name", `ilike.*${name.replaceAll("*", "")}*`)
    }

    if (game) {
      query.set("game", `ilike.${game}`)
    }

    if (rank) {
      query.set("rank", `ilike.${rank}`)
    }

    if (limit) {
      query.set("limit", String(Number(limit)))
    }

    return NextResponse.json(await supabaseRest("players", { query }))
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load players" },
      { status: 500 }
    )
  }
}
