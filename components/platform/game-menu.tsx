import { Sparkles, TimerReset } from "lucide-react";

import { playableGames } from "@/games/registry";

import { GameCard } from "./game-card";

export function GameMenu() {
  return (
    <main className="site-shell">
      <section className="menu-hero" aria-labelledby="home-title">
        <div className="menu-hero__content">
          <p className="eyebrow">Fingiendo Jugar</p>
          <h1 id="home-title">Juegos para abrir, pasar el celular y empezar.</h1>
          <p className="menu-hero__copy">
            Elegi un juego para la reunion, la previa o ese rato donde falta una
            excusa para que todos entren en la misma.
          </p>
        </div>

        <div className="menu-hero__panel" aria-label="Estado de la mesa">
          <div>
            <Sparkles size={20} strokeWidth={2.2} />
            <span>Menu listo</span>
          </div>
          <strong>Juegos en preparacion</strong>
          <p>La base ya esta armada para ir sumando partidas jugables.</p>
        </div>
      </section>

      <section className="games-section" aria-labelledby="games-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Menu</p>
            <h2 id="games-title">Elegir juego</h2>
          </div>
          <span className="soft-pill">
            <TimerReset size={15} strokeWidth={2.2} />
            Mas juegos pronto
          </span>
        </div>

        {playableGames.length > 0 ? (
          <div className="games-grid">
            {playableGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <article className="empty-card">
            <span className="empty-card__mark" aria-hidden="true">
              <Sparkles size={26} strokeWidth={2.1} />
            </span>
            <div>
              <h3>Primer juego en camino</h3>
              <p>
                El menu ya esta preparado. El primer juego jugable va a aparecer
                aca cuando lo activemos.
              </p>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}
