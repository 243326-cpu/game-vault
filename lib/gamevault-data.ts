export const tournaments = [
  {
    id: "t1",
    name: "GameVault Summer Cup",
    game: "Valorant",
    spots: 10,
    status: "Open",
  },
  {
    id: "t2",
    name: "Champions Clash",
    game: "PUBG",
    spots: 16,
    status: "Open",
  },
]

export const teams = [
  {
    id: "team1",
    name: "Blue Falcons",
    game: "Valorant",
    captain: "ShadowPro",
    members: ["ShadowPro", "DiamondQueen", "LunarShade"],
  },
  {
    id: "team2",
    name: "Red Hawks",
    game: "PUBG",
    captain: "NinjaX",
    members: ["NinjaX", "RogueSniper"],
  },
  {
    id: "team3",
    name: "Cyber Knights",
    game: "Apex Legends",
    captain: "Frostbite",
    members: ["Frostbite", "CyberFrost"],
  },
]

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
