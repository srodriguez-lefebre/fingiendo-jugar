import type { GameManifest } from "@/lib/platform/game-types";

export const laPutitaManifest = {
  id: "la_putita",
  slug: "la_putita",
  title: "La Put*ta",
  shortDescription:
    "Saca una carta del 1 al 12 y cumpli la regla que toque antes de que termine la ronda.",
  description:
    "Un juego de cartas y reglas para jugar en ronda. Todavia esta en desarrollo.",
  featurePills: ["Ronda", "Un mazo", "Para tomar"],
  statusLabel: "En desarrollo",
  tags: [],
  status: "coming-soon",
  route: "/games/la_putita",
  entryMode: "intro",
  accent: "nightclub",
  iconImage: {
    src: "/games/la_putita/icon.png",
    alt: "Icono de La Put*ta",
  },
} satisfies GameManifest;
