"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CheckCheck, ChevronLeft, ChevronRight, CircleHelp, Eye, Lightbulb, RotateCcw, ScanSearch, Search, Shuffle, X } from "lucide-react";
import { CASE_FILES } from "./data/cases";
import { advanceGame, clueText, createGame, DIFFICULTIES, explainClue, getScore, type Difficulty, type GameAction, type GameState } from "./logic/engine";
import { createExitGuard, type ExitGuard } from "./logic/navigation";
import styles from "./Game.module.css";

type Confirmation = "exit" | "reveal" | "hint";

export function MesaDeSospechososGame() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<Difficulty>("primer-caso");
  const [game, setGame] = useState<GameState | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [marked, setMarked] = useState<number[]>([]);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const exitGuardRef = useRef<ExitGuard | null>(null);
  const exitViaHistoryRef = useRef(false);
  const playing = game?.phase === "playing";

  useEffect(() => {
    if (playing && !exitGuardRef.current) {
      exitGuardRef.current = createExitGuard(window, () => {
        exitViaHistoryRef.current = true;
        setConfirmation("exit");
      });
    }
    exitGuardRef.current?.setActive(playing);
  }, [playing]);

  useEffect(() => () => {
    exitGuardRef.current?.dispose();
    exitGuardRef.current = null;
  }, []);

  useEffect(() => {
    if (game?.phase && game.phase !== "playing") resultHeadingRef.current?.focus();
  }, [game?.phase]);

  function startCase() {
    let seed = crypto.getRandomValues(new Uint32Array(1))[0];
    if (seed === game?.puzzle.seed) seed = (seed + 1) >>> 0;
    setGame(createGame(seed, difficulty));
    setSelected(null);
    setMarked([]);
    setAnnouncement("Caso abierto. Lean las pistas y acomoden la mesa.");
    sectionRef.current?.scrollIntoView({ block: "start" });
  }

  function dispatch(action: { type: "check" | "hint" | "reveal" }) {
    if (!game) return;
    const token = { version: game.version, caseSeed: game.puzzle.seed };
    setGame((current) => current ? advanceGame(current, { ...action, ...token }) : current);
  }

  function swap(from: number, to: number) {
    if (!game || !playing) return;
    // Keep the rendered revision: queued repeat taps cannot move a second time.
    const action: GameAction = { type: "swap", from, to, version: game.version, caseSeed: game.puzzle.seed };
    setGame((current) => current ? advanceGame(current, action) : current);
    setSelected(to);
    setAnnouncement(`${personName(game, game.order[from])} pasa al asiento ${to + 1}; ${personName(game, game.order[to])} pasa al ${from + 1}.`);
  }

  function chooseSeat(seat: number) {
    if (selected === null) {
      setSelected(seat);
      setAnnouncement(`${personName(game!, game!.order[seat])}, asiento ${seat + 1}. Elegí otra ficha para intercambiarlas.`);
    } else if (selected === seat) {
      setSelected(null);
      setAnnouncement("Selección cancelada.");
    } else {
      swap(selected, seat);
      setSelected(null);
    }
  }

  function confirmAction() {
    const action = confirmation;
    setConfirmation(null);
    if (action === "exit") {
      if (exitViaHistoryRef.current && exitGuardRef.current) exitGuardRef.current.confirmBack();
      else { exitGuardRef.current?.dispose(); router.push("/"); }
    }
    if (action === "reveal") { dispatch({ type: "reveal" }); setSelected(null); }
    if (action === "hint") dispatch({ type: "hint" });
  }

  const checkedThisOrder = game?.checkedOrders.includes(game.order.join("|"));
  const file = game ? CASE_FILES[game.puzzle.seed % CASE_FILES.length] : null;
  const setting = DIFFICULTIES.find((entry) => entry.id === difficulty)!;

  return (
    <main className={styles.shell}>
      <button type="button" className={styles.back} onClick={() => {
        exitViaHistoryRef.current = false;
        if (playing) setConfirmation("exit"); else router.push("/");
      }}><ArrowLeft size={18} aria-hidden="true" /> Volver al menú</button>
      <header className={styles.header}>
        <span className={styles.logo}><ScanSearch size={28} aria-hidden="true" /></span>
        <div><p className={styles.eyebrow}>Una mesa. Una sola respuesta.</p><h1>Mesa de sospechosos</h1></div>
      </header>

      <section ref={sectionRef} className={styles.caseArea}>
        {!game ? (
          <div className={styles.panel}>
            <div className={styles.setupVisual} aria-hidden="true"><span>?</span><span>◆</span><span>?</span><span>★</span><span>?</span></div>
            <p className={styles.eyebrow}>Abran el expediente</p>
            <h2>Piensen en voz alta.</h2>
            <p className={styles.copy}>Cada testigo recuerda algo distinto. Crucen las pistas y acomoden a todos: solo una mesa puede ser la correcta.</p>
            <fieldset className={styles.fieldset}>
              <legend>Elijan el tamaño del desafío</legend>
              <div className={styles.options}>
                {DIFFICULTIES.map((entry) => <label className={styles.option} key={entry.id}>
                  <input type="radio" name="difficulty" value={entry.id} checked={entry.id === difficulty} onChange={() => setDifficulty(entry.id)} />
                  <span><strong>{entry.label}</strong><small>{entry.detail}</small></span>
                  <span className={styles.count} aria-hidden="true">{entry.count}</span>
                </label>)}
              </div>
            </fieldset>
            <div className={styles.setupRules}><p><strong>3 comprobaciones.</strong> Cada error cuesta 10 puntos.</p><p><strong>2 ayudas opcionales.</strong> Cada una cuesta 15 puntos.</p><p>Sin reloj. Una victoria compartida, desde 100 puntos.</p></div>
            <button type="button" className={styles.primary} onClick={startCase}><Search size={19} aria-hidden="true" /> Abrir caso · {setting.count} sospechosos</button>
          </div>
        ) : (
          <>
            <div className={styles.caseHeader}>
              <div><p className={styles.eyebrow}>Expediente · {DIFFICULTIES.find((entry) => entry.id === game.puzzle.difficulty)?.label}</p><h2>{file!.title}</h2><p className={styles.copy}>{file!.detail}</p></div>
              <div className={styles.stats} aria-label="Estado del caso"><p><strong>{playing ? 3 - game.attempts : game.attempts}<span>/ 3</span></strong><span>{playing ? "intentos restantes" : "comprobaciones"}</span></p><p><strong>{getScore(game)}</strong><span>{playing ? "puntos posibles" : "puntos del grupo"}</span></p></div>
            </div>

            {playing ? (
              <>
                <section className={styles.boardPanel} aria-labelledby="board-title">
                  <div className={styles.sectionHeading}><h3 id="board-title">Su hipótesis</h3><span><Shuffle size={15} aria-hidden="true" /> Tocá dos fichas</span></div>
                  <div className={styles.direction}><span>Asiento 1</span><ArrowRight size={18} aria-hidden="true" /><span>Asiento {game.order.length}</span></div>
                  <Board game={game} order={game.order} selected={selected} onSelect={chooseSeat} />
                  <div className={styles.moveControls}>
                    <p id="board-help">{selected === null ? "Elegí una ficha y después otra para intercambiarlas." : `${personName(game, game.order[selected])} seleccionada. Tocá otra ficha o movela un asiento.`}</p>
                    <div><button type="button" className={styles.arrowButton} disabled={selected === null || selected === 0} aria-label="Mover ficha seleccionada al asiento anterior" onClick={() => selected !== null && swap(selected, selected - 1)}><ChevronLeft size={20} aria-hidden="true" /> Anterior</button><button type="button" className={styles.arrowButton} disabled={selected === null || selected === game.order.length - 1} aria-label="Mover ficha seleccionada al asiento siguiente" onClick={() => selected !== null && swap(selected, selected + 1)}>Siguiente <ChevronRight size={20} aria-hidden="true" /></button></div>
                  </div>
                  <p className={styles.tableNote}>Es una fila: el primer y el último asiento no son vecinos.</p>
                </section>

                <section className={styles.cluePanel} aria-labelledby="clue-title">
                  <div className={styles.sectionHeading}><h3 id="clue-title">Testimonios</h3><span>{game.puzzle.clues.length} pistas</span></div>
                  <p className={styles.clueIntro}>Marquen las que creen resueltas. Son anotaciones, no una validación.</p>
                  <ol className={styles.clues}>{game.puzzle.clues.map((clue, index) => <li key={index}>
                    <button type="button" aria-pressed={marked.includes(index)} aria-label={`${marked.includes(index) ? "Desmarcar" : "Marcar"} pista ${index + 1}: ${clueText(clue, game.puzzle.people)}`} className={`${styles.clue} ${marked.includes(index) ? styles.marked : ""}`} onClick={() => setMarked((current) => current.includes(index) ? current.filter((value) => value !== index) : [...current, index])}>
                      <span className={styles.clueNumber}>{marked.includes(index) ? <Check size={16} aria-hidden="true" /> : index + 1}</span><span>{clueText(clue, game.puzzle.people)}</span>
                    </button>
                  </li>)}</ol>
                  {game.hints.length > 0 && <div className={styles.hints}><h4><Lightbulb size={16} aria-hidden="true" /> Ayudas compradas</h4>{game.hints.map((hint) => <p key={hint.a}>{clueText(hint, game.puzzle.people)}</p>)}</div>}
                </section>

                <section className={styles.actionsPanel} aria-label="Comprobar la hipótesis">
                  <div role="status" aria-live="polite" aria-atomic="true" className={game.feedback ? styles.feedback : styles.checkHelp}>
                    {game.feedback ? <><strong>Todavía no encaja.</strong><p>{game.feedback.violations} {game.feedback.violations === 1 ? "pista o ayuda no se cumple" : "pistas o ayudas no se cumplen"}. Les quedan {3 - game.attempts} comprobaciones. −10 puntos.</p></> : <p>Comprobar cuenta un intento. Mover fichas y marcar pistas es gratis.</p>}
                  </div>
                  <button type="button" className={styles.primary} disabled={checkedThisOrder} onClick={() => { dispatch({ type: "check" }); setSelected(null); }}><CheckCheck size={20} aria-hidden="true" /> {checkedThisOrder ? "Este orden ya fue comprobado" : `Comprobar mesa · ${3 - game.attempts} disponibles`}</button>
                  <div className={styles.actionPair}><button type="button" className={styles.secondary} disabled={game.hints.length >= 2} onClick={() => setConfirmation("hint")}><Lightbulb size={18} aria-hidden="true" /> {game.hints.length >= 2 ? "Ayudas agotadas" : `Ayuda · −15 puntos (${2 - game.hints.length})`}</button><button type="button" className={styles.quiet} onClick={() => setConfirmation("reveal")}><Eye size={18} aria-hidden="true" /> Revelar solución</button></div>
                </section>
              </>
            ) : (
              <section className={styles.result} aria-labelledby="result-title">
                <span className={styles.resultIcon}>{game.phase === "solved" ? <CheckCheck size={34} aria-hidden="true" /> : <ScanSearch size={34} aria-hidden="true" />}</span>
                <p className={styles.eyebrow}>{game.phase === "solved" ? "Caso resuelto en equipo" : game.phase === "lost" ? "Tres hipótesis descartadas" : "Expediente abierto"}</p>
                <h2 id="result-title" ref={resultHeadingRef} tabIndex={-1}>{game.phase === "solved" ? "¡Todas las piezas encajan!" : game.phase === "lost" ? "Esta mesa se les escapó." : "Así se sentaron realmente."}</h2>
                <p className={styles.copy}>{game.phase === "solved" ? `Consiguieron ${getScore(game)} puntos entre todos, con ${game.attempts} ${game.attempts === 1 ? "comprobación" : "comprobaciones"} y ${game.hints.length} ${game.hints.length === 1 ? "ayuda" : "ayudas"}.` : "Este caso termina con 0 puntos. Miren el orden y comparen las pistas para encarar el próximo."}</p>
                <h3>La única solución</h3><Board game={game} order={game.puzzle.solution} />
                {game.phase !== "solved" && <details className={styles.previous}><summary>Comparar con su última hipótesis</summary><Board game={game} order={game.order} /></details>}
                <div className={styles.explanation}><h3>Por qué encaja</h3><ol>{[...game.puzzle.clues, ...game.hints].map((clue, index) => <li key={index}><Check size={17} aria-hidden="true" /><div><p>{clueText(clue, game.puzzle.people)}</p><small>{explainClue(clue, game.puzzle)}</small></div></li>)}</ol></div>
                <button type="button" className={styles.primary} onClick={startCase}><RotateCcw size={19} aria-hidden="true" /> Otro caso · misma dificultad</button>
                <button type="button" className={styles.secondary} onClick={() => { setGame(null); setSelected(null); setMarked([]); }}>Cambiar dificultad</button>
              </section>
            )}
          </>
        )}
      </section>

      <details className={styles.rules}>
        <summary><CircleHelp size={18} aria-hidden="true" /> Guía de la mesa</summary>
        <p>Los números de asiento nunca cambian. «Menor» significa más cerca del asiento 1; no hace falta estar al lado. «Consecutivos» significa que no hay nadie entre las dos personas. «Entre» no exige estar junto a ninguna de las dos.</p>
        <p>Toquen una ficha y otra para intercambiarlas. Con teclado, usen Tab y Enter o Espacio para seleccionar; después Tab hasta otra ficha o hasta Anterior / Siguiente. Tocando la misma ficha cancelan la selección.</p>
        <p>Las pistas son verdaderas y juntas definen una sola mesa. No se valida en vivo: las marcas son su anotación. Hasta tres comprobaciones; cada error resta 10 puntos. Una ayuda revela un asiento, cuesta 15 y no mueve las fichas. Revelar o agotar los intentos termina con 0. Todos ganan juntos; no hay turnos ni empate individual.</p>
      </details>
      <p className={styles.footnote}>Todo queda en este celular. Recargar o volver al menú pierde el caso.</p>
      <span className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</span>

      {confirmation && <ConfirmDialog kind={confirmation} onCancel={() => setConfirmation(null)} onConfirm={confirmAction} />}
    </main>
  );
}

