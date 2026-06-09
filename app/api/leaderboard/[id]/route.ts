import { NextRequest, NextResponse } from "next/server"

import { hasSupabaseConfig, supabaseRest } from "@/lib/supabase"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json(
        { error: "Supabase is not configured. Add Supabase environment variables before deleting scores." },
        { status: 503 }
      )
    }

    const { id } = await context.params
    const query = new URLSearchParams({ id: `eq.${id}` })
    const data = await supabaseRest<Array<{ id: string }>>("leaderboard_scores", {
      method: "DELETE",
      query,
      headers: { Prefer: "return=representation" },
    })

    if (!data[0]) {
      return NextResponse.json({ error: "Leaderboard score not found" }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete leaderboard score" },
      { status: 500 }
    )
  }
}
