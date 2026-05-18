import { Sparkles, TimerReset } from "lucide-react";

import { visibleMenuGames } from "@/games/registry";

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
        <div className="games-grid">
          {visibleMenuGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        <span className="soft-pill">
          <TimerReset size={15} strokeWidth={2.2} />
          Mas juegos pronto
        </span>
      </section>
    </main>
  );
}