function personName(game: GameState, id: string) {
  return game.puzzle.people.find((person) => person.id === id)!.name;
}

function Board({ game, order, selected, onSelect }: { game: GameState; order: string[]; selected?: number | null; onSelect?: (seat: number) => void }) {
  return <ol className={styles.board} style={{ "--seats": order.length } as CSSProperties} aria-label={onSelect ? "Asientos de su hipótesis, del primero al último" : "Asientos ordenados, del primero al último"}>
    {order.map((id, seat) => {
      const person = game.puzzle.people.find((entry) => entry.id === id)!;
      const content = <><span className={styles.seatNumber}>{seat + 1}</span><span className={styles.personSymbol} aria-hidden="true">{person.symbol}</span><strong>{person.name}</strong>{onSelect && <span className={styles.selectionIndicator} aria-hidden="true">{seat === selected ? "●" : "○"}</span>}</>;
      return <li key={seat}>{onSelect ? <button type="button" aria-label={`Asiento ${seat + 1}: ${person.name}`} aria-pressed={seat === selected} aria-describedby="board-help" className={`${styles.person} ${seat === selected ? styles.selected : ""}`} onClick={() => onSelect(seat)}>{content}</button> : <div className={styles.person} aria-label={`Asiento ${seat + 1}: ${person.name}`}>{content}</div>}</li>;
    })}
  </ol>;
}

