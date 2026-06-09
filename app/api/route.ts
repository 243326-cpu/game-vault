import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "GameVault API is running inside Next.js",
    database: "MongoDB",
    endpoints: ["/api/players", "/api/registrations", "/api/tournaments", "/api/teams"],
  })
}
