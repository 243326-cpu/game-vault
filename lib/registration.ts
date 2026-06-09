import { hasSupabaseConfig, supabaseRest } from "@/lib/supabase"

export type RegistrationPayload = {
  name: string
  gamertag: string
  game: string
  tournamentId: string
  paymentMethod: string
  paymentStatus: string
  registrationFee: number
}

type RegistrationFilter = {
  game?: string
  paymentStatus?: string
  name?: string
}

type RegistrationRow = {
  id: string
  name: string
  gamertag: string
  game: string
  tournament_id: string | null
  payment_method: string
  payment_status: string
  registration_fee: number
  registered_at: string
  updated_at: string
}

export function toRegistration(row: RegistrationRow) {
  return {
    id: row.id,
    name: row.name,
    gamertag: row.gamertag,
    game: row.game,
    tournamentId: row.tournament_id || "t1",
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    registrationFee: Number(row.registration_fee),
    registeredAt: row.registered_at,
    updatedAt: row.updated_at,
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

export function registrationFilter(query: URLSearchParams): RegistrationFilter {
  return {
    game: query.get("game") || undefined,
    paymentStatus: query.get("paymentStatus") || undefined,
    name: query.get("name") || undefined,
  }
}

function registrationQuery(filter: RegistrationFilter = {}, select = "*") {
  const query = new URLSearchParams({ select })
  if (filter.game) {
    query.set("game", `ilike.${filter.game}`)
  }

  if (filter.paymentStatus) {
    query.set("payment_status", `ilike.${filter.paymentStatus}`)
  }

  if (filter.name) {
    const search = filter.name.replaceAll("*", "")
    query.set("or", `(name.ilike.*${search}*,gamertag.ilike.*${search}*)`)
  }

  return query
}

export async function listRegistrations(filter: RegistrationFilter = {}) {
  if (!hasSupabaseConfig()) return []

  const query = registrationQuery(filter)
  query.set("order", "registered_at.desc,gamertag.asc")
  const data = await supabaseRest<RegistrationRow[]>("registrations", { query })
  return data.map(toRegistration)
}

export async function countRegistrations(filter: RegistrationFilter = {}) {
  return (await listRegistrations(filter)).length
}

export async function findRegistrationById(id: string) {
  if (!hasSupabaseConfig()) return null

  const query = new URLSearchParams({ select: "*", id: `eq.${id}`, limit: "1" })
  const data = await supabaseRest<RegistrationRow[]>("registrations", { query })
  return data[0] ? toRegistration(data[0]) : null
}

export async function findRegistrationByGamertag(gamertag: string, exceptId?: string) {
  if (!hasSupabaseConfig()) return null

  const query = new URLSearchParams({ select: "*", gamertag: `ilike.${gamertag}` })
  const data = await supabaseRest<RegistrationRow[]>("registrations", { query })
  const match = data.find((registration) => registration.id !== exceptId)
  return match ? toRegistration(match) : null
}

export async function createRegistration(data: RegistrationPayload) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase is not configured. Add Supabase environment variables before creating registrations.")
  }

  const now = new Date().toISOString()
  const created = await supabaseRest<RegistrationRow[]>("registrations", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: {
      name: data.name,
      gamertag: data.gamertag,
      game: data.game,
      tournament_id: data.tournamentId,
      payment_method: data.paymentMethod,
      payment_status: data.paymentStatus,
      registration_fee: data.registrationFee,
      registered_at: now,
      updated_at: now,
    },
  })

  return toRegistration(created[0])
}

export async function updateRegistration(id: string, data: RegistrationPayload) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase is not configured. Add Supabase environment variables before updating registrations.")
  }

  const now = new Date().toISOString()
  const query = new URLSearchParams({ id: `eq.${id}` })
  const updated = await supabaseRest<RegistrationRow[]>("registrations", {
    method: "PATCH",
    query,
    headers: { Prefer: "return=representation" },
    body: {
      name: data.name,
      gamertag: data.gamertag,
      game: data.game,
      tournament_id: data.tournamentId,
      payment_method: data.paymentMethod,
      payment_status: data.paymentStatus,
      registration_fee: data.registrationFee,
      updated_at: now,
    },
  })

  return updated[0] ? toRegistration(updated[0]) : null
}

export async function deleteRegistration(id: string) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase is not configured. Add Supabase environment variables before deleting registrations.")
  }

  const query = new URLSearchParams({ id: `eq.${id}` })
  const data = await supabaseRest<RegistrationRow[]>("registrations", {
    method: "DELETE",
    query,
    headers: { Prefer: "return=representation" },
  })
  return data[0] ? toRegistration(data[0]) : null
}
