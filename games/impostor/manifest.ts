import type { GameManifest } from "@/lib/platform/game-types";

export const impostorManifest = {
  id: "impostor",
  slug: "impostor",
  title: "Impostor",
  shortDescription: "Descubri quien esta fingiendo antes de que termine la ronda.",
  description:
    "Un juego de roles ocultos para grupos, pensado para jugar desde un solo celular.",
  featurePills: ["Grupo", "Roles", "Rapido"],
  statusLabel: "En preparacion",
  tags: [],
  status: "coming-soon",
  route: "/games/impostor",
  entryMode: "intro",
  accent: "violet",
} satisfies GameManifest;
