import { NextRequest, NextResponse } from "next/server"

import { hasSupabaseConfig, supabaseRest } from "@/lib/supabase"

function toLeaderboardScore(row: any) {
  return {
    id: row.id,
    name: row.player_name,
    score: Number(row.score || 0),
    date: row.created_at,
  }
}

export async function GET() {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json([])
    }

    const query = new URLSearchParams({ select: "*", order: "score.desc,created_at.asc" })
    const data = await supabaseRest<any[]>("leaderboard_scores", { query })

    return NextResponse.json(data.map(toLeaderboardScore))
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load leaderboard" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json(
        { error: "Supabase is not configured. Add Supabase environment variables before saving scores." },
        { status: 503 }
      )
    }

    const body = await request.json()
    const name = String(body.name || "").trim()
    const score = Number(body.score)

    if (!name || !Number.isFinite(score) || score < 0) {
      return NextResponse.json({ error: "Player name and a non-negative score are required." }, { status: 400 })
    }

    const data = await supabaseRest<any[]>("leaderboard_scores", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: { player_name: name, score },
    })

    return NextResponse.json(toLeaderboardScore(data[0]), { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save leaderboard score" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ ok: true })
    }

    const query = new URLSearchParams({ id: "not.is.null" })
    await supabaseRest("leaderboard_scores", { method: "DELETE", query })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to clear leaderboard" },
      { status: 500 }
    )
  }
}
