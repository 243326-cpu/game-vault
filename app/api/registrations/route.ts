import { NextRequest, NextResponse } from "next/server"

import {
  countRegistrations,
  createRegistration,
  findRegistrationByGamertag,
  listRegistrations,
  registrationFilter,
  registrationPayload,
} from "@/lib/registration"

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(await listRegistrations(registrationFilter(request.nextUrl.searchParams)))
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load registrations" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = registrationPayload(await request.json())

    if (!data.name || !data.gamertag || !data.game) {
      return NextResponse.json({ error: "name, gamertag, and game are required" }, { status: 400 })
    }

    const count = await countRegistrations()
    if (count >= 10) {
      return NextResponse.json({ error: "Tournament is full! Maximum 10 players reached." }, { status: 400 })
    }

    const duplicate = await findRegistrationByGamertag(data.gamertag)
    if (duplicate) {
      return NextResponse.json({ error: "That gamertag is already registered." }, { status: 409 })
    }

    return NextResponse.json(await createRegistration(data), { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create registration" },
      { status: 500 }
    )
  }
}