function ConfirmDialog({ kind, onConfirm, onCancel }: { kind: Confirmation; onConfirm: () => void; onCancel: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  const copy = {
    exit: { title: "¿Cerrar el expediente?", body: "Si salís, se pierde este caso. Si seguís investigando, la mesa y tus marcas quedan como están.", action: "Salir del caso", cancel: "Seguir investigando" },
    reveal: { title: "¿Ver la solución?", body: "El caso termina con 0 puntos. Después podrán ver el orden correcto y cómo encaja cada pista.", action: "Revelar y terminar", cancel: "Seguir pensando" },
    hint: { title: "Una ubicación por 15 puntos", body: "La ayuda revela el asiento exacto de una persona. La mesa no se mueve; ustedes deciden cómo acomodarla.", action: "Comprar ayuda · −15", cancel: "Seguir sin ayuda" },
  }[kind];
  return <dialog ref={ref} className={styles.dialog} aria-labelledby="confirm-title" aria-describedby="confirm-description" onCancel={onCancel}>
    <button type="button" className={styles.close} aria-label="Cancelar y seguir investigando" onClick={() => { ref.current?.close(); onCancel(); }}><X size={22} aria-hidden="true" /></button>
    <h2 id="confirm-title">{copy.title}</h2><p id="confirm-description">{copy.body}</p>
    <button type="button" autoFocus className={styles.secondary} onClick={() => { ref.current?.close(); onCancel(); }}>{copy.cancel}</button>
    <button type="button" className={styles.primary} onClick={() => { ref.current?.close(); onConfirm(); }}>{copy.action}</button>
  </dialog>;
}
