"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Coins, Compass, Flag, Mountain, Plus, RotateCcw, ShieldCheck, TriangleAlert, X } from "lucide-react";
import { useState } from "react";

import {
  advanceGame,
  createGame,
  DANGER_NAMES,
  EXPEDITIONS,
  getRisk,
  shuffleDeck,
  TARGETS,
  validateSetup,
  type ExpeditionCount,
  type ExpeditionResult,
  type GameAction,
  type GameState,
} from "./logic/engine";
import styles from "./Game.module.css";

const OUTCOME_NAMES = {
  banked: "Guardado",
  rescued: "Con cuerda",
  lost: "Perdido",
  exhausted: "Ruta completa",
};

export function UltimoBotinGame() {
  const [people, setPeople] = useState([
    { id: "person-1", name: "" },
    { id: "person-2", name: "" },
  ]);
  const [expeditionCount, setExpeditionCount] = useState<ExpeditionCount>(5);
  const [game, setGame] = useState<GameState | null>(null);
  const setupErrors = validateSetup(people.map((person) => person.name), expeditionCount);

  function startGame() {
    if (setupErrors.length) return;
    const nextGame = createGame(people.map((person) => person.name), expeditionCount, shuffleDeck());
    setGame(nextGame);
  }

  function playAction(type: Exclude<GameAction["type"], "next">) {
    if (!game) return;
    const action: GameAction = { type, version: game.version };
    setGame((current) => current ? advanceGame(current, action) : current);
  }

  function nextExpedition() {
    if (!game || game.phase !== "summary") return;
    const action: GameAction = { type: "next", version: game.version, deck: shuffleDeck() };
    setGame((current) => current ? advanceGame(current, action) : current);
  }

  return (
    <main className={styles.shell}>
      <Link href="/" className={styles.back}><ArrowLeft size={18} aria-hidden="true" /> Volver al menú</Link>
      <header className={styles.header}>
        <span className={styles.logo}><Compass size={28} aria-hidden="true" /></span>
        <div><p className={styles.eyebrow}>Un grupo. Una cuerda.</p><h1>Último Botín</h1></div>
      </header>

      {!game ? (
        <section className={styles.panel} aria-labelledby="setup-heading">
          <p className={styles.eyebrow}>Preparar la aventura</p>
          <h2 id="setup-heading">¿Quiénes se animan?</h2>
          <p className={styles.copy}>Cooperan para juntar tesoro. La capitanía rota: recibe el celular, escucha al grupo y registra si siguen o guardan el botín.</p>
          <form onSubmit={(event) => { event.preventDefault(); startGame(); }}>
            <fieldset className={styles.fieldset}>
              <legend>El grupo · de 2 a 8 personas</legend>
              <div className={styles.names}>
                {people.map((person, index) => (
                  <div className={styles.nameRow} key={person.id}>
                    <label htmlFor={person.id}>Persona {index + 1}</label>
                    <div className={styles.inputRow}>
                      <input id={person.id} value={person.name} maxLength={24} autoComplete="off" placeholder="Nombre o apodo" aria-describedby="setup-errors" onChange={(event) => {
                        const name = event.target.value;
                        setPeople((current) => current.map((entry) => entry.id === person.id ? { ...entry, name } : entry));
                      }} />
                      <button type="button" className={styles.iconButton} disabled={people.length <= 2} aria-label={`Quitar persona ${index + 1}`} onClick={() => setPeople((current) => current.length > 2 ? current.filter((entry) => entry.id !== person.id) : current)}><X size={18} aria-hidden="true" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className={styles.secondary} disabled={people.length >= 8} onClick={() => {
                const person = { id: crypto.randomUUID(), name: "" };
                setPeople((current) => current.length < 8 ? [...current, person] : current);
              }}><Plus size={18} aria-hidden="true" /> Sumar persona</button>
            </fieldset>
            <fieldset className={styles.fieldset}>
              <legend>¿Cuántas expediciones?</legend>
              <div className={styles.options}>
                {EXPEDITIONS.map((count) => (
                  <label className={styles.option} key={count}>
                    <input type="radio" name="expeditions" value={count} checked={count === expeditionCount} onChange={() => setExpeditionCount(count)} />
                    <span><strong>{count} expediciones</strong><small>Objetivo: {TARGETS[count]} monedas</small></span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div id="setup-errors" className={styles.validation} aria-live="polite">
              {setupErrors.length ? setupErrors.map((error) => <p key={error}>{error}</p>) : <p><Check size={16} aria-hidden="true" /> Grupo listo para salir.</p>}
            </div>
            <button type="submit" className={styles.primary} disabled={setupErrors.length > 0}><Compass size={20} aria-hidden="true" /> Iniciar aventura</button>
          </form>
        </section>
      ) : (
        <>
          <section className={styles.scoreboard} aria-label="Objetivo del grupo">
            <div><span>Tesoro seguro</span><strong>{game.total}<small> / {game.target}</small></strong></div>
            <div><span>Expedición</span><strong>{game.expedition}<small> / {game.expeditionCount}</small></strong></div>
            <p className={styles.rope}><ShieldCheck size={18} aria-hidden="true" /> {game.ropeAvailable ? "Cuerda disponible · un solo uso" : "Cuerda ya usada"}</p>
            <progress value={Math.min(game.total, game.target)} max={game.target} aria-label={`${game.total} de ${game.target} monedas guardadas`} />
          </section>

          {(game.phase === "exploring" || game.phase === "accident") && (
            <Expedition game={game} onAction={playAction} />
          )}

          {game.phase === "summary" && (
            <section className={styles.panel} aria-labelledby="summary-heading">
              <p className={styles.eyebrow}>Expedición terminada</p>
              <h2 id="summary-heading">{game.results.at(-1)?.outcome === "lost" ? "Esta vez volvieron sin botín" : "El tesoro está a salvo"}</h2>
              <p className={styles.resultNumber}>+{game.results.at(-1)?.gold}<span> monedas guardadas</span></p>
              <p className={styles.copy}>Próxima capitanía: <strong>{game.players[game.expedition % game.players.length]}</strong>. Pasale el celular y decidan cuánto se animan a arriesgar.</p>
              <button className={styles.primary} onClick={nextExpedition}>Expedición {game.expedition + 1}<ArrowRight size={20} aria-hidden="true" /></button>
            </section>
          )}

          {game.phase === "finished" && (
            <section className={styles.panel} aria-labelledby="result-heading">
              <span className={styles.finishIcon}><Flag size={36} aria-hidden="true" /></span>
              <p className={styles.eyebrow}>Aventura terminada</p>
              <h2 id="result-heading">{game.total >= game.target ? "¡Botín conseguido!" : "El botín quedó corto"}</h2>
              <p className={styles.resultNumber}>{game.total}<span> monedas seguras</span></p>
              <p className={styles.copy}>{game.total >= game.target ? `Superaron el objetivo de ${game.target} monedas. La victoria es de todo el grupo.` : `Les faltaron ${game.target - game.total} monedas para el objetivo de ${game.target}. ¿Guardan antes o se arriesgan más en la próxima?`}</p>
              <div className={styles.actions}>
                <button className={styles.primary} onClick={startGame}><RotateCcw size={18} aria-hidden="true" /> Jugar otra vez</button>
                <button className={styles.secondary} onClick={() => setGame(null)}>Cambiar grupo o duración</button>
              </div>
            </section>
          )}

          {game.results.length > 0 && <History results={game.results} />}
        </>
      )}

      <details className={styles.rules}>
        <summary>Cómo se juega</summary>
        <ol>
          <li>Explorar revela tesoro o peligro. Hay 12 tesoros y dos copias de cada uno de los 3 peligros por expedición.</li>
          <li>Debatan juntos: seguir para sumar más o guardar el botín pendiente y cerrar la expedición.</li>
          <li>El primer peligro de cada tipo avisa. Repetirlo causa un accidente; solamente se pierde el botín pendiente.</li>
          <li>Después de un accidente, pueden gastar su única cuerda para salvar la mitad del botín, redondeada hacia abajo. O aceptar la pérdida y guardarla para después.</li>
          <li>Si se agota la ruta sin accidente, se guarda todo. Al terminar todas las expediciones, alcancen el objetivo entre todos.</li>
        </ol>
      </details>
      <p className={styles.footnote}>Si recargás la página o volvés al menú, la partida se reinicia.</p>
    </main>
  );
}

function Expedition({ game, onAction }: { game: GameState; onAction: (type: Exclude<GameAction["type"], "next">) => void }) {
  const finding = game.revealed.at(-1);
  const accident = game.phase === "accident";
  const risk = getRisk(game);
  const percent = risk.remaining ? Math.round(risk.dangerous / risk.remaining * 100) : 0;
  const rescueAmount = Math.floor(game.pending / 2);

  return (
    <section className={styles.panel} aria-labelledby="expedition-heading">
      <p className={styles.eyebrow}>Decide el grupo · toca la capitanía</p>
      <h2 id="expedition-heading">Al mando: {game.players[(game.expedition - 1) % game.players.length]}</h2>
      <div className={`${styles.finding} ${accident ? styles.accident : ""}`} role="status" aria-live="polite" aria-atomic="true">
        {finding?.kind === "treasure" ? <Coins size={38} aria-hidden="true" /> : finding ? <TriangleAlert size={38} aria-hidden="true" /> : <Mountain size={38} aria-hidden="true" />}
        <p className={styles.eyebrow}>{accident ? "Peligro repetido · accidente" : finding ? `Hallazgo ${game.revealed.length}` : "La ruta espera"}</p>
        <h3>{finding?.kind === "treasure" ? `+${finding.value} monedas` : finding ? DANGER_NAMES[finding.danger] : "¿Dan el primer paso?"}</h3>
        <p>{accident ? "El botín pendiente corre peligro. Decidan si usan la cuerda." : finding?.kind === "hazard" ? "Un aviso. Si vuelve a aparecer, pierden el botín pendiente." : finding ? "Se suma al botín pendiente. Todavía tienen que volver con él." : "Todo el grupo mira el celular. La primera exploración todavía no puede causar un accidente."}</p>
      </div>

      <div className={styles.pending}><span>Botín pendiente</span><strong>{game.pending}<small> monedas</small></strong></div>

      {!accident ? (
        <>
          <div className={styles.dangers} aria-label="Peligros descubiertos">
            {(Object.keys(DANGER_NAMES) as Array<keyof typeof DANGER_NAMES>).map((danger) => {
              const seen = game.dangers.includes(danger);
              return <span className={seen ? styles.seen : ""} key={danger}><TriangleAlert size={15} aria-hidden="true" /> {DANGER_NAMES[danger]} {seen ? "1/2" : "0/2"}</span>;
            })}
          </div>
          <div className={styles.risk}>
            <strong>{percent}% <span>de accidente en el próximo paso</span></strong>
            <p>{risk.dangerous} de {risk.remaining} hallazgos restantes repiten un peligro. Un peligro nuevo todavía es seguro.</p>
          </div>
          <div className={styles.actions}>
            <button className={styles.primary} onClick={() => onAction("explore")}><Compass size={20} aria-hidden="true" /> {finding ? "Seguir explorando" : "Explorar"}</button>
            <button className={styles.secondary} disabled={!game.pending} onClick={() => onAction("bank")}><Coins size={18} aria-hidden="true" /> Guardar {game.pending} monedas</button>
          </div>
          {!game.pending && <p className={styles.hint}>Primero encuentren tesoro para poder guardarlo.</p>}
        </>
      ) : (
        <div className={styles.actions}>
          {game.ropeAvailable && rescueAmount > 0 ? (
            <><button className={styles.primary} onClick={() => onAction("rescue")}><ShieldCheck size={20} aria-hidden="true" /> Usar cuerda · salvar {rescueAmount}</button><p className={styles.hint}>La cuerda se gasta para toda la partida. Las otras {game.pending - rescueAmount} monedas se pierden.</p></>
          ) : <p className={styles.copy}>{game.ropeAvailable ? "No hay botín suficiente para rescatar. Conservan la cuerda." : "Ya gastaron la cuerda. El tesoro seguro queda intacto."}</p>}
          <button className={styles.secondary} onClick={() => onAction("abandon")}>Aceptar pérdida · guardar 0</button>
        </div>
      )}

      {game.revealed.length > 0 && (
        <div className={styles.trail}><h3>El camino recorrido</h3><ol>{game.revealed.map((entry, index) => <li key={index} className={entry.kind === "hazard" ? styles.trailDanger : ""} aria-label={`Paso ${index + 1}: ${entry.kind === "treasure" ? `${entry.value} monedas` : DANGER_NAMES[entry.danger]}`}>{entry.kind === "treasure" ? <><Coins size={14} aria-hidden="true" />{entry.value}</> : <><TriangleAlert size={14} aria-hidden="true" />{DANGER_NAMES[entry.danger]}</>}</li>)}</ol></div>
      )}
    </section>
  );
}

function History({ results }: { results: ExpeditionResult[] }) {
  return <section className={styles.history} aria-labelledby="history-heading"><h2 id="history-heading">El botín del grupo</h2><ol>{results.map((result) => <li key={result.expedition}><div><strong>{result.expedition}. {result.captain}</strong><span>{OUTCOME_NAMES[result.outcome]} · {result.steps} hallazgos</span></div><strong>+{result.gold}<span> monedas</span></strong></li>)}</ol></section>;
}
