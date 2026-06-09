import { Crosshair, Swords, Zap, Puzzle, Target, Flame } from "lucide-react"

import { LiquidGlass } from "@/components/liquid-glass"

const games = [
  {
    name: "Cyber Strike",
    genre: "FPS",
    players: "2.4K",
    icon: Crosshair,
  },
  {
    name: "Shadow Duel",
    genre: "Fighting",
    players: "1.8K",
    icon: Swords,
  },
  {
    name: "Neon Rush",
    genre: "Racing",
    players: "3.1K",
    icon: Zap,
  },
  {
    name: "Mind Grid",
    genre: "Puzzle",
    players: "950",
    icon: Puzzle,
  },
  {
    name: "Precision Pro",
    genre: "Aim Trainer",
    players: "1.5K",
    icon: Target,
  },
  {
    name: "Blaze Arena",
    genre: "Battle Royale",
    players: "4.2K",
    icon: Flame,
  },
]

export function GamesSection() {
  return (
    <section id="games" className="relative border-t border-white/10 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="blur-fade-up mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Featured</p>
          <h2 className="text-balance text-3xl font-black text-white md:text-5xl">
            Popular Games
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-pretty text-white/62">
            Compete across a wide range of games. Each title has its own leaderboard and ranking system.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => {
            const Icon = game.icon
            return (
              <LiquidGlass
                key={game.name}
                className="group flex items-center gap-4 rounded-2xl p-5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white">{game.name}</h3>
                  <p className="text-xs text-white/55">{game.genre}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-primary">{game.players}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/45">players</p>
                </div>
              </LiquidGlass>
            )
          })}
        </div>
      </div>
    </section>
  )
}
