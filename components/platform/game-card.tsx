import Link from "next/link";
import { ArrowRight, Clock3, Gamepad2, UsersRound } from "lucide-react";

import type { GameManifest } from "@/lib/platform/game-types";

type GameCardProps = {
  game: GameManifest;
};

export function GameCard({ game }: GameCardProps) {
  const playerLabel = getPlayerLabel(game);

  return (
    <Link href={game.route} className="game-card" aria-label={`Jugar ${game.title}`}>
      <span className="game-card__shine" aria-hidden="true" />
      <div className="game-card__top">
        <span className="game-card__icon" aria-hidden="true">
          <Gamepad2 size={22} strokeWidth={2.2} />
        </span>
        <span className="game-card__action">
          Jugar
          <ArrowRight size={16} strokeWidth={2.4} />
        </span>
      </div>

      <div className="game-card__copy">
        <h2>{game.title}</h2>
        <p>{game.shortDescription}</p>
      </div>

      <div className="game-card__meta">
        {playerLabel ? (
          <span>
            <UsersRound size={15} strokeWidth={2.2} />
            {playerLabel}
          </span>
        ) : null}
        <span>
          <Clock3 size={15} strokeWidth={2.2} />
          Rapido
        </span>
      </div>

      <div className="game-card__tags">
        {game.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </Link>
  );
}

function getPlayerLabel(game: GameManifest) {
  if (game.minPlayers && game.maxPlayers) {
    return `${game.minPlayers}-${game.maxPlayers} personas`;
  }

  if (game.minPlayers) {
    return `${game.minPlayers}+ personas`;
  }

  return null;
}
