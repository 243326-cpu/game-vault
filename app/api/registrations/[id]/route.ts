import { NextRequest, NextResponse } from "next/server"

import { escapeRegExp } from "@/lib/gamevault-data"
import { Registration, registrationPayload, seedRegistrations, toRegistration } from "@/lib/registration"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await seedRegistrations()
    const { id } = await context.params
    const registration = await Registration.findOne({ id }).lean()

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    return NextResponse.json(toRegistration(registration))
  } catch {
    return NextResponse.json({ error: "Unable to load registration" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await seedRegistrations()
    const { id } = await context.params
    const existing = await Registration.findOne({ id })

    if (!existing) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    const data = registrationPayload({
      ...toRegistration(existing),
      ...(await request.json()),
    })

    if (!data.name || !data.gamertag || !data.game) {
      return NextResponse.json({ error: "name, gamertag, and game are required" }, { status: 400 })
    }

    const duplicate = await Registration.findOne({
      id: { $ne: id },
      gamertag: new RegExp(`^${escapeRegExp(data.gamertag)}$`, "i"),
    })
    if (duplicate) {
      return NextResponse.json({ error: "That gamertag is already registered." }, { status: 409 })
    }

    const updated = await Registration.findOneAndUpdate(
      { id },
      { ...data, updatedAt: new Date().toLocaleString() },
      { new: true }
    )

    return NextResponse.json(toRegistration(updated))
  } catch {
    return NextResponse.json({ error: "Unable to update registration" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await seedRegistrations()
    const { id } = await context.params
    const deleted = await Registration.findOneAndDelete({ id })

    if (!deleted) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    return NextResponse.json(toRegistration(deleted))
  } catch {
    return NextResponse.json({ error: "Unable to delete registration" }, { status: 500 })
  }
}
