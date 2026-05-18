import type { GameManifest } from "@/lib/platform/game-types";

export const templateManifest = {
  id: "mi-juego",
  slug: "mi-juego",
  title: "Mi Juego",
  shortDescription: "Una descripcion corta para la card del menu.",
  description: "Una descripcion un poco mas completa para la entrada del juego.",
  featurePills: ["Grupo", "Rapido", "Un celular"],
  statusLabel: "En preparacion",
  tags: [],
  status: "coming-soon",
  route: "/games/mi-juego",
  entryMode: "intro",
  accent: "violet",
  database: {
    provider: "neon",
    tableName: "mi_juego",
    access: "read-only",
  },
} satisfies GameManifest;
