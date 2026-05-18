import { notFound } from "next/navigation";

import { GameEntry } from "@/components/platform/game-entry";
import { getGameBySlug } from "@/games/registry";

type GamePageProps = {
  params: Promise<{
    gameId: string;
  }>;
  searchParams: Promise<{
    play?: string;
  }>;
};

export default async function GamePage({ params, searchParams }: GamePageProps) {
  const { gameId } = await params;
  const { play } = await searchParams;
  const game = getGameBySlug(gameId);

  if (!game || game.status === "hidden") {
    notFound();
  }

  if (game.status === "coming-soon") {
    return <GameEntry game={game} />;
  }

  if (!game.Game) {
    notFound();
  }

  if (game.entryMode !== "direct" && play !== "1") {
    return <GameEntry game={game} startHref={`${game.route}?play=1`} />;
  }

  const Game = game.Game;

  return <Game />;
}
