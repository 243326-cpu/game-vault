import { ArrowRight, Library, Sparkles, Star, Trophy, Users, Zap } from "lucide-react"

import { LiquidGlass } from "@/components/liquid-glass"

const badges = [
  { label: "Trending Games", icon: Zap },
  { label: "New Releases", icon: Sparkles },
  { label: "Community Picks", icon: Users },
]

const heroStats = [
  { label: "Players Ranked", value: "10K+", icon: Trophy },
  { label: "Games Tracked", value: "50+", icon: Library },
  { label: "Live Score Updates", value: "24/7", icon: Star },
]

export function Hero() {
  return (
    <section id="hero" className="cinematic-hero relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 -z-20 cinematic-fallback" aria-hidden="true" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_70%_25%,rgba(0,229,255,0.28),transparent_28%),radial-gradient(circle_at_20%_75%,rgba(255,61,90,0.28),transparent_30%),linear-gradient(90deg,rgba(3,5,14,0.96),rgba(5,8,18,0.74)_45%,rgba(5,8,18,0.94))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,18,0.1),rgba(5,8,18,0.38)_55%,var(--background)_100%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pb-16 pt-28">
        <div className="max-w-4xl">
          <div className="blur-fade-up flex flex-wrap gap-3">
            {badges.map((badge) => {
              const Icon = badge.icon
              return (
                <LiquidGlass
                  key={badge.label}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/85"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {badge.label}
                </LiquidGlass>
              )
            })}
          </div>

          <div className="blur-fade-up animation-delay-150 mt-8">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-primary">
              GameVault Premium
            </p>
            <h1 className="max-w-5xl text-balance text-5xl font-black leading-[0.95] tracking-tight text-white drop-shadow-2xl md:text-7xl lg:text-8xl">
              Discover Your Next Gaming Adventure
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-8 text-white/72 md:text-xl">
              Explore thousands of games, track your collection, discover hidden gems, and connect with the GameVault community.
            </p>
          </div>

          <div className="blur-fade-up animation-delay-300 mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#games"
              className="button-glow inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-bold text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 hover:shadow-primary/50"
            >
              Browse Games
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#top-players"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-7 py-4 text-sm font-bold text-white shadow-2xl backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-primary/50 hover:bg-white/15"
            >
              Explore Collection
              <Library className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="scale-in animation-delay-500 mt-16 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {heroStats.map((stat) => {
            const Icon = stat.icon
            return (
              <LiquidGlass key={stat.label} intensity="strong" className="rounded-2xl p-5">
                <Icon className="mb-4 h-6 w-6 text-primary" />
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/55">{stat.label}</p>
              </LiquidGlass>
            )
          })}
        </div>
      </div>
    </section>
  )
}
