"use client";

import { ArrowLeft, ArrowRight, Crosshair, EyeOff, LockKeyhole, MessageCircle, Radar, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { advanceGame, createGame, getView, ROUND_COUNTS, validateSetup } from "./logic/engine";
import type { Axis, GameAction, GameState, GameView, Prediction, RoundCount } from "./logic/engine";
import styles from "./Game.module.css";

const POSITIONS = Array.from({ length: 9 }, (_, index) => index + 1);
const PREDICTIONS: { value: Prediction; label: string; detail: string }[] = [
  { value: "left", label: "A la izquierda", detail: "Si el objetivo es menor · +1" },
  { value: "exact", label: "Exacto", detail: "Si acertaron la posición · +2" },
  { value: "right", label: "A la derecha", detail: "Si el objetivo es mayor · +1" },
];
const predictionLabel = (value: Prediction) => PREDICTIONS.find((option) => option.value === value)?.label;

export function RadarGame() {
  const [names, setNames] = useState(["Antenas", "Frecuencias"]);
  const [rounds, setRounds] = useState<RoundCount>(6);
  const [game, setGame] = useState<GameState | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const view = game ? getView(game) : null;
  const errors = validateSetup(names, rounds);

  useEffect(() => {
    headingRef.current?.focus();
  }, [view?.phase, view?.round]);

  function start() {
    if (errors.length) return;
    setGame(createGame(names, rounds));
  }

  function dispatch(action: GameAction) {
    setGame((current) => current ? advanceGame(current, action) : current);
  }

  if (!view) return <main className={styles.shell}>
    <Link className={styles.back} href="/"><ArrowLeft size={18} aria-hidden />Volver al menú</Link>
    <section className={styles.panel} aria-labelledby="radar-title">
      <header className={styles.heading}>
        <p className={styles.kicker}><Radar size={20} aria-hidden />Sigan la pista</p>
        <h1 id="radar-title" ref={headingRef} tabIndex={-1}>Radar</h1>
        <p>Una persona conoce el punto. Una pista oral tiene que llevar a su equipo hasta ahí.</p>
      </header>
      <div className={styles.setupSignal} aria-hidden><span>ESCUCHAR</span><div><Radar size={42} /><span /></div><span>INTERPRETAR</span></div>
      <form className={styles.stack} onSubmit={(event) => { event.preventDefault(); start(); }}>
        <div className={styles.setupGrid}>
          <fieldset className={styles.fieldset}>
            <legend>Dos equipos, un celular</legend>
            <p className={styles.note}>Necesitan al menos 4 personas: 2 por equipo. Den pistas por turnos para que todas participen.</p>
            {names.map((name, index) => <label className={styles.field} key={index}><span>Equipo {index + 1}</span><input autoComplete="off" maxLength={24} value={name} onChange={(event) => setNames((current) => current.map((value, i) => i === index ? event.target.value : value))} /></label>)}
          </fieldset>
          <div className={styles.stack}>
            <fieldset className={styles.fieldset}>
              <legend>Rondas totales</legend>
              <div className={styles.roundOptions}>{ROUND_COUNTS.map((count) => <label key={count}><input type="radio" name="radar-rounds" checked={rounds === count} onChange={() => setRounds(count)} /><span>{count}<small>{count / 2} por equipo</small></span></label>)}</div>
            </fieldset>
            <div className={styles.ruleBox}><strong>La cercanía suma. El rival también.</strong><p>Hasta 4 puntos por interpretar la pista. El otro equipo pronostica izquierda, derecha o exacto antes del revelado.</p></div>
          </div>
        </div>
        <Rules />
        <p className={styles.note}>Todo queda en este celular durante la partida. Recargar o salir al menú borra el progreso.</p>
        <p id="radar-setup-status" className={styles.validation} aria-live="polite">{errors[0] ?? `${rounds / 2} pistas por equipo. Roten a quien las da.`}</p>
        <button className={styles.primary} type="submit" disabled={errors.length > 0} aria-describedby="radar-setup-status">Buscar la primera señal<ArrowRight size={19} aria-hidden /></button>
      </form>
    </section>
  </main>;

  const active = view.teams[view.activeTeam];
  const rival = view.teams[view.rivalTeam];
  const token = { version: view.version };
  const titles: Record<GameView["phase"], string> = {
    handoff: "Que mire solo quien da la pista",
    private: "Tu objetivo secreto",
    clue: "Celular listo para compartir",
    guess: `Interpreten, ${active}`,
    opposition: `Su pronóstico, ${rival}`,
    reveal: "Así llegó la señal",
    finished: "Radar final",
    exit: "¿Dejamos esta partida?",
  };

  return <main className={styles.shell}>
    <nav className={styles.topbar} aria-label="Partida de Radar">
      {view.phase === "finished" ? <Link className={styles.back} href="/"><ArrowLeft size={18} aria-hidden />Menú</Link> : <button type="button" className={styles.back} disabled={view.phase === "exit"} onClick={() => dispatch({ type: "request-exit", ...token })}><ArrowLeft size={18} aria-hidden />Salir</button>}
      <span>{view.phase === "finished" ? "Partida completa" : `Ronda ${view.round} / ${view.totalRounds}`}</span>
    </nav>
    <section className={styles.panel} aria-labelledby="radar-play-title">
      <header className={styles.heading}>
        <p className={styles.kicker}><Radar size={20} aria-hidden />Radar{view.phase !== "finished" && view.phase !== "exit" ? <span>Pista de {active}</span> : null}</p>
        <h1 id="radar-play-title" className={styles.playTitle} ref={headingRef} tabIndex={-1}>{titles[view.phase]}</h1>
      </header>

      {view.phase === "exit" ? <div className={styles.stack}>
        <p>Al dejarla se pierden los puntos y la ronda actual. Si siguen, se conserva todo lo que eligieron.</p>
        <button type="button" className={styles.primary} onClick={() => dispatch({ type: "cancel-exit", ...token })}>Seguir jugando</button>
        <button type="button" className={styles.secondary} onClick={() => setGame(null)}>Dejar partida y configurar</button>
      </div> : <>
        <Scoreboard view={view} />
        {view.phase === "handoff" ? <div className={styles.handoff}>
          <div className={styles.lock}><LockKeyhole size={34} aria-hidden /></div>
          <p className={styles.lead}>Pasen el celular a una persona de <strong>{active}</strong>.</p>
          <p className={styles.note}>Pista {view.speakerTurn} de este equipo. {view.speakerTurn === 1 ? "Elijan quién empieza; el resto aparta la mirada." : "Ahora le toca a otra persona. Roten antes de repetir."}</p>
          <button type="button" className={styles.primary} onClick={() => dispatch({ type: "open", ...token })}><LockKeyhole size={19} aria-hidden />Estoy a solas: ver objetivo</button>
        </div> : null}

        {view.axis ? <Scale axis={view.axis} target={view.target} guess={view.guess} /> : null}

        {view.phase === "private" ? <div className={styles.stack}>
          <p className={styles.privateTarget}><Crosshair size={24} aria-hidden />Objetivo <strong>{view.target}</strong> de 9</p>
          <p className={styles.note}>Pensá una cosa, situación o ejemplo que ubicarías ahí entre estos extremos. Después decilo en voz alta, sin números ni señalar posiciones.</p>
          <button type="button" className={styles.primary} onClick={() => dispatch({ type: "hide", ...token })}><EyeOff size={20} aria-hidden />Memoricé: ocultar objetivo</button>
          <p className={styles.note}>Ocultalo antes de entregar el celular. Quien da la pista no ayuda a elegir.</p>
        </div> : null}

        {view.phase === "clue" ? <div className={styles.stack}>
          <div className={styles.ruleBox}><strong><MessageCircle size={20} aria-hidden />Ahora, la pista en voz alta</strong><p>El objetivo ya está oculto. Dejá el celular a tu equipo y decí tu pista una sola vez. El rival también escucha.</p></div>
          <button type="button" className={styles.primary} onClick={() => dispatch({ type: "begin-guess", ...token })}>Ya escuchamos: elegir posición<ArrowRight size={19} aria-hidden /></button>
        </div> : null}

        {view.phase === "guess" && view.axis ? <div className={styles.stack}>
          <PositionControls axis={view.axis} selected={view.guess ?? null} onSelect={(position) => dispatch({ type: "select-guess", position, ...token })} />
          <p className={styles.note}>Debatan entre ustedes. Quien dio la pista ya no puede orientar. Izquierda = 1; derecha = 9.</p>
          <button type="button" className={styles.primary} disabled={view.guess == null} onClick={() => dispatch({ type: "confirm-guess", ...token })}>Fijar {view.guess == null ? "posición" : `posición ${view.guess}`} y pasar al rival<ArrowRight size={19} aria-hidden /></button>
        </div> : null}

        {view.phase === "opposition" ? <div className={styles.stack}>
          <p className={styles.lead}><strong>{active}</strong> fijó la posición <strong>{view.guess}</strong>. {rival}, ¿dónde quedó el objetivo respecto de esa elección?</p>
          <fieldset className={styles.fieldset}><legend>Un solo pronóstico para el equipo rival</legend><div className={styles.predictions}>{PREDICTIONS.map((option) => <button key={option.value} type="button" className={styles.prediction} aria-pressed={view.prediction === option.value} onClick={() => dispatch({ type: "select-prediction", prediction: option.value, ...token })}><span aria-hidden>{option.value === "left" ? "←" : option.value === "right" ? "→" : "◎"}</span><strong>{option.label}</strong><small>{option.detail}</small></button>)}</div></fieldset>
          <p className={styles.note}>Si el objetivo es exacto, izquierda y derecha suman 0. El pronóstico también puede cambiar antes de confirmar.</p>
          <button type="button" className={styles.primary} disabled={!view.prediction} onClick={() => dispatch({ type: "reveal", ...token })}><Radar size={20} aria-hidden />Confirmar y revelar</button>
        </div> : null}

        {view.phase === "reveal" && view.result ? <div className={styles.stack}>
          <div className={styles.revealScores} aria-live="polite">
            <div><span>{active}</span><strong>+{view.result.teamPoints}</strong><p>{view.result.guess === view.result.target ? "¡Señal exacta!" : `A ${Math.abs(view.result.guess - view.result.target)} ${Math.abs(view.result.guess - view.result.target) === 1 ? "posición" : "posiciones"} del objetivo`}</p></div>
            <div><span>{rival}</span><strong>+{view.result.rivalPoints}</strong><p>Pronóstico: {predictionLabel(view.result.prediction)?.toLocaleLowerCase("es")}. {view.result.rivalPoints ? "¡Acertaron!" : "Esta vez no sumó."}</p></div>
          </div>
          <p className={styles.note}>Quien dio la pista: cuenten por qué ese ejemplo iba en ese lugar.</p>
          <button type="button" className={styles.primary} onClick={() => dispatch({ type: "next", ...token })}>{view.round === view.totalRounds ? "Ver resultado final" : `Sigue ${rival}`}<ArrowRight size={19} aria-hidden /></button>
        </div> : null}

        {view.phase === "finished" ? <div className={styles.stack}>
          <div className={styles.winner}><Trophy size={38} aria-hidden /><p>{view.winners?.length === 2 ? "Empate: comparten la victoria" : "La señal más precisa"}</p><h2>{view.winners?.map((index) => view.teams[index]).join(" y ")}</h2><p>{view.totalRounds} pistas compartidas. Todos los puntos cuentan.</p></div>
          <details className={styles.details}><summary>Ver las {view.totalRounds} rondas</summary><ol className={styles.history}>{view.history?.map((result, index) => <li key={result.axis.id}><strong>{index + 1}. {view.teams[result.team]}</strong><span>{result.axis.left} ↔ {result.axis.right}</span><p>Objetivo {result.target} · elección {result.guess} · rival: {predictionLabel(result.prediction)?.toLocaleLowerCase("es")}</p><small>Pista +{result.teamPoints} · rival +{result.rivalPoints}</small></li>)}</ol></details>
          <button type="button" className={styles.primary} onClick={start}><RotateCcw size={19} aria-hidden />Revancha con estos equipos</button>
          <button type="button" className={styles.secondary} onClick={() => setGame(null)}>Cambiar configuración</button>
        </div> : null}

        {view.phase !== "finished" ? <Rules /> : null}
      </>}
    </section>
  </main>;
}

function Scoreboard({ view }: { view: GameView }) {
  return <ul className={styles.scoreboard} aria-label="Puntajes totales">{view.teams.map((name, index) => <li key={name} data-active={view.phase !== "finished" && index === view.activeTeam}><span>{name}<small>{view.phase === "finished" ? "Total" : index === view.activeTeam ? "Da la pista" : "Pronostica"}</small></span><strong>{view.scores[index]}<small>pts</small></strong></li>)}</ul>;
}

function Scale({ axis, target, guess }: { axis: Axis; target?: number; guess?: number | null }) {
  const gradient = useId();
  const x = (position: number) => 42 + (position - 1) * 64.5;
  return <figure className={styles.board} aria-label={`Escala del 1, ${axis.left}, al 9, ${axis.right}`}>
    <div className={styles.ends}><span><small>1 · IZQUIERDA</small>{axis.left}</span><span><small>9 · DERECHA</small>{axis.right}</span></div>
    <svg className={styles.scale} viewBox="0 0 600 170" aria-hidden="true" focusable="false">
      <defs><linearGradient id={gradient}><stop stopColor="#8c3e61" /><stop offset=".5" stopColor="#d36d91" /><stop offset="1" stopColor="#ffb7c8" /></linearGradient></defs>
      <path d="M42 88H558" stroke={`url(#${gradient})`} strokeWidth="26" strokeLinecap="round" />
      {POSITIONS.map((position) => <g key={position}><circle cx={x(position)} cy="88" r="15" fill="#1c1422" stroke="#ffcad64d" strokeWidth="2" /><text x={x(position)} y="94" textAnchor="middle" fill="#fce6ec" fontSize="18" fontWeight="700">{position}</text></g>)}
      {target !== undefined ? <g><circle cx={x(target)} cy="88" r="23" fill="none" stroke="#ffacc6" strokeWidth="4" /><path d={`M${x(target)} 35V60M${x(target) - 8} 35L${x(target)} 46L${x(target) + 8} 35`} fill="none" stroke="#ffacc6" strokeWidth="4" strokeLinecap="round" /></g> : null}
      {guess != null ? <g><path d={`M${x(guess)} 145V116M${x(guess) - 8} 145L${x(guess)} 134L${x(guess) + 8} 145`} fill="none" stroke="#a5f2dd" strokeWidth="4" strokeLinecap="round" /><circle cx={x(guess)} cy="88" r="7" fill="#a5f2dd" /></g> : null}
    </svg>
    <figcaption className={styles.legend}>{target !== undefined ? <span className={styles.targetKey}><i aria-hidden />Objetivo: <strong>{target}</strong></span> : <span className={styles.hiddenKey}><LockKeyhole size={14} aria-hidden />Objetivo oculto</span>}{guess != null ? <span className={styles.guessKey}><i aria-hidden />Elección: <strong>{guess}</strong></span> : null}</figcaption>
  </figure>;
}

function PositionControls({ axis, selected, onSelect }: { axis: Axis; selected: number | null; onSelect: (position: number) => void }) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return <fieldset className={styles.fieldset}><legend>¿Dónde ubican la pista?</legend><div className={styles.positions}>{POSITIONS.map((position) => <button key={position} type="button" ref={(element) => { buttons.current[position - 1] = element; }} aria-label={`Posición ${position}${position === 1 ? `, ${axis.left}` : position === 9 ? `, ${axis.right}` : ""}`} aria-pressed={selected === position} onClick={() => onSelect(position)} onKeyDown={(event) => {
    const next = event.key === "ArrowLeft" || event.key === "ArrowDown" ? Math.max(1, position - 1) : event.key === "ArrowRight" || event.key === "ArrowUp" ? Math.min(9, position + 1) : event.key === "Home" ? 1 : event.key === "End" ? 9 : null;
    if (next !== null) { event.preventDefault(); onSelect(next); buttons.current[next - 1]?.focus(); }
  }}>{position}</button>)}</div><p className={styles.note} aria-live="polite">{selected === null ? "Todavía no eligieron posición." : `Posición ${selected} seleccionada.`} Con teclado: flechas para mover; Inicio y Fin para los extremos.</p></fieldset>;
}

function Rules() {
  return <details className={styles.details}><summary>Reglas en 30 segundos</summary><ol><li>Solo quien da la pista ve el objetivo. Lo oculta y dice un ejemplo oral, sin números ni gestos sobre la escala.</li><li>Su equipo fija una posición del 1 al 9. Quien dio la pista ya no interviene.</li><li>El rival pronostica si el objetivo está a la izquierda, a la derecha o exactamente ahí.</li><li>Revelen: distancia 0 / 1 / 2 / 3 suma 4 / 3 / 2 / 1 puntos. Más lejos suma 0. El rival suma 1 por lado correcto o 2 por exacto.</li><li>Los equipos alternan. Cambien de portavoz en cada turno propio; den una vuelta antes de repetir. Gana el mayor puntaje; el empate se comparte.</li></ol></details>;
}
