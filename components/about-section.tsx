import { Shield, Zap, Users, BarChart3 } from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Real-Time Rankings",
    description: "Scores are automatically sorted and ranked in descending order as soon as they are submitted.",
  },
  {
    icon: Zap,
    title: "Instant Updates",
    description: "The DOM updates dynamically when players are added or removed, with no page refresh needed.",
  },
  {
    icon: Shield,
    title: "Persistent Storage",
    description: "All player data is stored locally using JSON in localStorage, so your data survives page reloads.",
  },
  {
    icon: Users,
    title: "Competitive Spirit",
    description: "The top-ranked player is always highlighted as the champion, motivating everyone to compete harder.",
  },
]

export function AboutSection() {
  return (
    <section id="about" className="border-t border-border py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">About</p>
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            How GameVault Works
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-pretty text-muted-foreground">
            A dynamic leaderboard system built with modern web technologies, demonstrating DOM manipulation, arrays, JSON storage, and real-time ranking.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-base font-bold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
