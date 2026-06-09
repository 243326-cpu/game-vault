import { NextRequest, NextResponse } from "next/server"

import { countRegistrations } from "@/lib/registration"
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

    const data = await supabaseRest<Array<{ id: string; name: string; game: string; spots: number; status: string }>>(
      "tournaments",
      { query }
    )

    const result = await Promise.all(
      (data || []).map(async (tournament) => ({
        ...tournament,
        registered: await countRegistrations({
          game: tournament.game,
        }),
      }))
    )

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load tournaments" },
      { status: 500 }
    )
  }
}
