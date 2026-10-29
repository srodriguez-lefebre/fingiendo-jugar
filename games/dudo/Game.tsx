"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Dices, Eye, EyeOff, Minus, Plus, RotateCcw, Shield, Trophy, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { advanceGame, createGame, isValidBid, minimumBid, privateHand, publicView, rollHands, validateSetup, winnerIndexes, type Bid, type Face, type GameAction, type GameState, type Laps, type PublicView } from "./logic/engine";
import styles from "./Game.module.css";

const FACES: Face[] = [1, 2, 3, 4, 5, 6];
const PIPS: Record<Face, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

export function DudoGame() {
  const [people, setPeople] = useState([{ id: "dudo-1", name: "" }, { id: "dudo-2", name: "" }]);
  const [laps, setLaps] = useState<Laps>(2);
  const [game, setGame] = useState<GameState | null>(null);
  const [draft, setDraft] = useState<{ turn: number; bid: Bid } | null>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const exitDialog = useRef<HTMLDialogElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const errors = validateSetup(people.map((person) => person.name), laps);
  const view = game ? publicView(game) : null;
  const totalDice = people.length * 3;
  const minimum = view ? minimumBid(view.bid, view.players.length * 3) : null;
  const proposed = draft?.turn === view?.version ? draft?.bid : minimum;
  const canBid = Boolean(view && proposed && isValidBid(proposed, view.bid, view.players.length * 3));

  useEffect(() => {
    if (game && !exitOpen) heading.current?.focus();
  }, [game?.phase, game?.version, exitOpen, game]);

  useEffect(() => {
    if (exitOpen) exitDialog.current?.showModal();
  }, [exitOpen]);

  function start() {
    if (errors.length) return;
    setGame(createGame(people.map((person) => person.name), laps, rollHands(people.length)));
    setDraft(null);
  }

  function act(type: GameAction["type"]) {
    if (!game) return;
    const action: GameAction = type === "bid"
      ? { type, version: game.version, bid: proposed! }
      : type === "next" || type === "replay"
        ? { type, version: game.version, hands: rollHands(game.players.length) }
        : { type, version: game.version };
    if (type === "bid" && !canBid) return;
    setGame((current) => current ? advanceGame(current, action) : current);
  }

  function changeBid(next: Bid) {
    if (view) setDraft({ turn: view.version, bid: next });
  }

  function closeExit() {
    exitDialog.current?.close();
    setExitOpen(false);
    backButton.current?.focus();
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        {game ? <button ref={backButton} className={styles.back} onClick={() => setExitOpen(true)}><ArrowLeft size={18} aria-hidden="true" /> Salir</button> : <Link className={styles.back} href="/"><ArrowLeft size={18} aria-hidden="true" /> Menú</Link>}
        <Link href="/games/dudo" className={styles.brand} onClick={(event) => { if (game) { event.preventDefault(); setExitOpen(true); } }}><Dices size={23} aria-hidden="true" /><span>Dudo</span></Link>
        <span className={styles.local}>Un celular</span>
      </header>

      {!game ? (
        <>
          <section className={styles.intro}>
            <div className={styles.heroDice} aria-hidden="true"><Die face={3} /><Die face={5} /><Die face={1} /></div>
            <p className={styles.eyebrow}>La cara de póker la ponés vos</p>
            <h1>Tres dados.<br /><span>Muchas mentiras.</span></h1>
            <p>Vos sabés lo que tenés. El resto… te lo tiene que creer.</p>
          </section>
          <section className={styles.panel} aria-labelledby="setup-title">
            <div className={styles.sectionTitle}><h2 id="setup-title">Armen la mesa</h2><span>{people.length} / 8</span></div>
            <form onSubmit={(event) => { event.preventDefault(); start(); }} className={styles.setup}>
              <fieldset className={styles.fieldset}>
                <legend>Nombres o apodos · de 2 a 8 personas</legend>
                <div className={styles.names}>
                  {people.map((person, index) => <div className={styles.nameRow} key={person.id}>
                    <label htmlFor={person.id}>{index + 1}</label>
                    <input id={person.id} value={person.name} maxLength={24} placeholder={`Persona ${index + 1}`} autoComplete="off" aria-label={`Nombre de persona ${index + 1}`} aria-describedby="dudo-errors" onChange={(event) => {
                      const name = event.target.value;
                      setPeople((current) => current.map((entry) => entry.id === person.id ? { ...entry, name } : entry));
                    }} />
                    <button type="button" className={styles.iconButton} aria-label={`Quitar persona ${index + 1}`} disabled={people.length <= 2} onClick={() => setPeople((current) => current.length > 2 ? current.filter((entry) => entry.id !== person.id) : current)}><X size={18} aria-hidden="true" /></button>
                  </div>)}
                </div>
                <button type="button" className={styles.addPerson} disabled={people.length >= 8} onClick={() => {
                  const person = { id: crypto.randomUUID(), name: "" };
                  setPeople((current) => current.length < 8 ? [...current, person] : current);
                }}><Plus size={17} aria-hidden="true" /> Sumar persona</button>
              </fieldset>
              <fieldset className={styles.fieldset}>
                <legend>Todos abren la misma cantidad de veces</legend>
                <div className={styles.options}>{([1, 2] as const).map((count) => <label className={styles.option} key={count}>
                  <input type="radio" name="dudo-laps" value={count} checked={laps === count} onChange={() => setLaps(count)} />
                  <span><strong>{count === 1 ? "Una vuelta" : "Dos vueltas"}</strong><small>{count * people.length} rondas · {count === 1 ? "Para probar" : "La revancha del farol"}</small></span>
                </label>)}</div>
              </fieldset>
              <div className={styles.setupNote}><Shield size={18} aria-hidden="true" /><p>3 dados cada uno. Sin comodines, sin eliminación. Cada desafío reparte 2 puntos.</p></div>
              <div id="dudo-errors" className={styles.errors} aria-live="polite">{errors.length ? errors.map((error) => <p key={error}>{error}</p>) : <p><Check size={16} aria-hidden="true" /> Mesa lista · {totalDice} dados en juego</p>}</div>
              <button className={styles.primary} type="submit" disabled={errors.length > 0}>Repartir dados <ArrowRight size={19} aria-hidden="true" /></button>
            </form>
          </section>
        </>
      ) : view && !exitOpen ? (
        <>
          <div className={styles.roundBar}><span>Ronda <strong>{view.round}</strong> / {view.roundCount}</span><span>{view.players.length * 3} dados en la mesa</span></div>
          <div className={styles.roundTrack} aria-label={`Ronda ${view.round} de ${view.roundCount}`}>{Array.from({ length: view.roundCount }, (_, index) => <span key={index} className={index < view.round - 1 ? styles.roundDone : index === view.round - 1 ? styles.roundActive : ""} />)}</div>

          {view.phase === "handoff" && (
            <section className={`${styles.panel} ${styles.handoff}`} aria-labelledby="handoff-title">
              <div className={styles.sealed} aria-hidden="true"><EyeOff size={48} /><div><i /><i /><i /></div></div>
              <p className={styles.eyebrow}>Dados tapados · pasá el celular</p>
              <h1 ref={heading} tabIndex={-1} id="handoff-title">Le toca a<br /><span>{view.players[view.active]}</span></h1>
              <p className={styles.copy}>Que nadie más mire la pantalla.<br />Tus dados aparecen cuando vos decidas.</p>
              {view.bid ? <CurrentBid view={view} compact /> : <p className={styles.firstBid}>Abrís esta ronda. Elegí la primera apuesta.</p>}
              <button className={styles.primary} onClick={() => act("peek")}><Eye size={20} aria-hidden="true" /> Soy {view.players[view.active]} · ver mis dados</button>
            </section>
          )}

          {view.phase === "turn" && (
            <section className={styles.playLayout} aria-labelledby="turn-title">
              <div className={styles.privateTray}>
                <div className={styles.sectionTitle}><p className={styles.eyebrow}><Eye size={14} aria-hidden="true" /> Solo para vos</p><span className={styles.privateBadge}>Privado</span></div>
                <h1 ref={heading} tabIndex={-1} id="turn-title">{view.players[view.active]}, ¿te la creés?</h1>
                <div className={styles.hand} aria-label="Tus tres dados">{privateHand(game, view.active).map((face, index) => <Die key={index} face={face} />)}</div>
                <p>Estos son tuyos. Apostás sobre los <strong>{view.players.length * 3} de toda la mesa.</strong></p>
              </div>
              <div className={styles.panel}>
                {view.bid ? <CurrentBid view={view} /> : <div className={styles.opening}><Dices size={26} aria-hidden="true" /><div><h2>Vos abrís la ronda</h2><p>¿Cuántos dados de una cara habrá entre todos?</p></div></div>}
                {minimum && proposed ? (
                  <div className={styles.bidBuilder}>
                    <div className={styles.sectionTitle}><h2>{view.bid ? "Subí la apuesta" : "Tu primera apuesta"}</h2><span>01 / Apostar</span></div>
                    <div className={styles.quantityLabel}><label htmlFor="dudo-quantity">Cantidad de dados</label><small>Hasta {view.players.length * 3}</small></div>
                    <div className={styles.stepper}>
                      <button className={styles.iconButton} disabled={proposed.quantity <= 1} onClick={() => changeBid({ ...proposed, quantity: proposed.quantity - 1 })} aria-label="Un dado menos"><Minus size={21} aria-hidden="true" /></button>
                      <output htmlFor="dudo-quantity" aria-live="polite">{proposed.quantity}<small>{proposed.quantity === 1 ? "dado" : "dados"}</small></output>
                      <button className={styles.iconButton} disabled={proposed.quantity >= view.players.length * 3} onClick={() => changeBid({ ...proposed, quantity: proposed.quantity + 1 })} aria-label="Un dado más"><Plus size={21} aria-hidden="true" /></button>
                    </div>
                    <input id="dudo-quantity" className={styles.range} type="range" min={1} max={view.players.length * 3} value={proposed.quantity} onChange={(event) => changeBid({ ...proposed, quantity: Number(event.target.value) })} />
                    <fieldset className={styles.fieldset}><legend>De esta cara</legend><div className={styles.facePicker}>{FACES.map((face) => <button className={proposed.face === face ? styles.selectedFace : ""} key={face} aria-pressed={proposed.face === face} aria-label={`Cara ${face}`} onClick={() => changeBid({ ...proposed, face })}><Die face={face} decorative /></button>)}</div></fieldset>
                    <p className={styles.bidHint} aria-live="polite">{canBid ? <>Decís que hay <strong>al menos {proposed.quantity} de cara {proposed.face}</strong>.</> : <>Tiene que subir: más cantidad, o igual cantidad con cara mayor.</>}</p>
                    <button className={styles.primary} disabled={!canBid} onClick={() => act("bid")}>Apostar {proposed.quantity} de {proposed.face} <ArrowRight size={19} aria-hidden="true" /></button>
                    <p className={styles.micro}>Se ocultan tus dados y pasa el turno.</p>
                  </div>
                ) : <p className={styles.maxBid}>La apuesta llegó al máximo. Solo queda decir Dudo.</p>}
                {view.bid && <div className={styles.challenge}><div><span>02 / Desafiar</span><p>¿No hay tantos? Si faltan, ganás 2 puntos. Si alcanza, los gana {view.players[view.bidder!] }.</p></div><button className={styles.dudoButton} onClick={() => act("challenge")}>¡Dudo! <Eye size={20} aria-hidden="true" /></button></div>}
              </div>
            </section>
          )}

          {view.phase === "reveal" && <Reveal view={view} headingRef={heading} onNext={() => act("next")} />}

          {view.phase === "finished" && (
            <section className={`${styles.panel} ${styles.finish}`} aria-labelledby="finish-title">
              <Trophy className={styles.trophy} size={48} aria-hidden="true" />
              <p className={styles.eyebrow}>La mesa tiene su veredicto</p>
              <h1 ref={heading} tabIndex={-1} id="finish-title">{winnerIndexes(view).length > 1 ? "Faroles a la par" : "La mejor cara de póker"}</h1>
              <p className={styles.winnerNames}>{winnerIndexes(view).map((index) => view.players[index]).join(" y ")}</p>
              <p className={styles.copy}>{Math.max(...view.scores)} puntos · {winnerIndexes(view).length > 1 ? "Empate compartido. No hay desempate por azar." : "Una apuesta a tiempo vale tanto como un buen Dudo."}</p>
              <button className={styles.primary} onClick={() => act("replay")}><RotateCcw size={19} aria-hidden="true" /> Revancha · dados nuevos</button>
              <button className={styles.secondary} onClick={() => { setGame(null); setDraft(null); }}>Cambiar grupo o vueltas</button>
            </section>
          )}

          <Scoreboard view={view} />
          {view.bids.length > 0 && view.phase !== "finished" && <details className={styles.history}><summary>Apuestas de esta ronda · {view.bids.length}</summary><ol>{view.bids.map((entry, index) => <li key={index}><span>{view.players[entry.player]}</span><strong>{entry.quantity} de {entry.face}</strong></li>)}</ol></details>}
        </>
      ) : null}

      {!exitOpen && <><details className={styles.rules}><summary>Reglas a mano</summary><ol><li>Cada persona tiene 3 dados privados. El uno vale uno: no hay comodines.</li><li>Apostá cuántos dados de una cara hay entre todos. La apuesta significa «al menos» esa cantidad.</li><li>La siguiente persona puede subir la cantidad, o mantenerla y subir la cara. Ejemplo: 2 de 4 → 2 de 5 o 3 de 1.</li><li>O puede decir Dudo. Se muestran todos: si la apuesta alcanza, quien apostó gana 2 puntos; si faltan dados, quien dudó gana 2. El resto suma 0.</li><li>Se tiran dados nuevos en cada ronda. La apertura rota. Todos siguen jugando; al terminar las vueltas gana quien tenga más puntos y los empates se comparten.</li></ol></details><p className={styles.footnote}>Todo queda en este celular. Recargar o volver al menú reinicia la partida.</p></>}

      {exitOpen && <dialog className={styles.exitDialog} ref={exitDialog} onCancel={(event) => { event.preventDefault(); closeExit(); }} aria-labelledby="exit-title"><div className={styles.exitContent}><EyeOff size={34} aria-hidden="true" /><h2 id="exit-title">¿Salir de la mesa?</h2><p>Vas a perder esta partida. Si seguís jugando, tus dados y tu apuesta preparada quedan como estaban.</p><button className={styles.primary} autoFocus onClick={closeExit}>Seguir jugando</button><Link className={styles.secondary} href="/">Salir al menú</Link></div></dialog>}
    </main>
  );
}

