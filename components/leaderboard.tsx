"use client"

import { useState, useEffect, useCallback } from "react"
import { Trophy, Crown, Medal, Star, Trash2 } from "lucide-react"

// Player interface for type safety
interface Player {
  id: string
  name: string
  score: number
  date: string
}

// Load players from localStorage using JSON
function loadPlayers(): Player[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("gamevault_players")
    if (stored) {
      const parsed: Player[] = JSON.parse(stored)
      return parsed
    }
  } catch {
    // If JSON parsing fails, return empty array
  }
  return []
}

// Save players to localStorage using JSON
function savePlayers(players: Player[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("gamevault_players", JSON.stringify(players))
}

export function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([])
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadPlayers()
    // Sort in descending order by score
    const sorted = [...loaded].sort((a, b) => b.score - a.score)
    setPlayers(sorted)
    setMounted(true)
  }, [])

  // Add a player and update DOM dynamically
  const addPlayer = useCallback((name: string, score: number) => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name,
      score,
      date: new Date().toLocaleDateString(),
    }

    setPlayers((prev) => {
      // Use arrays - push new player, then sort descending
      const updated = [...prev, newPlayer]
      updated.sort((a, b) => b.score - a.score)
      // Persist to localStorage as JSON
      savePlayers(updated)
      return updated
    })
  }, [])

  // Remove a player
  const removePlayer = useCallback((id: string) => {
    setPlayers((prev) => {
      const updated = prev.filter((p) => p.id !== id)
      savePlayers(updated)
      return updated
    })
  }, [])

  // Clear all players
  const clearAll = useCallback(() => {
    setPlayers([])
    localStorage.removeItem("gamevault_players")
  }, [])

  if (!mounted) {
    return (
      <section id="leaderboard" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="leaderboard" className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Rankings</p>
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            Global Leaderboard
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-pretty text-muted-foreground">
            Players are ranked in descending order by score. The top player is highlighted as the champion.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Leaderboard Table - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              {/* Table Header */}
              <div className="flex items-center justify-between border-b border-border bg-secondary px-6 py-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                    Player Rankings
                  </h3>
                </div>
                {players.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear All
                  </button>
                )}
              </div>

              {/* Dynamic Table */}
              {players.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Trophy className="mb-4 h-12 w-12 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No players yet. Add a player to get started!</p>
                </div>
              ) : (
                <table className="w-full" role="table">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rank</th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Player</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player, index) => {
                      const rank = index + 1
                      const isTop = rank === 1
                      const isTopThree = rank <= 3

                      return (
                        <tr
                          key={player.id}
                          className={`border-b border-border transition-colors last:border-b-0 ${
                            isTop
                              ? "bg-primary/5"
                              : "hover:bg-secondary/50"
                          }`}
                        >
                          {/* Rank */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {rank === 1 && <Crown className="h-5 w-5 text-gold" />}
                              {rank === 2 && <Medal className="h-5 w-5 text-muted-foreground" />}
                              {rank === 3 && <Medal className="h-5 w-5 text-chart-5" />}
                              <span
                                className={`text-sm font-bold ${
                                  isTop
                                    ? "text-gold"
                                    : isTopThree
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                #{rank}
                              </span>
                            </div>
                          </td>

                          {/* Player Name */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                  isTop
                                    ? "bg-primary/20 text-primary"
                                    : "bg-secondary text-muted-foreground"
                                }`}
                              >
                                {player.name.charAt(0).toUpperCase()}
                              </div>
                              <span
                                className={`text-sm font-semibold ${
                                  isTop ? "text-primary" : "text-foreground"
                                }`}
                              >
                                {player.name}
                                {isTop && (
                                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
                                    <Star className="h-3 w-3" /> Champion
                                  </span>
                                )}
                              </span>
                            </div>
                          </td>

                          {/* Score */}
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`font-mono text-sm font-bold ${
                                isTop ? "text-gold" : "text-foreground"
                              }`}
                            >
                              {player.score.toLocaleString()}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4 text-right">
                            <span className="text-xs text-muted-foreground">{player.date}</span>
                          </td>

                          {/* Delete */}
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => removePlayer(player.id)}
                              className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                              aria-label={`Remove ${player.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}

              {/* Footer */}
              {players.length > 0 && (
                <div className="border-t border-border bg-secondary/50 px-6 py-3">
                  <p className="text-xs text-muted-foreground">
                    Showing {players.length} player{players.length !== 1 ? "s" : ""} | Data stored locally using JSON in localStorage
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Add Player Form */}
          <div className="lg:col-span-1">
            <AddPlayerForm onAddPlayer={addPlayer} />
          </div>
        </div>
      </div>
    </section>
  )
}

// Separate Add Player form component
function AddPlayerForm({ onAddPlayer }: { onAddPlayer: (name: string, score: number) => void }) {
  const [name, setName] = useState("")
  const [score, setScore] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validation
    if (!name.trim()) {
      setError("Player name is required.")
      return
    }
    if (!score || isNaN(Number(score)) || Number(score) < 0) {
      setError("Please enter a valid score (0 or higher).")
      return
    }

    onAddPlayer(name.trim(), Number(score))
    setName("")
    setScore("")
    setSuccess(true)

    // Clear success message after 3s
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div id="add-player" className="rounded-xl border border-border bg-card">
      <div className="border-b border-border bg-secondary px-6 py-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-gold" />
          <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Submit Score</h3>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="player-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Player Name
          </label>
          <input
            id="player-name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="player-score" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Score
          </label>
          <input
            id="player-score"
            type="number"
            placeholder="Enter your score"
            value={score}
            min="0"
            onChange={(e) => setScore(e.target.value)}
            className="rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive">{error}</p>
        )}

        {success && (
          <p className="rounded-lg bg-chart-4/10 px-4 py-2 text-xs font-medium text-chart-4">
            Player added successfully! Leaderboard updated.
          </p>
        )}

        <button
          type="submit"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90"
        >
          Add to Leaderboard
        </button>
      </form>

      {/* Info box */}
      <div className="border-t border-border px-6 py-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Scores are stored locally in your browser using JSON and localStorage. Players are automatically ranked in descending order. The top player is highlighted as the champion.
        </p>
      </div>
    </div>
  )
}
