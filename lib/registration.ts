import mongoose, { Schema } from "mongoose"

import { connectMongo } from "@/lib/mongodb"
import { escapeRegExp } from "@/lib/gamevault-data"

export type RegistrationPayload = {
  name: string
  gamertag: string
  game: string
  tournamentId: string
  paymentMethod: string
  paymentStatus: string
  registrationFee: number
}

const registrationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    gamertag: { type: String, required: true, unique: true, trim: true },
    game: { type: String, required: true, trim: true },
    tournamentId: { type: String, default: "t1" },
    paymentMethod: { type: String, default: "USDT" },
    paymentStatus: { type: String, default: "Paid" },
    registrationFee: { type: Number, default: 500 },
    registeredAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { collection: "registrations" }
)

export const Registration =
  mongoose.models.Registration || mongoose.model("Registration", registrationSchema)

export function toRegistration(doc: any) {
  return {
    id: doc.id,
    name: doc.name,
    gamertag: doc.gamertag,
    game: doc.game,
    tournamentId: doc.tournamentId,
    paymentMethod: doc.paymentMethod,
    paymentStatus: doc.paymentStatus,
    registrationFee: doc.registrationFee,
    registeredAt: doc.registeredAt,
    updatedAt: doc.updatedAt,
  }
}

export function registrationPayload(body: any): RegistrationPayload {
  return {
    name: String(body.name || "").trim(),
    gamertag: String(body.gamertag || "").trim(),
    game: String(body.game || "").trim(),
    tournamentId: String(body.tournamentId || body.tournament_id || "t1").trim(),
    paymentMethod: String(body.paymentMethod || body.payment_method || "USDT").trim(),
    paymentStatus: String(body.paymentStatus || body.payment_status || "Paid").trim(),
    registrationFee: Number(body.registrationFee || body.registration_fee || 500),
  }
}

export function registrationFilter(query: URLSearchParams) {
  const filter: Record<string, any> = {}
  const game = query.get("game")
  const paymentStatus = query.get("paymentStatus")
  const name = query.get("name")

  if (game) {
    filter.game = new RegExp(`^${escapeRegExp(game)}$`, "i")
  }

  if (paymentStatus) {
    filter.paymentStatus = new RegExp(`^${escapeRegExp(paymentStatus)}$`, "i")
  }

  if (name) {
    const search = new RegExp(escapeRegExp(name), "i")
    filter.$or = [{ name: search }, { gamertag: search }]
  }

  return filter
}

export async function seedRegistrations() {
  await connectMongo()
  const count = await Registration.countDocuments()
  if (count > 0) return

  const now = new Date().toLocaleString()
  await Registration.insertMany([
    {
      id: "tp1",
      name: "Ayaan Malik",
      gamertag: "ShadowPro",
      game: "Valorant",
      tournamentId: "t1",
      paymentMethod: "USDT",
      paymentStatus: "Paid",
      registrationFee: 500,
      registeredAt: "2026-06-08 10:20 PM",
      updatedAt: now,
    },
    {
      id: "tp2",
      name: "Sara Khan",
      gamertag: "DiamondQueen",
      game: "Valorant",
      tournamentId: "t1",
      paymentMethod: "JazzCash",
      paymentStatus: "Paid",
      registrationFee: 500,
      registeredAt: "2026-06-08 10:24 PM",
      updatedAt: now,
    },
    {
      id: "tp3",
      name: "Hamza Ali",
      gamertag: "NinjaX",
      game: "PUBG",
      tournamentId: "t2",
      paymentMethod: "EasyPaisa",
      paymentStatus: "Pending",
      registrationFee: 500,
      registeredAt: "2026-06-08 10:30 PM",
      updatedAt: now,
    },
  ])
}
