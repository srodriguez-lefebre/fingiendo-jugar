import type { GameManifest } from "@/lib/platform/game-types";

import { impostorDatabaseConfig } from "./config";
import { ImpostorGame } from "./Game";

export const impostorManifest = {
  id: "impostor",
  slug: "impostor",
  title: "Impostor",
  shortDescription: "Descubri quien esta fingiendo antes de que termine la ronda.",
  description:
    "Un juego de roles ocultos para grupos, pensado para jugar desde un solo celular.",
  featurePills: ["3-12", "Un celular", "Roles"],
  actionLabel: "Jugar",
  tags: [],
  status: "playable",
  route: "/games/impostor",
  entryMode: "intro",
  accent: "rose",
  database: impostorDatabaseConfig,
  Game: ImpostorGame,
} satisfies GameManifest;
