import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { PlayerCards } from "@/components/player-cards"
import { Leaderboard } from "@/components/leaderboard"
import { GamesSection } from "@/components/games-section"
import { TournamentRegistration } from "@/components/tournament-registration"
import { TournamentAdminPanel } from "@/components/tournament-admin-panel"
import { AboutSection } from "@/components/about-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent">
      <Navbar />
      <Hero />
      <PlayerCards />
      <Leaderboard />
      <GamesSection />
      <TournamentRegistration />
      <TournamentAdminPanel />
      <AboutSection />
      <Footer />
    </main>
  )
}
