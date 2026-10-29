export const MAX_POINTS = 160;
export const MAX_STROKES = 64;
export const COLORS = ['#25233a', '#a33145', '#176858', '#4f47b5'] as const;
export const WIDTHS = [8, 16, 26] as const;
export type Point = [number, number];
export type Stroke = { color: typeof COLORS[number]; width: typeof WIDTHS[number]; points: Point[] };
export type Mode = 'drawing' | 'text';
export type Entry =
  | { kind: 'text'; text: string; author: number | null }
  | { kind: 'drawing'; strokes: Stroke[]; author: number }
  | { kind: 'pass'; expected: Mode; author: number };
export type Token = { sessionId: string; chainIndex: number; turnIndex: number };
export type GameState = Token & {
  names: string[];
  chains: Entry[][];
  phase: 'handoff' | 'create' | 'finished';
};
export type Submission = { kind: 'text'; text: string } | { kind: 'drawing'; strokes: Stroke[] };
export type GameAction = Token & ({ type: 'open' } | { type: 'pass' } | { type: 'submit'; entry: Submission });

export function validateNames(names: string[]): string | null {
  if (names.length < 2 || names.length > 8) return 'Juegan de 2 a 8 personas.';
  if (names.some((name) => !name.trim())) return 'Completá todos los nombres.';
  if (names.some((name) => name.trim().length > 24)) return 'Usá nombres de hasta 24 caracteres.';
  const keys = names.map((name) => name.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es'));
  if (new Set(keys).size !== names.length) return 'Usá nombres distintos para saber a quién pasarle el celular.';
  return null;
}

export function createGame(names: string[], prompts: string[], sessionId: string): GameState {
  const error = validateNames(names);
  if (error) throw new Error(error);
  if (prompts.length < 1 || prompts.length > 3 || prompts.some((prompt) => !prompt.trim()) || !sessionId) throw new Error('Elegí de 1 a 3 ideas y una sesión válida.');
  return {
    sessionId, names: names.map((name) => name.trim()),
    chains: prompts.map((text) => [{ kind: 'text', text: text.trim().slice(0, 120), author: null }]),
    chainIndex: 0, turnIndex: 0, phase: 'handoff',
  };
}

export function normalizePoint(x: number, y: number, width: number, height: number): Point | null {
  if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return null;
  return [Math.round(Math.max(0, Math.min(1000, x / width * 1000))), Math.round(Math.max(0, Math.min(700, y / height * 700)))];
}

export function sanitizeStroke(stroke: Stroke): Stroke | null {
  const points: Point[] = [];
  for (const point of stroke.points) {
    const clean = normalizePoint(point[0], point[1], 1000, 700);
    const previous = points.at(-1);
    if (clean && (!previous || clean[0] !== previous[0] || clean[1] !== previous[1])) points.push(clean);
  }
  if (!points.length) return null;
  const compact = points.length <= MAX_POINTS ? points : Array.from({ length: MAX_POINTS }, (_, i) => points[Math.round(i * (points.length - 1) / (MAX_POINTS - 1))]);
  return {
    color: COLORS.includes(stroke.color) ? stroke.color : COLORS[0],
    width: WIDTHS.includes(stroke.width) ? stroke.width : WIDTHS[0], points: compact,
  };
}

export function sanitizeDrawing(strokes: Stroke[]): Stroke[] {
  return strokes.slice(0, MAX_STROKES).map(sanitizeStroke).filter((stroke): stroke is Stroke => stroke !== null);
}

export function addStroke(strokes: Stroke[], stroke: Stroke): Stroke[] {
  if (strokes.length >= MAX_STROKES) return strokes;
  const clean = sanitizeStroke(stroke);
  return clean ? [...strokes, clean] : strokes;
}

export function undoStroke(strokes: Stroke[]): Stroke[] { return strokes.slice(0, -1); }

export function getTurn(game: GameState) {
  const playerIndex = (game.chainIndex + game.turnIndex) % game.names.length;
  const mode: Mode = game.turnIndex % 2 ? 'text' : 'drawing';
  return {
    playerIndex, playerName: game.names[playerIndex], mode,
    previous: game.phase === 'create' ? game.chains[game.chainIndex].at(-1) : undefined,
  };
}

export function getGallery(game: GameState): Entry[][] {
  return game.phase === 'finished' ? game.chains : [];
}

export function gameReducer(game: GameState, action: GameAction): GameState {
  if (action.sessionId !== game.sessionId || action.chainIndex !== game.chainIndex || action.turnIndex !== game.turnIndex || game.phase === 'finished') return game;
  if (action.type === 'open') return game.phase === 'handoff' ? { ...game, phase: 'create' } : game;
  if (game.phase !== 'create') return game;
  const turn = getTurn(game);
  let entry: Entry;
  if (action.type === 'pass') {
    entry = { kind: 'pass', expected: turn.mode, author: turn.playerIndex };
  } else if (action.entry.kind === 'text' && turn.mode === 'text') {
    const text = action.entry.text.trim().slice(0, 120);
    if (!text) return game;
    entry = { kind: 'text', text, author: turn.playerIndex };
  } else if (action.entry.kind === 'drawing' && turn.mode === 'drawing') {
    const strokes = sanitizeDrawing(action.entry.strokes);
    if (!strokes.length) return game;
    entry = { kind: 'drawing', strokes, author: turn.playerIndex };
  } else return game;
  const chains = game.chains.map((chain, i) => i === game.chainIndex ? [...chain, entry] : chain);
  if (game.turnIndex + 1 < game.names.length) return { ...game, chains, turnIndex: game.turnIndex + 1, phase: 'handoff' };
  if (game.chainIndex + 1 < chains.length) return { ...game, chains, chainIndex: game.chainIndex + 1, turnIndex: 0, phase: 'handoff' };
  return { ...game, chains, phase: 'finished' };
}
