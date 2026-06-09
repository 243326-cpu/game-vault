import { NextRequest, NextResponse } from "next/server"

import { escapeRegExp } from "@/lib/gamevault-data"
import {
  Registration,
  registrationFilter,
  registrationPayload,
  seedRegistrations,
  toRegistration,
} from "@/lib/registration"

export async function GET(request: NextRequest) {
  try {
    await seedRegistrations()
    const registrations = await Registration.find(registrationFilter(request.nextUrl.searchParams))
      .sort({ registeredAt: -1, gamertag: 1 })
      .lean()

    return NextResponse.json(registrations.map(toRegistration))
  } catch {
    return NextResponse.json({ error: "Unable to load registrations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await seedRegistrations()
    const data = registrationPayload(await request.json())

    if (!data.name || !data.gamertag || !data.game) {
      return NextResponse.json({ error: "name, gamertag, and game are required" }, { status: 400 })
    }

    const count = await Registration.countDocuments()
    if (count >= 10) {
      return NextResponse.json({ error: "Tournament is full! Maximum 10 players reached." }, { status: 400 })
    }

    const duplicate = await Registration.findOne({
      gamertag: new RegExp(`^${escapeRegExp(data.gamertag)}$`, "i"),
    })
    if (duplicate) {
      return NextResponse.json({ error: "That gamertag is already registered." }, { status: 409 })
    }

    const now = new Date().toLocaleString()
    const created = await Registration.create({
      id: `tp-${Date.now()}`,
      ...data,
      registeredAt: now,
      updatedAt: now,
    })

    return NextResponse.json(toRegistration(created), { status: 201 })
  } catch {
    return NextResponse.json({ error: "Unable to create registration" }, { status: 500 })
  }
}
