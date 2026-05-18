import { Puzzle } from "lucide-react";

import type { GameManifest } from "@/lib/platform/game-types";

export const templateManifest = {
  id: "mi-juego",
  slug: "mi-juego",
  title: "Mi Juego",
  shortDescription: "Una descripcion corta para la card del menu.",
  description: [
    "Una descripcion un poco mas completa para la entrada del juego.",
    "Aca conviene explicar como se juega, que decisiones tiene el grupo y que variantes importantes existen.",
  ],
  featurePills: ["Grupo", "Rapido", "Un celular"],
  statusLabel: "En preparacion",
  tags: [],
  status: "coming-soon",
  route: "/games/mi-juego",
  entryMode: "intro",
  accent: "violet",
  icon: Puzzle,
  database: {
    provider: "neon",
    tableName: "mi_juego",
    access: "read-only",
  },
} satisfies GameManifest;
