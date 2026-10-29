"use client";

import { ArrowRight, BookOpen, Eye, RotateCcw } from 'lucide-react';
import { useRef, useState } from 'react';

import type { Entry } from '../logic/engine';
import { DrawingPreview } from './Drawing';
import styles from '../Game.module.css';

export function Album({ chains, names, onRematch, onSetup }: { chains: Entry[][]; names: string[]; onRematch: () => void; onSetup: () => void }) {
  const [chainIndex, setChainIndex] = useState(0);
  const [visible, setVisible] = useState(1);
  const cardRef = useRef<HTMLLIElement>(null);
  const chain = chains[chainIndex];
  const complete = visible >= chain.length;
  const allComplete = complete && chainIndex === chains.length - 1;
  return <div className={styles.stack}>
    <div className={styles.albumHeading}><BookOpen size={24} aria-hidden /><div><h2>El museo del malentendido</h2><p>Cadena {chainIndex + 1} de {chains.length}. La idea original y todas sus vidas.</p></div></div>
    <div className={styles.albumTabs} role="group" aria-label="Elegir cadena">{chains.map((_, i) => <button key={i} type="button" aria-pressed={chainIndex === i} onClick={() => { setChainIndex(i); setVisible(1); }}>Cadena {i + 1}</button>)}</div>
    <ol className={styles.album}>
      {chain.slice(0, visible).map((entry, i) => <li key={`${chainIndex}-${i}`} ref={i === visible - 1 ? cardRef : undefined} tabIndex={-1} className={styles.albumCard}>
        <div className={styles.cardCaption}><span>{i === 0 ? 'La chispa original' : `${i}. ${names[entry.author!]}`}</span><span>{entry.kind === 'drawing' ? 'Dibujó' : entry.kind === 'pass' ? 'Pasó' : i === 0 ? 'Idea secreta' : 'Interpretó'}</span></div>
        <EntryView entry={entry} />
      </li>)}
    </ol>
    {!complete ? <button className={styles.primary} type="button" onClick={() => { setVisible((current) => Math.min(chain.length, current + 1)); requestAnimationFrame(() => { cardRef.current?.focus({ preventScroll: true }); cardRef.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' }); }); }}><Eye size={18} aria-hidden />Revelar siguiente entrega<span>{visible}/{chain.length}</span></button> : <div className={styles.finalNote}><strong>¿En qué momento se fue todo de tema?</strong><p>El original era solo el comienzo. Cada interpretación cuenta.</p></div>}
    {complete && !allComplete ? <button className={styles.primary} type="button" onClick={() => { setChainIndex((current) => current + 1); setVisible(1); }}>Abrir la siguiente cadena<ArrowRight size={18} aria-hidden /></button> : null}
    {allComplete ? <><button className={styles.primary} type="button" onClick={onRematch}><RotateCcw size={18} aria-hidden />Otra partida con este grupo</button><button className={styles.secondary} type="button" onClick={onSetup}>Cambiar grupo o cadenas</button></> : null}
  </div>;
}

export function EntryView({ entry }: { entry: Entry }) {
  if (entry.kind === 'drawing') return <DrawingPreview strokes={entry.strokes} />;
  if (entry.kind === 'pass') return <div className={styles.passCard}><span aria-hidden="true">↝</span><strong>Acá hubo un pase</strong><p>{entry.expected === 'drawing' ? 'Esta entrega de dibujo se omitió a propósito.' : 'Esta entrega de frase se omitió a propósito.'}</p></div>;
  return <blockquote className={styles.phrase}>{entry.text}</blockquote>;
}
