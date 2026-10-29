import type { GameManifest } from "@/lib/platform/game-types";
import { contrarrelojManifest } from "@/games/contrarreloj";
import { impostorManifest } from "@/games/impostor";
import { historiaEnredadaManifest } from "@/games/historia-enredada";
import { laPutitaManifest } from "@/games/la_putita";
import { mesaDeSospechososManifest } from "@/games/mesa-de-sospechosos";
import { sintoniaManifest } from "@/games/sintonia";
import { ultimoBotinManifest } from "@/games/ultimo-botin";

export const games: GameManifest[] = [
  impostorManifest,
  contrarrelojManifest,
  laPutitaManifest,
  ultimoBotinManifest,
  historiaEnredadaManifest,
  sintoniaManifest,
  mesaDeSospechososManifest,
];

export const playableGames = games.filter((game) => game.status === "playable");
export const visibleMenuGames = games.filter((game) => game.status !== "hidden");

export function getGameBySlug(slug: string) {
  return games.find((game) => game.slug === slug);
}
