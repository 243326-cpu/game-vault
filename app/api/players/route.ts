import { readFile } from "fs/promises"
import path from "path"

import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const file = path.join(process.cwd(), "public", "players.json")
    const raw = await readFile(file, "utf8")
    let players = JSON.parse(raw)
    const { searchParams } = request.nextUrl
    const game = searchParams.get("game")
    const rank = searchParams.get("rank")
    const name = searchParams.get("name")
    const limit = searchParams.get("limit")

    if (name) {
      const q = name.toLowerCase()
      players = players.filter((player: any) => String(player.name).toLowerCase().includes(q))
    }

    if (game) {
      players = players.filter((player: any) => String(player.game).toLowerCase() === game.toLowerCase())
    }

    if (rank) {
      players = players.filter((player: any) => String(player.rank).toLowerCase() === rank.toLowerCase())
    }

    players.sort((a: any, b: any) => (b.score || 0) - (a.score || 0))

    if (limit) {
      players = players.slice(0, Number(limit))
    }

    return NextResponse.json(players)
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
