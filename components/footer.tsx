import { Gamepad2 } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold text-foreground">
              Game<span className="text-primary">Vault</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#hero" className="text-xs text-muted-foreground transition-colors hover:text-primary">Home</a>
            <a href="#leaderboard" className="text-xs text-muted-foreground transition-colors hover:text-primary">Leaderboard</a>
            <a href="#games" className="text-xs text-muted-foreground transition-colors hover:text-primary">Games</a>
            <a href="#about" className="text-xs text-muted-foreground transition-colors hover:text-primary">About</a>
          </div>
          <p className="text-xs text-muted-foreground">
            Mudabbir Ali &mdash; BS(CGD) 4th B
          </p>
        </div>
      </div>
    </footer>
  )
}
