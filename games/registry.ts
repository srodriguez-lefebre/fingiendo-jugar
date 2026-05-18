import type { GameManifest } from "@/lib/platform/game-types";
import { impostorManifest } from "@/games/impostor";
import { laPutitaManifest } from "@/games/la_putita";

export const games: GameManifest[] = [impostorManifest, laPutitaManifest];

export const playableGames = games.filter((game) => game.status === "playable");
export const visibleMenuGames = games.filter((game) => game.status !== "hidden");

export function getGameBySlug(slug: string) {
  return games.find((game) => game.slug === slug);
}
