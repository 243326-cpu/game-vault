"use client"

import { FormEvent, useEffect, useState } from "react"
import { Gamepad2, LogIn, Mail, Menu, Search, Sun, UserCircle, X } from "lucide-react"
import Link from "next/link"

const navItems = [
  { href: "#hero", label: "Home" },
  { href: "#leaderboard", label: "Leaderboard" },
  { href: "#games", label: "Games" },
  { href: "#tournament", label: "Tournament" },
  { href: "#admin", label: "Admin" },
  { href: "#about", label: "About" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" })
  const [authError, setAuthError] = useState("")
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/auth/me")
        const data = await response.json()

        if (!response.ok || !data.user) {
          setUser(null)
          return
        }

        setUser(data.user)
      } catch {
        setUser(null)
      }
    }

    loadSession()
  }, [])

  const toggleTheme = () => {
    if (typeof window !== "undefined" && (window as any).toggleTheme) {
      ;(window as any).toggleTheme()
    }
  }

  const openAuth = (mode: "login" | "signup" = "login") => {
    setAuthMode(mode)
    setAuthError("")
    setAuthOpen(true)
    setMobileOpen(false)
  }

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthError("")

    if (authMode === "signup" && !authForm.name.trim()) {
      setAuthError("Player name is required.")
      return
    }

    if (authForm.password.length < 6) {
      setAuthError("Password must be at least 6 characters.")
      return
    }

    setAuthLoading(true)

    try {
      const response = await fetch(`/api/auth/${authMode === "signup" ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authForm.name.trim(),
          email: authForm.email.trim(),
          password: authForm.password,
        }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || "Unable to authenticate.")
      }

      setUser(data.user)
      setAuthOpen(false)
      setAuthForm({ name: "", email: "", password: "" })
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to authenticate.")
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null)
    setUser(null)
    setAuthOpen(false)
  }

  return (
    <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 px-4 pt-4 md:px-6">
      <nav className="blur-fade-up pointer-events-auto mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-black/25 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-2xl md:px-5">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/15 shadow-lg shadow-primary/20 transition group-hover:scale-105 group-hover:bg-primary/25">
            <Gamepad2 className="h-5 w-5 text-primary" />
          </span>
          <span className="text-lg font-black tracking-tight text-white">
            Game<span className="text-primary">Vault</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 backdrop-blur-xl md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/68 transition-all hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="#top-players"
            aria-label="Search players"
            className="glass-icon-button"
          >
            <Search className="h-4 w-4" />
          </a>
          <button onClick={toggleTheme} aria-label="Toggle theme" className="glass-icon-button">
            <Sun className="h-4 w-4" />
          </button>
          <button
            aria-label={user ? "Open profile" : "Log in"}
            onClick={() => openAuth("login")}
            className="glass-icon-button"
          >
            {user ? <span className="text-xs font-black">{user.name.slice(0, 1).toUpperCase()}</span> : <UserCircle className="h-4 w-4" />}
          </button>
        </div>

        <button
          onClick={() => setMobileOpen((open) => !open)}
          className="glass-icon-button md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div
        className={`pointer-events-auto mx-auto mt-3 max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-black/45 shadow-2xl shadow-black/40 backdrop-blur-2xl transition-all duration-300 md:hidden ${
          mobileOpen
            ? "max-h-[520px] translate-y-0 opacity-100"
            : "max-h-0 -translate-y-3 border-transparent opacity-0"
        }`}
      >
        <div className="grid gap-2 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-2xl px-4 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
            <a href="#top-players" onClick={() => setMobileOpen(false)} className="glass-icon-button h-12 w-full">
              <Search className="h-4 w-4" />
            </a>
            <button onClick={toggleTheme} className="glass-icon-button h-12 w-full" aria-label="Toggle theme">
              <Sun className="h-4 w-4" />
            </button>
            <button onClick={() => openAuth("login")} className="glass-icon-button h-12 w-full" aria-label={user ? "Open profile" : "Log in"}>
              {user ? <span className="text-xs font-black">{user.name.slice(0, 1).toUpperCase()}</span> : <UserCircle className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {authOpen && (
        <div className="pointer-events-auto fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-xl">
          <div className="liquid-glass scale-in w-full max-w-md rounded-3xl p-6 text-white">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  GameVault Account
                </p>
                <h2 className="text-2xl font-black">
                  {user ? "Player Profile" : authMode === "login" ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  {user
                    ? "Manage your signed-in GameVault profile."
                    : "Log in to track your collection, tournaments, and leaderboard activity."}
                </p>
              </div>
              <button onClick={() => setAuthOpen(false)} className="glass-icon-button shrink-0" aria-label="Close login">
                <X className="h-4 w-4" />
              </button>
            </div>

            {user ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-sm text-white/55">Signed in as</p>
                  <p className="mt-1 text-lg font-bold">{user.name}</p>
                  <p className="text-sm text-white/60">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5 grid grid-cols-2 gap-2 rounded-full border border-white/10 bg-white/5 p-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                      authMode === "login" ? "bg-primary text-primary-foreground" : "text-white/65 hover:text-white"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode("signup")}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                      authMode === "signup" ? "bg-primary text-primary-foreground" : "text-white/65 hover:text-white"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  {authMode === "signup" && (
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-white/80">Player Name</span>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                        <UserCircle className="h-4 w-4 text-primary" />
                        <input
                          required
                          value={authForm.name}
                          onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                          placeholder="ShadowPro"
                          autoComplete="name"
                        />
                      </div>
                    </label>
                  )}

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-white/80">Email</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                      <Mail className="h-4 w-4 text-primary" />
                      <input
                        type="email"
                        required
                        value={authForm.email}
                        onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                        placeholder="player@gamevault.com"
                        autoComplete="email"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-white/80">Password</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                      <LogIn className="h-4 w-4 text-primary" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={authForm.password}
                        onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                        placeholder="Enter password"
                        autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                      />
                    </div>
                  </label>

                  {authError && (
                    <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="button-glow mt-2 w-full rounded-full bg-primary px-5 py-3 text-sm font-black text-primary-foreground transition hover:-translate-y-1"
                  >
                    {authLoading ? "Please wait..." : authMode === "login" ? "Login" : "Create Account"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
