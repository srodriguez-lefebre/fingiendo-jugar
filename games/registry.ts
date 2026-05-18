import type { GameManifest } from "@/lib/platform/game-types";

export const games: GameManifest[] = [];

export const playableGames = games.filter((game) => game.status === "playable");

export function getGameBySlug(slug: string) {
  return games.find((game) => game.slug === slug);
}