function Die({ face, match = false, decorative = false }: { face: Face; match?: boolean; decorative?: boolean }) {
  return <span className={`${styles.die} ${match ? styles.matchDie : ""}`} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : `Dado ${face}${match ? ", coincide" : ""}`} aria-hidden={decorative || undefined}>{Array.from({ length: 9 }, (_, index) => <i key={index} className={PIPS[face].includes(index) ? styles.pip : ""} />)}</span>;
}

function CurrentBid({ view, compact = false }: { view: PublicView; compact?: boolean }) {
  if (!view.bid || view.bidder === null) return null;
  return <div className={`${styles.currentBid} ${compact ? styles.compactBid : ""}`}><div><p>{view.players[view.bidder]} apuesta</p><strong>{view.bid.quantity}<span> {view.bid.quantity === 1 ? "dado de" : "dados de"}</span></strong></div><Die face={view.bid.face} /><span className={styles.atLeast}>Al menos</span></div>;
}

function Reveal({ view, headingRef, onNext }: { view: PublicView; headingRef: React.RefObject<HTMLHeadingElement | null>; onNext: () => void }) {
  const result = view.results.at(-1)!;
  return <section className={`${styles.panel} ${styles.reveal}`} aria-labelledby="reveal-title">
    <p className={styles.eyebrow}>Todos muestran · {view.players[result.challenger]} dijo Dudo</p>
    <h1 ref={headingRef} tabIndex={-1} id="reveal-title">{result.held ? "La apuesta se sostiene." : "Era demasiado farol."}</h1>
    <div className={styles.verdict}><div><span>Se apostaron</span><strong>{result.bid.quantity}</strong></div><Die face={result.bid.face} /><div><span>En la mesa hay</span><strong>{result.actual}</strong></div></div>
    <p className={styles.award}><Trophy size={19} aria-hidden="true" /><strong>+2 para {view.players[result.winner]}</strong></p>
    <p className={styles.copy}>{result.held ? `Había al menos ${result.bid.quantity}. ${view.players[result.bidder]} tenía razón y gana el desafío.` : `Faltaban ${result.bid.quantity - result.actual}. ${view.players[result.challenger]} leyó bien la mesa y gana el desafío.`}</p>
    <div className={styles.revealedHands}>{view.hands?.map((hand, index) => <div key={index}><div><strong>{view.players[index]}</strong><span>{hand.filter((face) => face === result.bid.face).length} {hand.filter((face) => face === result.bid.face).length === 1 ? "coincide" : "coinciden"}</span></div><div className={styles.smallHand}>{hand.map((face, die) => <Die key={die} face={face} match={face === result.bid.face} />)}</div></div>)}</div>
    <p className={styles.micro}>Los dados marcados suman al conteo. Nadie pierde dados ni sale del juego.</p>
    <button className={styles.primary} onClick={onNext}>{view.round === view.roundCount ? "Ver resultado final" : `Ronda ${view.round + 1} · abre ${view.players[view.round % view.players.length]}`}<ArrowRight size={19} aria-hidden="true" /></button>
  </section>;
}

function Scoreboard({ view }: { view: PublicView }) {
  return <section className={styles.scoreboard} aria-labelledby="score-title"><div className={styles.sectionTitle}><h2 id="score-title">La mesa</h2><span>+2 por desafío ganado</span></div><ol>{view.players.map((name, index) => <li key={index} className={(view.phase === "turn" || view.phase === "handoff") && view.active === index ? styles.activePlayer : ""}><span className={styles.playerNumber}>{index + 1}</span><strong>{name}</strong><span className={styles.score}>{view.scores[index]}<small> pts</small></span></li>)}</ol></section>;
}
