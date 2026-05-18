import Link from "next/link";
import { ArrowLeft, Clock3, Gamepad2, Play } from "lucide-react";

import type { GameManifest } from "@/lib/platform/game-types";

type GameEntryProps = {
  game: GameManifest;
  startHref?: string;
};

export function GameEntry({ game, startHref }: GameEntryProps) {
  const GameIcon = game.icon ?? Gamepad2;
  const description = Array.isArray(game.description)
    ? game.description
    : [game.description ?? game.shortDescription];

  return (
    <main className={`game-theme game-theme--${game.accent ?? "violet"} game-entry-shell`}>
      <Link href="/" className="back-link">
        <ArrowLeft size={16} strokeWidth={2.3} />
        Volver al menu
      </Link>

      <section className="game-entry" aria-labelledby="game-entry-title">
        <div className="game-entry__icon" aria-hidden="true">
          <GameIcon size={28} strokeWidth={2.1} />
        </div>

        <div className="game-entry__content">
          {game.statusLabel ? (
            <span className="game-entry__status">
              <Clock3 size={14} strokeWidth={2.2} />
              {game.statusLabel}
            </span>
          ) : null}

          <h1 id="game-entry-title">{game.title}</h1>
          <div className="game-entry__description">
            {description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {game.featurePills.length > 0 ? (
            <div className="game-feature-row" aria-label="Caracteristicas del juego">
              {game.featurePills.map((feature) => (
                <span key={feature}>{feature}</span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {startHref ? (
        <Link href={startHref} className="game-entry__button">
          <Play size={18} strokeWidth={2.4} />
          Empezar
        </Link>
      ) : null}
    </main>
  );
}
