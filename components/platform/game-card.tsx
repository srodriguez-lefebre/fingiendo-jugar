import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Gamepad2 } from "lucide-react";

import type { GameManifest } from "@/lib/platform/game-types";

type GameCardProps = {
  game: GameManifest;
};

export function GameCard({ game }: GameCardProps) {
  const isPlayable = game.status === "playable";
  const GameIcon = game.icon ?? Gamepad2;
  const cardClassName = `game-theme game-theme--${game.accent ?? "violet"} game-card`;
  const content = (
    <>
      <span className="game-card__shine" aria-hidden="true" />
      <div className="game-card__top">
        <span className="game-card__icon" aria-hidden="true">
          {game.iconImage ? (
            <Image src={game.iconImage.src} alt="" width={64} height={64} />
          ) : (
            <GameIcon size={22} strokeWidth={2.2} />
          )}
        </span>
        {game.statusLabel ? (
          <span className="game-card__status">{game.statusLabel}</span>
        ) : null}
      </div>

      <div className="game-card__copy">
        <h2>{game.title}</h2>
        <p>{game.shortDescription}</p>
      </div>

      {game.featurePills.length > 0 ? (
        <div className="game-feature-row" aria-label="Caracteristicas del juego">
          {game.featurePills.map((feature) => (
            <span key={feature}>{feature}</span>
          ))}
        </div>
      ) : null}

      {game.tags.length > 0 ? (
        <div className="game-card__tags">
          {game.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}

      {isPlayable ? (
        <span className="game-card__action">
          {game.actionLabel ?? "Jugar"}
          <ArrowRight size={16} strokeWidth={2.4} />
        </span>
      ) : null}
    </>
  );

  if (isPlayable) {
    return (
      <Link href={game.route} className={cardClassName} aria-label={`Jugar ${game.title}`}>
        {content}
      </Link>
    );
  }

  return (
    <article className={cardClassName} aria-label={game.title}>
      {content}
    </article>
  );
}
