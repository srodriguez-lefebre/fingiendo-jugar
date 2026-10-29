import { Radar } from "lucide-react";

import type { GameManifest } from "@/lib/platform/game-types";

import { RadarGame } from "./Game";

export const radarManifest = {
  id: "radar",
  slug: "radar",
  title: "Radar",
  shortDescription: "Una pista, nueve posiciones y dos equipos disputando cada punto.",
  description: [
    "Armen dos equipos de al menos dos personas y compartan un solo celular. En cada ronda, una persona ve un objetivo secreto entre dos extremos, lo oculta y da una pista oral para llevar a su equipo hasta ese lugar de la escala.",
    "El equipo fija una posición del 1 al 9. Antes del revelado, el rival pronostica si el objetivo está a la izquierda, a la derecha o exactamente ahí. La cercanía suma hasta 4 puntos; el rival puede sumar 1 por el lado correcto o 2 por acertar exacto.",
    "Elijan 6, 8 o 10 rondas: ambos equipos dan la misma cantidad de pistas. Roten a quien las da para que todos participen. Gana el mayor puntaje y el empate se comparte. Los ejes son locales y no se repiten en la partida. Al recargar o salir al menú se pierde el progreso.",
  ],
  featurePills: ["Dos equipos", "Pistas", "Un celular"],
  tags: [],
  status: "playable",
  statusLabel: "Listo para jugar",
  route: "/games/radar",
  entryMode: "intro",
  accent: "rose",
  icon: Radar,
  Game: RadarGame,
} satisfies GameManifest;
