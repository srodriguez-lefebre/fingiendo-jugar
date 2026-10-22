"use client";

import { ArrowLeft, ArrowRight, Check, LockKeyhole, Plus, Radio, RotateCcw, Trophy, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { PROMPTS } from "./data";
import { chooseDeck, createGame, gameReducer, getWinners, validateNames } from "./logic";
import type { Ballot, Choice, GameAction, GameState, Player, Prompt, Theme } from "./logic";
import styles from "./sintonia.module.css";

const THEMES: { value: Theme; label: string }[] = [
  { value: "all", label: "Un poco de todo" },
  { value: "cotidiano", label: "Vida cotidiana" },
  { value: "planes", label: "Planes y juntadas" },
  { value: "dilemas", label: "Dilemas imaginarios" },
];

export function SintoniaGame() {
  const [names, setNames] = useState(["", "", ""]);
  const [rounds, setRounds] = useState(5);
  const [theme, setTheme] = useState<Theme>("all");
  const [game, setGame] = useState<GameState | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const error = validateNames(names);

  useEffect(() => {
    headingRef.current?.focus();
  }, [game?.phase, game?.roundIndex, game?.voterIndex, confirmExit]);

  function start() {
    if (error) return;
    setGame(createGame(names, chooseDeck(PROMPTS, rounds, theme)));
    setConfirmExit(false);
  }

  function dispatch(action: GameAction) {
    setGame((current) => current ? gameReducer(current, action) : current);
  }

  if (!game) {
    return (
      <main className={styles.shell}>
        <Link className={styles.back} href="/"><ArrowLeft size={17} aria-hidden />Volver al menú</Link>
        <section className={styles.panel} aria-labelledby="sintonia-title">
          <header className={styles.heading}>
            <p className={styles.kicker}><Radio size={18} aria-hidden />Leé al grupo</p>
            <h1 id="sintonia-title" ref={headingRef} tabIndex={-1}>Sintonía</h1>
            <p>Tu preferencia es tuya. El desafío es anticipar la del resto.</p>
          </header>
          <div className={styles.setupGrid}>
            <section className={styles.stack} aria-labelledby="sintonia-players">
              <div className={styles.sectionTitle}><h2 id="sintonia-players">¿Quiénes juegan?</h2><span>{names.length}/10</span></div>
              {names.map((name, index) => (
                <div className={styles.nameRow} key={index}>
                  <label htmlFor={`sintonia-name-${index}`}>{index + 1}</label>
                  <input id={`sintonia-name-${index}`} aria-label={`Nombre de la persona ${index + 1}`} autoComplete="off" maxLength={24} placeholder={`Persona ${index + 1}`} value={name} onChange={(event) => setNames((current) => current.map((value, i) => i === index ? event.target.value : value))} />
                  <button className={styles.iconButton} type="button" disabled={names.length <= 3} aria-label={`Quitar persona ${index + 1}`} onClick={() => setNames((current) => current.filter((_, i) => i !== index))}><X size={17} aria-hidden /></button>
                </div>
              ))}
              <button className={styles.secondary} type="button" disabled={names.length >= 10} onClick={() => setNames((current) => current.length < 10 ? [...current, ""] : current)}><Plus size={17} aria-hidden />Agregar persona</button>
            </section>
            <section className={styles.stack} aria-label="Opciones de partida">
              <fieldset className={styles.fieldset}>
                <legend>Rondas</legend>
                <div className={styles.roundOptions}>{[5, 8, 12].map((value) => <label className={styles.radioLabel} key={value}><input type="radio" name="sintonia-rounds" checked={rounds === value} onChange={() => setRounds(value)} /><span>{value}</span></label>)}</div>
              </fieldset>
              <label className={styles.field}>Mazo<select value={theme} onChange={(event) => setTheme(event.target.value as Theme)}>{THEMES.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
              <div className={styles.ruleBox}><strong>3 exacto · 1 a uno · 0 el resto</strong><p>Votá en privado y predecí el total de A, incluyéndote. Tenés un doble para usar cuando más confíes.</p></div>
              <p className={styles.note}>Al recargar o volver al menú, la partida se reinicia.</p>
            </section>
          </div>
          <p id="sintonia-error" className={styles.validation} aria-live="polite">{error ?? "Grupo listo. El primer dilema los espera."}</p>
          <button type="button" className={styles.primary} disabled={Boolean(error)} aria-describedby="sintonia-error" onClick={start}>Empezar partida<ArrowRight size={18} aria-hidden /></button>
        </section>
      </main>
    );
  }

  const prompt = game.deck[game.roundIndex];
  const player = game.players[game.voterIndex];
  const token = { roundIndex: game.roundIndex, voterIndex: game.voterIndex };
  const lastRound = game.roundIndex === game.deck.length - 1;
  const result = game.history.at(-1);
  const winners = getWinners(game);
  const title = confirmExit ? "¿Dejamos esta partida?" : game.phase === "handoff" ? `Pasale el celular a ${player.name}` : game.phase === "ballot" ? `Tu voto, ${player.name}` : game.phase === "reveal" ? "Así piensa el grupo" : game.phase === "finished" ? "Sintonía final" : "¿De qué lado estás?";

  return (
    <main className={styles.shell}>
      <nav className={styles.topbar} aria-label="Partida de Sintonía">
        {game.phase === "finished" ? <Link className={styles.back} href="/"><ArrowLeft size={17} aria-hidden />Menú</Link> : <button className={styles.back} type="button" onClick={() => setConfirmExit(true)}><ArrowLeft size={17} aria-hidden />Salir</button>}
        <span>{game.phase === "finished" ? "Partida completa" : `Ronda ${game.roundIndex + 1} de ${game.deck.length}`}</span>
      </nav>
      <section className={styles.panel} aria-labelledby="sintonia-play-title">
        <header className={styles.heading}>
          <p className={styles.kicker}><Radio size={18} aria-hidden />Sintonía</p>
          <h1 id="sintonia-play-title" ref={headingRef} tabIndex={-1}>{title}</h1>
        </header>

        {confirmExit ? <div className={styles.stack}><p>Se van a perder los votos y los puntos. Podés volver a configurar el grupo.</p><button className={styles.primary} type="button" onClick={() => setConfirmExit(false)}>Seguir jugando</button><button className={styles.secondary} type="button" onClick={() => { setGame(null); setConfirmExit(false); }}>Dejar partida</button></div> : <>
          {game.phase === "round" ? <div className={styles.stack}><PromptCard prompt={prompt} /><p className={styles.note}>Lean en voz alta y piensen sin debatir. Después, cada persona vota y predice el total de A en privado.</p><button className={styles.primary} type="button" onClick={() => dispatch({ type: "begin", roundIndex: game.roundIndex })}>Comenzar votos<ArrowRight size={18} aria-hidden /></button></div> : null}

          {game.phase === "handoff" ? <div className={styles.handoff}><div className={styles.lock}><LockKeyhole size={36} aria-hidden /></div><p>Solo {player.name} mira la próxima pantalla.</p><p className={styles.note}>{game.voterIndex} de {game.players.length} votos guardados. Las respuestas se revelan al final.</p><button className={styles.primary} type="button" onClick={() => dispatch({ type: "open", ...token })}>Soy {player.name}<ArrowRight size={18} aria-hidden /></button></div> : null}

          {game.phase === "ballot" ? <BallotScreen key={`${game.roundIndex}-${game.voterIndex}`} prompt={prompt} player={player} count={game.players.length} onConfirm={(ballot) => dispatch({ type: "submit", ...token, ballot })} /> : null}

          {game.phase === "reveal" && result ? <div className={styles.stack}>
            <p className={styles.question}>{prompt.question}</p>
            <div className={styles.distribution} aria-label={`${result.aCount} eligieron A y ${game.players.length - result.aCount} eligieron B`}><div className={styles.sideA}><strong>{result.aCount}</strong><span>A · {prompt.a}</span></div><div className={styles.sideB}><strong>{game.players.length - result.aCount}</strong><span>B · {prompt.b}</span></div></div>
            <p className={styles.note}>Ahora sí: cuenten por qué eligieron ese lado.</p>
            <ul className={styles.results}>{result.results.map((vote) => <li key={vote.name}><div><strong>{vote.name}</strong><span>Votó {vote.choice.toUpperCase()} · predijo {vote.prediction} en A{vote.double ? " · doble" : ""}</span></div><span className={styles.points}>+{vote.points}<small>{vote.prediction === result.aCount ? "Exacto" : Math.abs(vote.prediction - result.aCount) === 1 ? "A uno" : "Lejos"}</small></span></li>)}</ul>
            <button className={styles.primary} type="button" onClick={() => dispatch({ type: "next", roundIndex: game.roundIndex })}>{lastRound ? "Ver resultado final" : "Siguiente dilema"}<ArrowRight size={18} aria-hidden /></button>
            <details className={styles.scoreDetails}><summary>Ver marcador total</summary><Scoreboard players={game.players} /></details>
          </div> : null}

          {game.phase === "finished" ? <div className={styles.stack}>
            <div className={styles.winner}><Trophy size={36} aria-hidden /><p>{winners.length === 1 ? "Quien mejor leyó al grupo" : "Comparten la victoria"}</p><h2>{winners.map((winner) => winner.name).join(" · ")}</h2><strong>{winners[0].score} puntos</strong></div>
            <Scoreboard players={game.players} />
            <p className={styles.note}>{game.deck.length} dilemas, {game.players.length} miradas. ¿Se conocen un poco más?</p>
            <button className={styles.primary} type="button" onClick={start}><RotateCcw size={18} aria-hidden />Revancha con este grupo</button><button className={styles.secondary} type="button" onClick={() => setGame(null)}>Cambiar configuración</button>
          </div> : null}
        </>}
      </section>
    </main>
  );
}

function PromptCard({ prompt }: { prompt: Prompt }) {
  return <div className={styles.prompt}><p className={styles.question}>{prompt.question}</p><div className={styles.optionDisplay}><p><span>A</span>{prompt.a}</p><p><span>B</span>{prompt.b}</p></div></div>;
}

function BallotScreen({ prompt, player, count, onConfirm }: { prompt: Prompt; player: Player; count: number; onConfirm: (ballot: Ballot) => void }) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [prediction, setPrediction] = useState(Math.round(count / 2));
  const [double, setDouble] = useState(false);
  const min = choice === "a" ? 1 : 0;
  const max = choice === "b" ? count - 1 : count;

  function select(next: Choice) {
    setChoice(next);
    setPrediction((current) => Math.min(Math.max(current, next === "a" ? 1 : 0), next === "b" ? count - 1 : count));
  }

  return <div className={styles.stack}>
    <p className={styles.question}>{prompt.question}</p>
    <fieldset className={styles.fieldset}><legend>1. ¿Qué elegís vos?</legend><div className={styles.voteOptions}>{(["a", "b"] as const).map((side) => <button className={styles.voteButton} key={side} type="button" aria-pressed={choice === side} onClick={() => select(side)}><span>{side.toUpperCase()}</span>{prompt[side]}{choice === side ? <Check size={20} aria-hidden /> : null}</button>)}</div></fieldset>
    <fieldset className={styles.fieldset}><legend>2. ¿Cuántas personas elegirán A?</legend><p id="sintonia-prediction-help" className={styles.note}>De las {count} personas del grupo, incluyéndote. {choice === "a" ? "Tu A ya cuenta: el mínimo es 1." : choice === "b" ? `Vos elegiste B: el máximo es ${count - 1}.` : "Primero elegí tu lado."}</p><div className={styles.predictions} aria-describedby="sintonia-prediction-help">{Array.from({ length: count + 1 }, (_, value) => <button className={styles.numberButton} type="button" key={value} aria-label={`${value} ${value === 1 ? "persona elegirá" : "personas elegirán"} A`} aria-pressed={prediction === value} disabled={!choice || value < min || value > max} onClick={() => setPrediction(value)}>{value}</button>)}</div></fieldset>
    <label className={styles.doubleBox}><input type="checkbox" checked={double} disabled={player.doubleUsed} onChange={(event) => setDouble(event.target.checked)} /><span><strong>{player.doubleUsed ? "Ya usaste tu doble" : "Usar mi doble"}</strong><small>{player.doubleUsed ? "Esta ronda suma puntos normales." : "Una sola vez por partida. Exacto = 6; a uno = 2."}</small></span><b aria-hidden>×2</b></label>
    <p className={styles.note}>Al confirmar se oculta tu respuesta y le pasás el celular a la siguiente persona.</p>
    <button className={styles.primary} type="button" disabled={!choice} onClick={() => { if (choice) onConfirm({ choice, prediction, double }); }}><LockKeyhole size={18} aria-hidden />Confirmar y ocultar voto</button>
  </div>;
}

function Scoreboard({ players }: { players: Player[] }) {
  return <ul className={styles.scoreboard} aria-label="Puntajes totales">{[...players].sort((a, b) => b.score - a.score).map((player) => <li key={player.name}><span>{player.name}</span><strong>{player.score} <small>pts</small></strong></li>)}</ul>;
}
