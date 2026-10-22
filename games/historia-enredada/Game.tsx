"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, NotebookPen, Plus, RotateCcw, X } from "lucide-react";

import { STORY_STYLES, TWISTS, WORDS } from "./data/content";
import { countWords, createChallenges, createGame, transition, validateLine, validateSetup } from "./logic/engine";
import type { Action, StoryGame } from "./logic/engine";
import styles from "./Game.module.css";

export function HistoriaEnredadaGame() {
  const [names, setNames] = useState(["Jugador 1", "Jugador 2", "Jugador 3"]);
  const [rounds, setRounds] = useState(2);
  const [styleId, setStyleId] = useState(STORY_STYLES[0].id);
  const [game, setGame] = useState<StoryGame | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const selectedStyle = STORY_STYLES.find((style) => style.id === styleId) ?? STORY_STYLES[0];
  const setupError = validateSetup(names, rounds);

  useEffect(() => {
    headingRef.current?.focus();
  }, [game?.phase, game?.turn]);

  function startStory() {
    if (setupError) return;
    const challenges = createChallenges(names.length * rounds, WORDS, TWISTS);
    const nextGame = challenges ? createGame({ names, rounds, style: selectedStyle }, challenges) : null;
    if (!nextGame) {
      setStartError("No se pudo preparar la historia. Revisá la configuración e intentá de nuevo.");
      return;
    }
    setStartError(null);
    setGame(nextGame);
  }

  function act(action: Action) {
    setGame((current) => current ? transition(current, action) : current);
  }

  const completed = game?.contributions.filter((entry) => !entry.skipped).length ?? 0;
  const finished = game?.phase === "finished";
  const activePlayer = game ? game.players[game.turn % game.players.length] : "";

  return (
    <main className={styles.shell}>
      <nav className={styles.topbar} aria-label="Navegación del juego">
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={16} aria-hidden="true" /> Volver al menú
        </Link>
        {game ? (
          <button className={styles.textButton} type="button" onClick={() => setGame(null)}>
            Cambiar configuración
          </button>
        ) : null}
      </nav>

      <header className={styles.heading}>
        <span className={styles.logo} aria-hidden="true"><NotebookPen size={26} /></span>
        <div>
          <p className={styles.kicker}>Una palabra puede cambiarlo todo</p>
          <h1 ref={headingRef} tabIndex={-1}>
            {!game ? "Historia enredada" : finished ? "La historia está lista" : `Turno de ${activePlayer}`}
          </h1>
          <p className={styles.muted}>
            {!game ? "Inventen algo que ninguno habría contado solo." : finished
              ? "Acérquense y lean lo que salió entre todos."
              : `Ronda ${Math.floor(game.turn / game.players.length) + 1} de ${game.rounds} · Turno ${game.turn + 1} de ${game.challenges.length}`}
          </p>
        </div>
      </header>

      {!game ? (
        <form className={styles.setup} onSubmit={(event) => { event.preventDefault(); startStory(); }}>
          <section className={styles.panel} aria-labelledby="writers-title">
            <div className={styles.sectionHeading}>
              <h2 id="writers-title">¿Quiénes inventan?</h2>
              <span className={styles.badge}>{names.length}/8</span>
            </div>
            <p className={styles.muted}>El celular sigue este orden. Cada persona escribe una vez por ronda.</p>
            <div className={styles.nameList}>
              {names.map((name, index) => (
                <div className={styles.nameRow} key={index}>
                  <label htmlFor={`writer-${index}`} className={styles.position}>{index + 1}<span className={styles.srOnly}>. Nombre de la persona {index + 1}</span></label>
                  <input id={`writer-${index}`} value={name} maxLength={24} autoComplete="off"
                    onChange={(event) => setNames((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />
                  <button className={styles.removeButton} type="button" disabled={names.length <= 2}
                    aria-label={`Quitar persona ${index + 1}`}
                    onClick={() => setNames((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                    <X size={18} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
            <button className={styles.secondaryButton} type="button" disabled={names.length >= 8}
              onClick={() => setNames((current) => current.length < 8 ? [...current, ""] : current)}>
              <Plus size={17} aria-hidden="true" /> Agregar persona
            </button>
          </section>

          <section className={styles.panel} aria-labelledby="setting-title">
            <h2 id="setting-title">El escenario</h2>
            <fieldset className={styles.fieldset}>
              <legend className={styles.srOnly}>Ambiente de la historia</legend>
              <div className={styles.styleList}>
                {STORY_STYLES.map((style) => (
                  <label className={`${styles.styleOption} ${styleId === style.id ? styles.selected : ""}`} key={style.id}>
                    <input type="radio" name="story-style" value={style.id} checked={styleId === style.id}
                      onChange={() => setStyleId(style.id)} />
                    <span>{style.title}</span>
                    {styleId === style.id ? <Check size={18} aria-hidden="true" /> : null}
                  </label>
                ))}
              </div>
            </fieldset>
            <p className={styles.premisePreview}>{selectedStyle.premise}</p>
            <fieldset className={styles.fieldset}>
              <legend>¿Cuántas vueltas?</legend>
              <div className={styles.roundChoices}>
                {[2, 3].map((value) => (
                  <button className={rounds === value ? styles.roundSelected : styles.roundOption} key={value}
                    type="button" aria-pressed={rounds === value} onClick={() => setRounds(value)}>
                    {value} rondas <small>{names.length * value} turnos</small>
                  </button>
                ))}
              </div>
            </fieldset>
          </section>

          <aside className={styles.rules}>
            <BookOpen size={20} aria-hidden="true" />
            <p>Leé la historia, usá tu palabra y seguí la consigna en una frase de 5 a 30 palabras.
              Si te trabás, podés pasar. El último turno cierra el cuento. Sin cronómetro.</p>
          </aside>
          <div className={styles.startRow}>
            <div>
              {setupError || startError ? <p className={styles.error} role="alert">{setupError ?? startError}</p> : null}
              <p className={styles.finePrint}>Recargar o salir al menú descarta la historia.</p>
            </div>
            <button className={styles.primaryButton} type="submit" disabled={Boolean(setupError)}>
              Crear historia <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className={styles.progress} role="progressbar" aria-label="Turnos completados"
            aria-valuemin={0} aria-valuemax={game.challenges.length} aria-valuenow={game.turn}>
            <span style={{ width: `${game.turn / game.challenges.length * 100}%` }} />
          </div>

          {finished ? (
            <section className={styles.result} aria-label="Resultado del grupo">
              <div><strong>{completed}/{game.challenges.length}</strong><span>desafíos cumplidos</span></div>
              <div><strong>{game.challenges.length - completed}</strong><span>turnos pasados</span></div>
              <p>{completed === 0 ? "La premisa quedó esperando una aventura. Prueben otra historia y anímense a la primera frase."
                : completed === game.challenges.length ? "¡Todas las palabras encontraron su lugar!" : "Cada frase le dio un rumbo nuevo al cuento."}</p>
            </section>
          ) : null}

          <div className={finished ? styles.finishedLayout : styles.playLayout}>
            {!finished ? (
              game.phase === "handoff" ? (
                <section className={`${styles.panel} ${styles.handoff}`} aria-label="Pasar el celular">
                  <span className={styles.turnNumber} aria-hidden="true">{game.turn + 1}</span>
                  <h2>Pasale el celular a {activePlayer}</h2>
                  <p className={styles.muted}>Leé lo que ya pasó. Después descubrí qué le toca agregar a tu frase.</p>
                  {game.turn === game.challenges.length - 1 ? <span className={styles.badge}>Te toca el cierre</span> : null}
                  <button className={styles.primaryButton} type="button" onClick={() => act({ type: "begin", turn: game.turn })}>
                    Es mi turno <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </section>
              ) : <WritingTurn key={game.turn} game={game} onAction={act} />
            ) : null}
            <StoryBook game={game} finished={finished} />
          </div>

          {finished ? (
            <div className={styles.finalActions}>
              <button className={styles.primaryButton} type="button" onClick={startStory}>
                <RotateCcw size={18} aria-hidden="true" /> Otra historia
              </button>
              <button className={styles.secondaryButton} type="button" onClick={() => setGame(null)}>Cambiar configuración</button>
              {startError ? <p className={styles.error} role="alert">{startError}</p> : null}
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}

function WritingTurn({ game, onAction }: { game: StoryGame; onAction: (action: Action) => void }) {
  const [draft, setDraft] = useState("");
  const [attempted, setAttempted] = useState(false);
  const challenge = game.challenges[game.turn];
  const error = validateLine(draft, challenge.word);
  const wordCount = countWords(draft);

  return (
    <section className={styles.panel} aria-labelledby="challenge-title">
      <p className={styles.kicker}>Tu palabra obligatoria</p>
      <h2 id="challenge-title" className={styles.requiredWord}>{challenge.word}</h2>
      <div className={styles.twist}><span>El giro</span><p>{challenge.twist}</p></div>
      <form onSubmit={(event) => {
        event.preventDefault();
        setAttempted(true);
        if (!error) onAction({ type: "submit", turn: game.turn, text: draft });
      }}>
        <label htmlFor="story-line" className={styles.draftLabel}>Tu próxima frase</label>
        <textarea id="story-line" rows={4} maxLength={360} value={draft}
          aria-describedby={`line-help${attempted && error ? " line-error" : ""}`}
          aria-invalid={attempted && Boolean(error)}
          placeholder="Seguí el cuento desde donde quedó…"
          onChange={(event) => setDraft(event.target.value)} />
        <div id="line-help" className={styles.lineHelp}>
          <span>5–30 palabras · Usá «{challenge.word}» completa.</span>
          <span>{wordCount}/30</span>
        </div>
        {attempted && error ? <p id="line-error" className={styles.error} role="alert">{error}</p> : null}
        <p className={styles.finePrint}>La app comprueba la palabra y la extensión. Ustedes cuidan la consigna y el hilo del cuento.</p>
        <div className={styles.turnActions}>
          <button className={styles.primaryButton} type="submit">
            Agregar frase <Check size={18} aria-hidden="true" />
          </button>
          <button className={styles.textButton} type="button" onClick={() => onAction({ type: "skip", turn: game.turn })}>
            Pasar este turno
          </button>
        </div>
      </form>
    </section>
  );
}

function StoryBook({ game, finished }: { game: StoryGame; finished: boolean }) {
  const written = game.contributions.filter((entry) => !entry.skipped);
  return (
    <section className={styles.book} aria-labelledby="story-title">
      <div className={styles.sectionHeading}>
        <h2 id="story-title"><BookOpen size={19} aria-hidden="true" />{finished ? "Nuestro cuento" : "La historia hasta ahora"}</h2>
        <span className={styles.badge}>{game.style.title}</span>
      </div>
      <div className={finished ? styles.fullStory : styles.storyScroll} tabIndex={finished ? undefined : 0}
        aria-label={finished ? undefined : "Historia del grupo; desplazate para leer las frases"}>
        <p className={styles.premise}>{game.style.premise}</p>
        {written.map((entry, index) => (
          <div className={styles.storyEntry} key={index}>
            <p>{entry.text}</p>
            <small>{game.players[entry.playerIndex]} · {entry.word}</small>
          </div>
        ))}
        {written.length === 0 && !finished ? <p className={styles.emptyStory}>La primera frase está por llegar.</p> : null}
      </div>
    </section>
  );
}
