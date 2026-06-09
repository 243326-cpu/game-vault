import { NextRequest, NextResponse } from "next/server"

import {
  deleteRegistration,
  findRegistrationByGamertag,
  findRegistrationById,
  registrationPayload,
  updateRegistration,
} from "@/lib/registration"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const registration = await findRegistrationById(id)

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    return NextResponse.json(registration)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load registration" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const existing = await findRegistrationById(id)

    if (!existing) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    const data = registrationPayload({
      ...existing,
      ...(await request.json()),
    })

    if (!data.name || !data.gamertag || !data.game) {
      return NextResponse.json({ error: "name, gamertag, and game are required" }, { status: 400 })
    }

    const duplicate = await findRegistrationByGamertag(data.gamertag, id)
    if (duplicate) {
      return NextResponse.json({ error: "That gamertag is already registered." }, { status: 409 })
    }

    const updated = await updateRegistration(id, data)

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update registration" },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const deleted = await deleteRegistration(id)

    if (!deleted) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    return NextResponse.json(deleted)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete registration" },
      { status: 500 }
    )
  }
}
