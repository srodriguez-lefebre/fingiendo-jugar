import type { GameManifest } from "@/lib/platform/game-types";
import { contrarrelojManifest } from "@/games/contrarreloj";
import { impostorManifest } from "@/games/impostor";
import { laPutitaManifest } from "@/games/la_putita";
import { ultimoBotinManifest } from "@/games/ultimo-botin";

export const games: GameManifest[] = [
  impostorManifest,
  contrarrelojManifest,
  laPutitaManifest,
  ultimoBotinManifest,
];

export const playableGames = games.filter((game) => game.status === "playable");
export const visibleMenuGames = games.filter((game) => game.status !== "hidden");

export function getGameBySlug(slug: string) {
  return games.find((game) => game.slug === slug);
}
