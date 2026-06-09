import { NextRequest, NextResponse } from "next/server"

import { escapeRegExp, tournaments } from "@/lib/gamevault-data"
import { Registration, seedRegistrations } from "@/lib/registration"

export async function GET(request: NextRequest) {
  try {
    await seedRegistrations()
    const game = request.nextUrl.searchParams.get("game")
    const result = await Promise.all(
      tournaments.map(async (tournament) => ({
        ...tournament,
        registered: await Registration.countDocuments({
          game: new RegExp(`^${escapeRegExp(tournament.game)}$`, "i"),
        }),
      }))
    )

    const filtered = game
      ? result.filter((tournament) => tournament.game.toLowerCase() === game.toLowerCase())
      : result

    return NextResponse.json(filtered)
  } catch {
    return NextResponse.json({ error: "Unable to load tournaments" }, { status: 500 })
  }
}
