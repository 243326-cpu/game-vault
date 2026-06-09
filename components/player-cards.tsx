"use client"

import { useEffect, useMemo, useState } from "react"

interface PlayerCard {
  id: string
  name: string
  game: string
  rank: string
  score: number
}

const STORAGE_KEY = "gamevault_playercards"

function normalizePlayers(data: any[]): PlayerCard[] {
  return data.map((player, index) => ({
    id:
      typeof player.id === "string"
        ? player.id
        : `${player.name}-${player.game}-${player.rank}-${index}`,
    name: String(player.name || "Unknown"),
    game: String(player.game || "Unknown"),
    rank: String(player.rank || "Rookie"),
    score: Number(player.score || 0),
  }))
}

function loadStoredPlayers(): PlayerCard[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return normalizePlayers(parsed)
  } catch {
    return []
  }
}

function savePlayers(players: PlayerCard[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players))
}

export function PlayerCards() {
  const [allPlayers, setAllPlayers] = useState<PlayerCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchName, setSearchName] = useState("")
  const [filterGame, setFilterGame] = useState("All")
  const [filterRank, setFilterRank] = useState("All")
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(() => {
    const stored = loadStoredPlayers()
    if (stored.length > 0) {
      setAllPlayers(stored)
      setLoading(false)
      return
    }

    async function fetchPlayers() {
      try {
        const response = await fetch("/api/players")
        if (!response.ok) {
          throw new Error(`Failed to fetch players: ${response.status}`)
        }
        const data = await response.json()
        // data may be an array (server) or object; normalize both
        const arr = Array.isArray(data) ? data : data.players || []
        const normalized = normalizePlayers(arr)
        setAllPlayers(normalized)
        savePlayers(normalized)
      } catch (err) {
        setError("Unable to load player cards. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  const games = useMemo(
    () => ["All", ...Array.from(new Set(allPlayers.map((player) => player.game)))],
    [allPlayers]
  )

  const ranks = useMemo(
    () => ["All", ...Array.from(new Set(allPlayers.map((player) => player.rank)))],
    [allPlayers]
  )

  const filteredPlayers = useMemo(() => {
    let result = [...allPlayers]

    const query = searchName.trim().toLowerCase()
    if (query) {
      result = result.filter((player) => player.name.toLowerCase().includes(query))
    }

    if (filterGame !== "All") {
      result = result.filter((player) => player.game === filterGame)
    }

    if (filterRank !== "All") {
      result = result.filter((player) => player.rank === filterRank)
    }

    return result.sort((a, b) => b.score - a.score)
  }, [allPlayers, searchName, filterGame, filterRank])

  useEffect(() => {
    if (loading) return
    setAnimationKey((prev) => prev + 1)
  }, [searchName, filterGame, filterRank, filteredPlayers.length, loading])

  const clearFilters = () => {
    setSearchName("")
    setFilterGame("All")
    setFilterRank("All")
  }

  return (
    <section id="top-players" className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
            Player Search & Filters
          </p>
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            Dynamic Player Cards with Search and Filters
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
            Search by name, filter by game or rank, and watch the top-ranked players update instantly on the cards.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-[1.5fr_1fr_1fr]">
          <input
            type="search"
            value={searchName}
            onChange={(event) => setSearchName(event.target.value)}
            placeholder="Search player by name"
            className="rounded-3xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <select
            value={filterGame}
            onChange={(event) => setFilterGame(event.target.value)}
            className="rounded-3xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {games.map((game) => (
              <option key={game} value={game}>
                {game}
              </option>
            ))}
          </select>

          <select
            value={filterRank}
            onChange={(event) => setFilterRank(event.target.value)}
            className="rounded-3xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {ranks.map((rank) => (
              <option key={rank} value={rank}>
                {rank}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-10 flex flex-col gap-4 rounded-3xl border border-border bg-secondary/70 px-6 py-5 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-foreground">
              Showing {filteredPlayers.length} player{filteredPlayers.length !== 1 ? "s" : ""}
            </p>
            <p>{filterRank !== "All" ? `Top ${filterRank} players ranked by score` : "Search and filter to find the best players."}</p>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center justify-center rounded-full border border-border bg-card/70 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
          >
            Reset filters
          </button>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-border bg-card px-8 py-12 text-center text-muted-foreground">
            Loading player cards...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-destructive/20 bg-destructive/5 px-8 py-12 text-center text-destructive">
            {error}
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card px-8 py-12 text-center text-muted-foreground">
            No matching players found. Try a different search or filter.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlayers.map((player, index) => {
              const isChampion = index === 0
              return (
                <article
                  key={`${player.id}-${animationKey}`}
                  className={`rounded-3xl border border-border bg-card/90 p-6 shadow-sm shadow-black/5 transition hover:-translate-y-1 hover:shadow-lg animate-flip ${
                    isChampion ? "border-primary/60 bg-gradient-to-br from-primary/10 via-card to-card" : "bg-card"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                        player.rank.toLowerCase() === "diamond"
                          ? "bg-gradient-to-r from-sky-500/15 to-cyan-400/20 text-primary"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {player.rank.toLowerCase() === "diamond" ? "♦" : ""}
                      {player.rank}
                    </span>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {player.game}
                    </span>
                  </div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{player.name}</h3>
                      <p className="text-sm text-muted-foreground">Score: {player.score.toLocaleString()}</p>
                    </div>
                    {isChampion && (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/20 to-cyan-400/20 text-primary ring-1 ring-sky-400/40">
                        <span className="text-xl">♦</span>
                      </div>
                    )}
                  </div>
                  <p className="mb-6 text-sm leading-6 text-muted-foreground">
                    {isChampion
                      ? "This top-ranked champion leads the search results with the highest score."
                      : `A strong competitor in ${player.game} with ${player.rank} status.`}
                  </p>
                  <div className="rounded-3xl bg-secondary px-4 py-4 text-center">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Player power</p>
                    <p className="text-3xl font-bold text-foreground">{player.score.toLocaleString()}</p>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
