import { notFound } from "next/navigation";

import { getGameBySlug } from "@/games/registry";

type GamePageProps = {
  params: Promise<{
    gameId: string;
  }>;
};

export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = await params;
  const game = getGameBySlug(gameId);

  if (!game || game.status !== "playable" || !game.Game) {
    notFound();
  }

  const Game = game.Game;

  return <Game />;
}
