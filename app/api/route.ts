import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "GameVault API is running inside Next.js",
    database: "Supabase",
    endpoints: ["/api/players", "/api/leaderboard", "/api/registrations", "/api/tournaments", "/api/teams"],
  })
}
