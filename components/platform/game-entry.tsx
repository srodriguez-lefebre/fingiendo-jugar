import Link from "next/link";
import { ArrowLeft, Clock3, Gamepad2 } from "lucide-react";

import type { GameManifest } from "@/lib/platform/game-types";

type GameEntryProps = {
  game: GameManifest;
  startHref?: string;
};

export function GameEntry({ game, startHref }: GameEntryProps) {
  return (
    <main className="game-entry-shell">
      <Link href="/" className="back-link">
        <ArrowLeft size={16} strokeWidth={2.3} />
        Volver al menu
      </Link>

      <section className="game-entry" aria-labelledby="game-entry-title">
        <div className="game-entry__icon" aria-hidden="true">
          <Gamepad2 size={28} strokeWidth={2.1} />
        </div>

        <div className="game-entry__content">
          {game.statusLabel ? (
            <span className="game-entry__status">
              <Clock3 size={14} strokeWidth={2.2} />
              {game.statusLabel}
            </span>
          ) : null}

          <h1 id="game-entry-title">{game.title}</h1>
          <p>{game.description ?? game.shortDescription}</p>

          {game.featurePills.length > 0 ? (
            <div className="game-feature-row" aria-label="Caracteristicas del juego">
              {game.featurePills.map((feature) => (
                <span key={feature}>{feature}</span>
              ))}
            </div>
          ) : null}

          {startHref ? (
            <Link href={startHref} className="game-entry__button">
              Empezar
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
