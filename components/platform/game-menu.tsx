import { Sparkles, TimerReset } from "lucide-react";

import { playableGames } from "@/games/registry";

import { GameCard } from "./game-card";

export function GameMenu() {
  return (
    <main className="site-shell">
      <section className="menu-hero" aria-labelledby="home-title">
        <div className="menu-hero__content">
          <p className="eyebrow">Fingiendo Jugar</p>
          <h1 id="home-title">Elegir y jugar.</h1>
          <p className="menu-hero__copy">
            Somos un grupo que desarrolla juegos para disfrutarlos entre amigos.
            Si sos nuevo, elegi uno para la reunion, la previa o ese rato donde
            falta una excusa para que todos entren en la misma.
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
        <h2 id="games-title" className="sr-only">
          Juegos disponibles
        </h2>
        {playableGames.length > 0 ? (
          <div className="games-grid">
            {playableGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="placeholder-grid">
            <article className="empty-card">
              <span className="empty-card__mark" aria-hidden="true">
                <Sparkles size={24} strokeWidth={2.1} />
              </span>
              <div>
                <h3>Primer juego en camino</h3>
                <p>El menu ya esta preparado para activarlo cuando toque.</p>
              </div>

              <div className="game-feature-row" aria-label="Caracteristicas del juego">
                <span>2-12 jugadores</span>
                <span>20 min</span>
                <span>Un celular</span>
                <span>Roles ocultos</span>
              </div>
            </article>
          </div>
        )}

        <span className="soft-pill">
          <TimerReset size={15} strokeWidth={2.2} />
          Mas juegos pronto
        </span>
      </section>
    </main>
  );
}
