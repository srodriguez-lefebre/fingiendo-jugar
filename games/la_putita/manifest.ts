import type { GameManifest } from "@/lib/platform/game-types";

import { LaPutitaGame } from "./Game";

export const laPutitaManifest = {
  id: "la_putita",
  slug: "la_putita",
  title: "La Put*ta",
  shortDescription:
    "Robá cartas de un mazo y cumplí la regla que te toque. 48 cartas, 12 reglas, un grupo.",
  description: [
    "Un mazo de 48 cartas españolas mezcladas al azar. Tocás para robar una carta y el número que sale marca la regla que hay que cumplir.",
    "Las 12 reglas tienen valores por default pero se pueden editar antes de empezar. Los cambios duran mientras estés en la partida.",
  ],
  featurePills: ["Grupo", "Un celular", "Para tomar"],
  actionLabel: "Jugar",
  tags: [],
  status: "playable",
  route: "/games/la_putita",
  entryMode: "intro",
  accent: "nightclub",
  iconImage: {
    src: "/games/la_putita/icon.png",
    alt: "Icono de La Put*ta",
  },
  Game: LaPutitaGame,
} satisfies GameManifest;
