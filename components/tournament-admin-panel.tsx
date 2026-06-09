"use client"

import { useEffect, useMemo, useState } from "react"
import { Edit3, Save, Trash2, X, Database, ShieldCheck, CreditCard } from "lucide-react"

const API_BASE = "/api"
const GAMES = ["Valorant", "CS2", "League of Legends", "Fortnite", "Apex Legends", "Call of Duty", "Overwatch 2", "Rocket League"]
const PAYMENT_METHODS = ["USDT", "JazzCash", "EasyPaisa", "Bitcoin", "Ethereum", "Stripe Sandbox", "PayPal Sandbox"]
const PAYMENT_STATUSES = ["Paid", "Pending", "Failed", "Refunded"]

interface Registration {
  id: string
  name: string
  gamertag: string
  game: string
  tournamentId: string
  paymentMethod: string
  paymentStatus: string
  registrationFee: number
  registeredAt: string
  updatedAt: string
}

export function TournamentAdminPanel() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<Registration>>({})
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)

  async function loadRegistrations() {
    try {
      const response = await fetch(`${API_BASE}/registrations`)
      if (!response.ok) throw new Error(`Failed to load registrations: ${response.status}`)
      const data = await response.json()
      setRegistrations(Array.isArray(data) ? data : [])
      setStatus("")
    } catch {
      setStatus("Unable to load admin data from the Next.js API.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRegistrations()
    window.addEventListener("registrations-updated", loadRegistrations)
    return () => window.removeEventListener("registrations-updated", loadRegistrations)
  }, [])

  const stats = useMemo(() => {
    const paid = registrations.filter((item) => item.paymentStatus === "Paid").length
    const revenue = registrations
      .filter((item) => item.paymentStatus === "Paid")
      .reduce((total, item) => total + Number(item.registrationFee || 0), 0)

    return { paid, revenue }
  }, [registrations])

  const startEdit = (registration: Registration) => {
    setEditingId(registration.id)
    setDraft(registration)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraft({})
  }

  const updateDraft = (field: keyof Registration, value: string | number) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const saveRegistration = async () => {
    if (!editingId) return

    try {
      const response = await fetch(`${API_BASE}/registrations/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Unable to update registration.")

      setRegistrations((current) => current.map((item) => (item.id === editingId ? data : item)))
      window.dispatchEvent(new Event("registrations-updated"))
      setStatus("Registration updated successfully.")
      cancelEdit()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to update registration.")
    }
  }

  const deleteRegistration = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/registrations/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Unable to delete registration.")

      setRegistrations((current) => current.filter((item) => item.id !== id))
      window.dispatchEvent(new Event("registrations-updated"))
      setStatus("Registration deleted successfully.")
    } catch {
      setStatus("Unable to delete registration.")
    }
  }

  return (
    <section id="admin" className="border-y border-border bg-secondary/20 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Admin Panel</p>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">Tournament Management</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage tournament registrations, payment status, and database records from one dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={loadRegistrations}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-background"
          >
            Refresh
          </button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5">
            <Database className="mb-3 h-5 w-5 text-primary" />
            <p className="text-2xl font-bold text-foreground">{registrations.length}</p>
            <p className="text-xs text-muted-foreground">Database Records</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <CreditCard className="mb-3 h-5 w-5 text-primary" />
            <p className="text-2xl font-bold text-foreground">{stats.paid}</p>
            <p className="text-xs text-muted-foreground">Paid Registrations</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
            <p className="text-2xl font-bold text-foreground">Rs. {stats.revenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Mock Revenue</p>
          </div>
        </div>

        {status && (
          <div className="mb-6 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            {status}
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="border-b border-border bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Game</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Fee</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>
                      Loading records from database...
                    </td>
                  </tr>
                ) : registrations.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>
                      No registration records found.
                    </td>
                  </tr>
                ) : (
                  registrations.map((registration) => {
                    const isEditing = editingId === registration.id
                    return (
                      <tr key={registration.id} className="border-b border-border last:border-b-0">
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="grid gap-2">
                              <input
                                value={String(draft.name || "")}
                                onChange={(event) => updateDraft("name", event.target.value)}
                                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                              />
                              <input
                                value={String(draft.gamertag || "")}
                                onChange={(event) => updateDraft("gamertag", event.target.value)}
                                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                              />
                            </div>
                          ) : (
                            <div>
                              <p className="font-semibold text-foreground">{registration.gamertag}</p>
                              <p className="text-xs text-muted-foreground">{registration.name}</p>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <select
                              value={String(draft.game || GAMES[0])}
                              onChange={(event) => updateDraft("game", event.target.value)}
                              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                            >
                              {GAMES.map((game) => (
                                <option key={game} value={game}>{game}</option>
                              ))}
                            </select>
                          ) : registration.game}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <select
                              value={String(draft.paymentMethod || PAYMENT_METHODS[0])}
                              onChange={(event) => updateDraft("paymentMethod", event.target.value)}
                              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                            >
                              {PAYMENT_METHODS.map((method) => (
                                <option key={method} value={method}>{method}</option>
                              ))}
                            </select>
                          ) : registration.paymentMethod}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="number"
                              value={Number(draft.registrationFee || 0)}
                              onChange={(event) => updateDraft("registrationFee", Number(event.target.value))}
                              className="w-24 rounded-md border border-border bg-background px-3 py-2 text-sm"
                            />
                          ) : `Rs. ${registration.registrationFee}`}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <select
                              value={String(draft.paymentStatus || PAYMENT_STATUSES[0])}
                              onChange={(event) => updateDraft("paymentStatus", event.target.value)}
                              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                            >
                              {PAYMENT_STATUSES.map((paymentStatus) => (
                                <option key={paymentStatus} value={paymentStatus}>{paymentStatus}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                              {registration.paymentStatus}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{registration.registeredAt}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {isEditing ? (
                              <>
                                <button onClick={saveRegistration} className="rounded-md bg-primary p-2 text-primary-foreground" title="Save">
                                  <Save className="h-4 w-4" />
                                </button>
                                <button onClick={cancelEdit} className="rounded-md border border-border p-2 text-muted-foreground" title="Cancel">
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEdit(registration)} className="rounded-md border border-border p-2 text-muted-foreground hover:text-primary" title="Edit">
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button onClick={() => deleteRegistration(registration.id)} className="rounded-md border border-border p-2 text-muted-foreground hover:text-accent" title="Delete">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">Database Schema</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Supabase table: registrations. Fields: id, name, gamertag, game, tournamentId, paymentMethod,
              paymentStatus, registrationFee, registeredAt, updatedAt.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">Admin Authorities</h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Admin can view all registrations, update player/game/payment details, delete records, refresh database data,
              and monitor paid registrations plus mock payment revenue.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
