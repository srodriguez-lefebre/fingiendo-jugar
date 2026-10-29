"use client";

import { ArrowLeft, ArrowRight, Check, EyeOff, LockKeyhole, PencilLine, Plus, SkipForward, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { Album, EntryView } from './components/Album';
import { DrawingBoard } from './components/Drawing';
import { choosePrompts } from './data/prompts';
import { createGame, gameReducer, getGallery, getTurn, validateNames } from './logic/engine';
import type { GameAction, GameState, Stroke } from './logic/engine';
import styles from './Game.module.css';

export function TelefonoDibujadoGame() {
  const [names, setNames] = useState(['', '']);
  const [chainCount, setChainCount] = useState(2);
  const [game, setGame] = useState<GameState | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [text, setText] = useState('');
  const [confirmExit, setConfirmExit] = useState(false);
  const [confirmPass, setConfirmPass] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const error = validateNames(names);

  useEffect(() => { headingRef.current?.focus(); }, [game?.phase, game?.chainIndex, game?.turnIndex, confirmExit, confirmPass]);

  function start() {
    if (error) return;
    setGame(createGame(names, choosePrompts(chainCount), crypto.randomUUID()));
    setStrokes([]); setText(''); setConfirmExit(false); setConfirmPass(false);
  }
  function dispatch(action: GameAction) { setGame((current) => current ? gameReducer(current, action) : current); }
  function leave() { setGame(null); setStrokes([]); setText(''); setConfirmExit(false); setConfirmPass(false); }

  if (!game) return <main className={styles.shell}>
    <Link className={styles.back} href="/"><ArrowLeft size={17} aria-hidden />Volver al menú</Link>
    <section className={styles.panel} aria-labelledby="telefono-title">
      <header className={styles.heading}><p className={styles.kicker}><PencilLine size={19} aria-hidden />Dibujá. Interpretá. Deformá.</p><h1 id="telefono-title" ref={headingRef} tabIndex={-1}>Teléfono<br /><span>dibujado</span></h1><p>Una idea entra. Otra cosa sale.<br />El desastre lo hacen entre todos.</p></header>
      <div className={styles.demo} aria-hidden="true"><span>UN GATO DJ</span><svg viewBox="0 0 150 95"><path d="M45 45 L36 18 L60 31 Q75 24 90 31 L113 18 L105 47 Q113 75 78 78 Q40 76 45 45 M57 49 L65 49 M87 49 L95 49 M70 63 Q76 70 82 63 M44 50 Q24 49 30 70 L47 70 M107 48 Q126 48 119 70 L104 70 M50 84 L105 84" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg><span>¿UN TIGRE<br />EN LA RADIO?</span></div>
      <div className={styles.setupGrid}>
        <section className={styles.stack} aria-labelledby="telefono-players"><div className={styles.sectionTitle}><h2>La ronda</h2><span>{names.length}/8</span></div><p id="telefono-players" className={styles.note}>Sentados en este orden. Un solo celular.</p>
          {names.map((name, index) => <div className={styles.nameRow} key={index}><label htmlFor={`telefono-name-${index}`}>{index + 1}</label><input id={`telefono-name-${index}`} aria-label={`Nombre de la persona ${index + 1}`} autoComplete="off" maxLength={24} placeholder={`Persona ${index + 1}`} value={name} onChange={(event) => setNames((current) => current.map((value, i) => i === index ? event.target.value : value))} /><button className={styles.iconButton} type="button" disabled={names.length <= 2} aria-label={`Quitar persona ${index + 1}`} onClick={() => setNames((current) => current.filter((_, i) => i !== index))}><X size={18} aria-hidden /></button></div>)}
          <button className={styles.secondary} type="button" disabled={names.length >= 8} onClick={() => setNames((current) => current.length < 8 ? [...current, ''] : current)}><Plus size={18} aria-hidden />Sumar persona</button>
        </section>
        <section className={styles.stack} aria-label="Opciones de partida"><fieldset className={styles.fieldset}><legend>¿Cuántas cadenas?</legend><div className={styles.options}>{[1, 2, 3].map((value) => <label key={value} className={styles.option}><input type="radio" name="telefono-chains" checked={chainCount === value} onChange={() => setChainCount(value)} /><span><strong>{value}</strong>{value === 1 ? 'Una prueba' : value === 2 ? 'Doble lío' : 'El álbum'}</span></label>)}</div></fieldset>
          <div className={styles.ruleBox}><strong>{chainCount * names.length} entregas. Cero vergüenza.</strong><p>Cada persona participa una vez por cadena. Quien empieza rota. Dibujan una frase o describen un dibujo, siempre a escondidas.</p></div><p className={styles.note}>Sin reloj ni puntos. Pueden pasar si se traban. Al final abren todas las cadenas juntos.</p>
        </section>
      </div>
      <p className={styles.validation} id="telefono-error" aria-live="polite">{error ?? 'La ronda está pronta. Que empiece el malentendido.'}</p>
      <button className={styles.primary} type="button" disabled={Boolean(error)} aria-describedby="telefono-error" onClick={start}>Armar el teléfono<ArrowRight size={19} aria-hidden /></button>
      <p className={styles.storageNote}>Todo queda en este celular mientras juegan. Recargar o volver al menú borra la partida.</p>
    </section>
  </main>;

  const turn = getTurn(game);
  const closesChain = game.turnIndex === game.names.length - 1;
  const token = { sessionId: game.sessionId, chainIndex: game.chainIndex, turnIndex: game.turnIndex };
  const title = confirmExit ? '¿Dejamos el teléfono?' : confirmPass ? '¿Pasás esta entrega?' : game.phase === 'finished' ? 'Ahora sí, miren todos.' : game.phase === 'handoff' ? `Le toca a ${turn.playerName}` : turn.mode === 'drawing' ? `Dibujá, ${turn.playerName}` : `¿Qué ves, ${turn.playerName}?`;
  function submit() {
    dispatch({ type: 'submit', ...token, entry: turn.mode === 'drawing' ? { kind: 'drawing', strokes } : { kind: 'text', text } });
    setStrokes([]); setText('');
  }

  return <main className={styles.shell}>
    <nav className={styles.topbar} aria-label="Partida de Teléfono dibujado">{game.phase === 'finished' ? <Link className={styles.back} href="/"><ArrowLeft size={17} aria-hidden />Menú</Link> : <button className={styles.back} type="button" onClick={() => setConfirmExit(true)}><ArrowLeft size={17} aria-hidden />Salir</button>}<span>{game.phase === 'finished' ? 'Álbum abierto' : `Cadena ${game.chainIndex + 1} de ${game.chains.length}`}</span></nav>
    <section className={styles.panel} aria-labelledby="telefono-play-title"><header className={styles.playHeading}><p className={styles.kicker}><PencilLine size={18} aria-hidden />Teléfono dibujado</p><h1 id="telefono-play-title" ref={headingRef} tabIndex={-1}>{title}</h1></header>
      {confirmExit ? <div className={styles.stack}><div className={styles.sealed}><EyeOff size={32} aria-hidden /><p>Tu entrega está tapada y el borrador sigue acá.</p></div><p>Si dejás la partida, se pierden los dibujos y las frases.</p><button className={styles.primary} type="button" onClick={() => setConfirmExit(false)}>Seguir jugando</button><button className={styles.secondary} type="button" onClick={leave}>Dejar partida</button></div> : confirmPass ? <div className={styles.stack}><div className={styles.sealed}><SkipForward size={32} aria-hidden /><p>{closesChain ? 'Este pase cierra la cadena. El álbum va a mostrar la entrega omitida.' : 'El álbum va a mostrar que acá hubo un pase. La siguiente persona inventa cómo seguir.'}</p></div><button className={styles.primary} type="button" onClick={() => { dispatch({ type: 'pass', ...token }); setConfirmPass(false); setStrokes([]); setText(''); }}>Sí, pasar esta entrega</button><button className={styles.secondary} type="button" onClick={() => setConfirmPass(false)}>Volver a mi borrador</button></div> : <>
        {game.phase === 'handoff' ? <div className={styles.handoff}><div className={styles.envelope}><LockKeyhole size={38} aria-hidden /><span>ENTREGA SELLADA</span></div><p>Pasale el celular a <strong>{turn.playerName}</strong>.<br />El resto mira para otro lado.</p><div className={styles.turnDots} aria-label={`Entrega ${game.turnIndex + 1} de ${game.names.length}`}>{game.names.map((_, i) => <span key={i} className={i < game.turnIndex ? styles.doneDot : i === game.turnIndex ? styles.currentDot : ''}>{i < game.turnIndex ? <Check size={13} aria-hidden /> : i + 1}</span>)}</div><p className={styles.note}>{game.turnIndex === 0 ? 'Nueva idea. Nadie ve las cadenas hasta el álbum final.' : 'Solo vas a ver lo que dejó la persona anterior.'}</p><button className={styles.primary} type="button" onClick={() => dispatch({ type: 'open', ...token })}>Soy {turn.playerName}<ArrowRight size={19} aria-hidden /></button></div> : null}
        {game.phase === 'create' && turn.previous ? <div className={styles.stack}>
          <div className={styles.previous}><p className={styles.smallLabel}>{turn.mode === 'drawing' ? 'La frase que recibiste' : 'El dibujo que recibiste'}</p>{turn.previous.kind === 'pass' ? <div className={styles.passPrompt}><SkipForward size={22} aria-hidden /><p>La persona anterior pasó.<br /><strong>{turn.mode === 'drawing' ? 'Inventá un dibujo para reenganchar la cadena.' : 'Inventá una frase para reenganchar la cadena.'}</strong></p></div> : <EntryView entry={turn.previous} />}</div>
          {turn.mode === 'drawing' ? <><p className={styles.note}>Dibujá esa idea sin escribir palabras. Lo que salga está bien.</p><DrawingBoard key={`${game.sessionId}-${game.chainIndex}-${game.turnIndex}`} strokes={strokes} onChange={setStrokes} /></> : <div className={styles.stack}><label className={styles.descriptionLabel} htmlFor="telefono-description">Poné en palabras lo que ves</label><textarea id="telefono-description" autoComplete="off" maxLength={120} rows={3} placeholder="Para mí, esto es…" value={text} onChange={(event) => setText(event.target.value)} /><p className={styles.note}>{text.length}/120 · La siguiente persona solo recibe tu frase.</p></div>}
          <button className={styles.primary} type="button" disabled={turn.mode === 'drawing' ? !strokes.length : !text.trim()} onClick={submit}><LockKeyhole size={18} aria-hidden />Sellar {turn.mode === 'drawing' ? 'dibujo' : 'frase'}<ArrowRight size={18} aria-hidden /></button><button className={styles.passButton} type="button" onClick={() => setConfirmPass(true)}><SkipForward size={17} aria-hidden />Me trabé, prefiero pasar</button>
        </div> : null}
        {game.phase === 'finished' ? <Album chains={getGallery(game)} names={game.names} onRematch={start} onSetup={leave} /> : null}
      </>}
    </section>
  </main>;
}
