import { NextRequest, NextResponse } from "next/server"

import { teams } from "@/lib/gamevault-data"

export async function GET(request: NextRequest) {
  const game = request.nextUrl.searchParams.get("game")
  const result = game
    ? teams.filter((team) => team.game.toLowerCase() === game.toLowerCase())
    : teams

  return NextResponse.json(result)
}
