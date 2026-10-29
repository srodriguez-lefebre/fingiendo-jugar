"use client";

import { Keyboard, Trash2, Undo2 } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';

import { COLORS, MAX_POINTS, MAX_STROKES, WIDTHS, normalizePoint, sanitizeStroke, undoStroke } from '../logic/engine';
import type { Point, Stroke } from '../logic/engine';
import styles from '../Game.module.css';

export function DrawingPreview({ strokes, label = 'Dibujo recibido' }: { strokes: Stroke[]; label?: string }) {
  return <svg className={styles.preview} viewBox="0 0 1000 700" role="img" aria-label={label}><StrokePaths strokes={strokes} /></svg>;
}

function StrokePaths({ strokes }: { strokes: Stroke[] }) {
  return <>{strokes.map((stroke, i) => stroke.points.length === 1
    ? <circle key={i} cx={stroke.points[0][0]} cy={stroke.points[0][1]} r={stroke.width / 2} fill={stroke.color} />
    : <polyline key={i} points={stroke.points.map((point) => point.join(',')).join(' ')} stroke={stroke.color} strokeWidth={stroke.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}</>;
}

export function DrawingBoard({ strokes, onChange }: { strokes: Stroke[]; onChange: (strokes: Stroke[]) => void }) {
  const [color, setColor] = useState<Stroke['color']>(COLORS[0]);
  const [width, setWidth] = useState<Stroke['width']>(WIDTHS[0]);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [cursor, setCursor] = useState<Point>([500, 350]);
  const [penDown, setPenDown] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const drawingRef = useRef(strokes);
  const active = useRef<{ index: number; pointer: number | 'keyboard' } | null>(null);
  useLayoutEffect(() => { drawingRef.current = strokes; }, [strokes]);

  function update(next: Stroke[]) { drawingRef.current = next; onChange(next); }
  function finish() { active.current = null; setPenDown(false); }
  function begin(point: Point, pointer: number | 'keyboard') {
    if (drawingRef.current.length >= MAX_STROKES) return;
    active.current = { index: drawingRef.current.length, pointer };
    update([...drawingRef.current, { color, width, points: [point] }]);
    setPenDown(true);
  }
  function extend(point: Point) {
    if (!active.current) return;
    const { index } = active.current;
    const previous = drawingRef.current[index];
    if (!previous) return;
    const end = previous.points.at(-1)!;
    if (Math.hypot(end[0] - point[0], end[1] - point[1]) < 2) return;
    const next = sanitizeStroke({ ...previous, points: [...previous.points, point] });
    if (next) update(drawingRef.current.map((stroke, i) => i === index ? next : stroke));
  }
  function pointerPoint(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return normalizePoint(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height);
  }
  function pointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0 || active.current) return;
    const point = pointerPoint(event);
    if (!point) return;
    event.preventDefault();
    setKeyboardMode(false);
    begin(point, event.pointerId);
    if (active.current) event.currentTarget.setPointerCapture(event.pointerId);
  }
  function pointerMove(event: PointerEvent<SVGSVGElement>) {
    if (active.current?.pointer !== event.pointerId) return;
    const point = pointerPoint(event);
    if (point) extend(point);
  }
  function pointerUp(event: PointerEvent<SVGSVGElement>) {
    if (active.current?.pointer !== event.pointerId) return;
    const point = pointerPoint(event);
    if (point) extend(point);
    finish();
  }
  function keyDown(event: KeyboardEvent<SVGSVGElement>) {
    const directions: Record<string, Point> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    if (event.key === ' ') {
      event.preventDefault();
      if (event.repeat) return;
      setKeyboardMode(true);
      if (active.current) finish(); else begin(cursor, 'keyboard');
    } else if (directions[event.key]) {
      event.preventDefault();
      setKeyboardMode(true);
      const delta = directions[event.key];
      const step = event.shiftKey ? 50 : 15;
      const next = normalizePoint(cursor[0] + delta[0] * step, cursor[1] + delta[1] * step, 1000, 700)!;
      setCursor(next);
      if (active.current?.pointer === 'keyboard') extend(next);
    } else if (event.key === 'Escape') { event.preventDefault(); finish(); }
  }
  const colorNames = ['Tinta', 'Frutilla', 'Bosque', 'Violeta'];
  return <div className={styles.drawingTool}>
    <div className={styles.tools}>
      <div className={styles.swatches} role="group" aria-label="Color del lápiz">{COLORS.map((value, i) => <button key={value} type="button" className={styles.swatch} style={{ '--ink': value } as React.CSSProperties} aria-label={colorNames[i]} aria-pressed={color === value} onClick={() => { finish(); setColor(value); }}><span /></button>)}</div>
      <div className={styles.widths} role="group" aria-label="Grosor del lápiz">{WIDTHS.map((value, i) => <button key={value} type="button" aria-label={['Trazo fino', 'Trazo medio', 'Trazo grueso'][i]} aria-pressed={width === value} onClick={() => { finish(); setWidth(value); }}><span style={{ width: 5 + i * 4, height: 5 + i * 4 }} /></button>)}</div>
    </div>
    <div className={styles.sheet}>
      <svg ref={svgRef} className={styles.canvas} viewBox="0 0 1000 700" preserveAspectRatio="none" tabIndex={0} role="application" aria-label="Hoja para dibujar" aria-describedby="telefono-keyboard-help telefono-pen-status" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={finish} onLostPointerCapture={finish} onKeyDown={keyDown} onBlur={() => { if (active.current?.pointer === 'keyboard') finish(); }}>
        <StrokePaths strokes={strokes} />
        {keyboardMode ? <g pointerEvents="none" aria-hidden="true"><circle cx={cursor[0]} cy={cursor[1]} r={24} fill={penDown ? '#ffc75a' : '#ffffff'} fillOpacity=".75" stroke="#25233a" strokeWidth="3" strokeDasharray={penDown ? undefined : '5 5'} /><path d={`M${cursor[0] - 35},${cursor[1]} h70 M${cursor[0]},${cursor[1] - 35} v70`} stroke="#25233a" strokeWidth="2" /></g> : null}
      </svg>
      {!strokes.length && !keyboardMode ? <span className={styles.emptySheet} aria-hidden="true">No hace falta dibujar bien.<br /><strong>Hace falta mandarse.</strong></span> : null}
    </div>
    <div className={styles.tools}>
      <button className={styles.toolButton} type="button" disabled={!strokes.length} onClick={() => { finish(); update(undoStroke(drawingRef.current)); }}><Undo2 size={18} aria-hidden />Deshacer</button>
      <button className={styles.toolButton} type="button" disabled={!strokes.length} onClick={() => { finish(); setClearConfirm(true); }}><Trash2 size={18} aria-hidden />Limpiar</button>
      <button className={styles.toolButton} type="button" onClick={() => { finish(); setKeyboardMode(true); svgRef.current?.focus(); }}><Keyboard size={18} aria-hidden />Teclado</button>
    </div>
    {clearConfirm ? <div className={styles.inlineConfirm} role="group" aria-label="Confirmar limpieza"><span>¿Borrar este dibujo?</span><button type="button" onClick={() => { update([]); setClearConfirm(false); }}>Sí, limpiar</button><button type="button" onClick={() => setClearConfirm(false)}>Conservar</button></div> : null}
    <p id="telefono-pen-status" className={styles.note} aria-live="polite">{strokes.length >= MAX_STROKES ? 'Llegaste a 64 trazos. Deshacé uno para seguir o entregá tu obra.' : keyboardMode ? `Cursor ${cursor[0]}, ${cursor[1]}. Lápiz ${penDown ? 'apoyado' : 'levantado'}. ${strokes.length}/64 trazos.` : `${strokes.length}/64 trazos · dedo, mouse o teclado`}</p>
    <details className={styles.help} open={keyboardMode}><summary>Cómo dibujar con teclado</summary><p id="telefono-keyboard-help">Enfocá la hoja. Espacio apoya o levanta el lápiz. Flechas mueven el cursor; con Shift avanzan más. Escape levanta el lápiz. Tab sale de la hoja. Hasta {MAX_POINTS} puntos por trazo, simplificados automáticamente.</p></details>
  </div>;
}
