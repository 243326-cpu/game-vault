"use client"

import { useState, useEffect } from "react"
import { Trophy, UserPlus, Trash2, Users, Shield, Gamepad2, AlertCircle, CheckCircle2 } from "lucide-react"

const MAX_PLAYERS = 10
const API_BASE = "/api"

interface Player {
  id: string
  name: string
  gamertag: string
  game: string
  paymentMethod: string
  paymentStatus: string
  registrationFee: number
  registeredAt: string
}

const GAMES = ["Valorant", "CS2", "League of Legends", "Fortnite", "Apex Legends", "Call of Duty", "Overwatch 2", "Rocket League"]
const PAYMENT_METHODS = ["USDT", "JazzCash", "EasyPaisa", "Bitcoin", "Ethereum", "Stripe Sandbox", "PayPal Sandbox"]

export function TournamentRegistration() {
  const [players, setPlayers] = useState<Player[]>([])
  const [form, setForm] = useState({ name: "", gamertag: "", game: GAMES[0], paymentMethod: PAYMENT_METHODS[0] })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [removing, setRemoving] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTournamentPlayers() {
      try {
        const response = await fetch(`${API_BASE}/registrations`)
        if (!response.ok) throw new Error(`Failed to load tournament players: ${response.status}`)
        const data = await response.json()
        setPlayers(Array.isArray(data) ? data : [])
      } catch {
        setError("Unable to load registrations from the database.")
      } finally {
        setLoading(false)
      }
    }

    fetchTournamentPlayers()
  }, [])

  const persist = (updated: Player[]) => {
    setPlayers(updated)
    window.dispatchEvent(new Event("registrations-updated"))
  }

  const handleRegister = async () => {
    setError("")
    setSuccess("")

    if (!form.name.trim() || !form.gamertag.trim()) {
      setError("Please fill in all fields.")
      return
    }
    if (players.length >= MAX_PLAYERS) {
      setError("Tournament is full! Maximum 10 players reached.")
      return
    }
    const duplicate = players.find(
      (p) => p.gamertag.toLowerCase() === form.gamertag.toLowerCase()
    )
    if (duplicate) {
      setError("That gamertag is already registered.")
      return
    }

    try {
      const response = await fetch(`${API_BASE}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          gamertag: form.gamertag.trim(),
          game: form.game,
          paymentMethod: form.paymentMethod,
          paymentStatus: "Paid",
          registrationFee: 500,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Unable to register player.")
      }

      const newPlayer: Player = data
      persist([...players, newPlayer])
      setForm({ name: "", gamertag: "", game: GAMES[0], paymentMethod: PAYMENT_METHODS[0] })
      setSuccess(`${newPlayer.gamertag} registered and payment marked as ${newPlayer.paymentStatus}.`)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register player.")
    }
  }

  const handleRemove = (id: string) => {
    setRemoving(id)
    setTimeout(async () => {
      try {
        await fetch(`${API_BASE}/registrations/${id}`, { method: "DELETE" })
      } catch {}
      persist(players.filter((p) => p.id !== id))
      setRemoving(null)
    }, 300)
  }

  const spotsLeft = MAX_PLAYERS - players.length
  const isFull = spotsLeft === 0

  return (
    <section id="tournament" className="relative py-24 overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/4 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Open Registration
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Tournament <span className="text-primary">Registration</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Secure your spot in the next championship. Limited to 10 elite competitors.
          </p>
        </div>

        {/* Stats bar */}
        <div className="mb-10 mx-auto max-w-3xl grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-4">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-foreground">{players.length}</span>
            <span className="text-xs text-muted-foreground">{loading ? "Loading" : "Registered"}</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-4">
            <Shield className="h-5 w-5 text-accent" />
            <span className="text-2xl font-bold text-foreground">{spotsLeft}</span>
            <span className="text-xs text-muted-foreground">Spots Left</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-4">
            <Trophy className="h-5 w-5 text-[var(--gold)]" />
            <span className="text-2xl font-bold text-foreground">{MAX_PLAYERS}</span>
            <span className="text-xs text-muted-foreground">Max Players</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mx-auto max-w-3xl mb-10">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Registration Progress</span>
            <span>{players.length}/{MAX_PLAYERS} players</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(players.length / MAX_PLAYERS) * 100}%`,
                background: isFull
                  ? "var(--accent)"
                  : "linear-gradient(90deg, var(--primary), #00b8d4)",
              }}
            />
          </div>
          {isFull && (
            <p className="mt-2 text-center text-xs font-semibold text-accent">
              ⚡ Tournament is now FULL — registration closed
            </p>
          )}
        </div>

        <div className="mx-auto max-w-3xl grid gap-8 lg:grid-cols-2">
          {/* Registration Form */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Join Tournament</h3>
                <p className="text-xs text-muted-foreground">Fill in your details below</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your full name"
                  disabled={isFull}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Gamertag
                </label>
                <input
                  type="text"
                  value={form.gamertag}
                  onChange={(e) => setForm({ ...form, gamertag: e.target.value })}
                  placeholder="Your in-game username"
                  disabled={isFull}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Game
                </label>
                <select
                  value={form.game}
                  onChange={(e) => setForm({ ...form, game: e.target.value })}
                  disabled={isFull}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {GAMES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Payment Method
                </label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  disabled={isFull}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">Mock registration fee: Rs. 500</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm text-accent">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm text-primary">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {success}
                </div>
              )}

              <button
                onClick={handleRegister}
                disabled={isFull}
                className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isFull ? "Tournament Full" : "Register Now"}
              </button>
            </div>
          </div>

          {/* Participants List */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Participants</h3>
                  <p className="text-xs text-muted-foreground">
                    Total Registered: <span className="font-bold text-primary">{players.length}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {players.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Gamepad2 className="mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No players registered yet.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {loading ? "Loading from API..." : "Be the first to join!"}
                  </p>
                </div>
              ) : (
                players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`group flex items-center justify-between rounded-lg border border-border bg-background/50 px-4 py-3 transition-all duration-300 hover:border-primary/30 hover:bg-primary/5 ${
                      removing === player.id ? "opacity-0 scale-95" : "opacity-100 scale-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-bold text-muted-foreground">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{player.gamertag}</p>
                        <p className="text-xs text-muted-foreground">
                          {player.name} - {player.game} - {player.paymentMethod} {player.paymentStatus}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(player.id)}
                      className="ml-2 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-accent/10 hover:text-accent"
                      title="Remove player"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
