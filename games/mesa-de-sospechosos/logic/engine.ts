export type Difficulty = "primer-caso" | "detectives" | "mesa-experta";
export type Person = { id: string; name: string; symbol: string };
export type Clue =
  | { kind: "before"; a: string; b: string }
  | { kind: "adjacent"; a: string; b: string }
  | { kind: "apart"; a: string; b: string; distance: number }
  | { kind: "between"; a: string; b: string; c: string }
  | { kind: "notSeat"; a: string; seat: number }
  | { kind: "at"; a: string; seat: number };
export type Puzzle = {
  seed: number;
  difficulty: Difficulty;
  people: Person[];
  solution: string[];
  initialOrder: string[];
  clues: Clue[];
};

export const DIFFICULTIES: { id: Difficulty; label: string; count: number; detail: string }[] = [
  { id: "primer-caso", label: "Primer caso", count: 4, detail: "4 sospechosos · para entrar en calor" },
  { id: "detectives", label: "Detectives", count: 5, detail: "5 sospechosos · más conexiones" },
  { id: "mesa-experta", label: "Mesa experta", count: 6, detail: "6 sospechosos · crucen todas las pistas" },
];

const CAST: Person[] = [
  { id: "alma", name: "Alma", symbol: "◆" },
  { id: "beto", name: "Beto", symbol: "●" },
  { id: "cora", name: "Cora", symbol: "▲" },
  { id: "dante", name: "Dante", symbol: "★" },
  { id: "eva", name: "Eva", symbol: "✦" },
  { id: "fede", name: "Fede", symbol: "■" },
  { id: "gala", name: "Gala", symbol: "♥" },
  { id: "hugo", name: "Hugo", symbol: "⬟" },
];

export function enumerateOrders(ids: string[]): string[][] {
  if (!ids.length || ids.length > 6 || ids.some((id) => !id.trim()) || new Set(ids).size !== ids.length) {
    throw new Error("La mesa necesita entre 1 y 6 identidades distintas.");
  }
  function permute(remaining: string[]): string[][] {
    if (remaining.length === 0) return [[]];
    return remaining.flatMap((id, index) => permute(remaining.filter((_, i) => i !== index)).map((rest) => [id, ...rest]));
  }
  return permute(ids);
}

export function matchesClue(order: string[], clue: Clue): boolean {
  const a = order.indexOf(clue.a);
  if (a < 0) return false;
  if (clue.kind === "at") return a === clue.seat;
  if (clue.kind === "notSeat") return a !== clue.seat;
  // The remaining clue variants all refer to another person.
  if (!("b" in clue)) return false;
  const b = order.indexOf(clue.b);
  if (b < 0) return false;
  if (clue.kind === "before") return a < b;
  if (clue.kind === "adjacent") return Math.abs(a - b) === 1;
  if (clue.kind === "apart") return Math.abs(a - b) === clue.distance;
  const c = order.indexOf(clue.c);
  return c >= 0 && ((b < a && a < c) || (c < a && a < b));
}

export function solveOrders(ids: string[], clues: Clue[]): string[][] {
  return enumerateOrders(ids).filter((order) => clues.every((clue) => matchesClue(order, clue)));
}

function randomFromSeed(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateCase(seed: number, difficulty: Difficulty): Puzzle {
  const setting = DIFFICULTIES.find((entry) => entry.id === difficulty);
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff || !setting) {
    throw new Error("Elegí una dificultad válida y una semilla entera de 32 bits.");
  }
  const random = randomFromSeed(seed);
  const people = shuffle(CAST, random).slice(0, setting.count);
  const ids = people.map((person) => person.id);
  const solution = shuffle(ids, random);
  const candidates: Clue[] = [];
  for (let i = 0; i < solution.length; i++) {
    for (let j = i + 1; j < solution.length; j++) {
      candidates.push({ kind: "before", a: solution[i], b: solution[j] });
      if (j - i === 1) candidates.push({ kind: "adjacent", a: solution[i], b: solution[j] });
      if (j - i > 1 && j - i < 4) candidates.push({ kind: "apart", a: solution[i], b: solution[j], distance: j - i });
      if (setting.count > 4) {
        for (let k = i + 1; k < j; k++) candidates.push({ kind: "between", a: solution[k], b: solution[i], c: solution[j] });
      }
    }
    if (setting.count === 4 && i === 0) {
      candidates.push({ kind: "at", a: solution[i], seat: i });
    } else {
      candidates.push({ kind: "notSeat", a: solution[i], seat: (i + 1) % solution.length });
    }
  }

  const allOrders = enumerateOrders(ids); // Never more than 6! = 720.
  let remaining = allOrders;
  let clues: Clue[] = [];
  // One bounded pass. The full set of true "before" relations guarantees uniqueness.
  for (const clue of shuffle(candidates, random)) {
    const next = remaining.filter((order) => matchesClue(order, clue));
    if (next.length < remaining.length) {
      clues.push(clue);
      remaining = next;
    }
    if (remaining.length === 1) break;
  }
  // Every published clue contributes information: remove redundant statements.
  for (let i = clues.length - 1; i >= 0; i--) {
    const without = clues.filter((_, index) => index !== i);
    if (allOrders.filter((order) => without.every((clue) => matchesClue(order, clue))).length === 1) clues = without;
  }
  if (remaining.length !== 1) throw new Error("El caso no tiene solución única.");
  let initialOrder = shuffle(ids, random);
  if (initialOrder.every((id, i) => id === solution[i])) initialOrder = [...initialOrder.slice(1), initialOrder[0]];
  return { seed, difficulty, people, solution, clues, initialOrder };
}

export type GameState = {
  puzzle: Puzzle;
  order: string[];
  phase: "playing" | "solved" | "lost" | "revealed";
  version: number;
  attempts: number;
  hints: Extract<Clue, { kind: "notSeat" | "at" }>[];
  checkedOrders: string[];
  feedback: { violations: number } | null;
};
export type GameAction = { version: number; caseSeed: number } & (
  | { type: "swap"; from: number; to: number }
  | { type: "check" | "hint" | "reveal" }
);

export function createGame(seed: number, difficulty: Difficulty): GameState {
  const puzzle = generateCase(seed, difficulty);
  return { puzzle, order: [...puzzle.initialOrder], phase: "playing", version: 0, attempts: 0, hints: [], checkedOrders: [], feedback: null };
}

export function getScore(state: GameState): number {
  if (state.phase === "lost" || state.phase === "revealed") return 0;
  const mistakes = state.attempts - (state.phase === "solved" ? 1 : 0);
  return Math.max(0, 100 - mistakes * 10 - state.hints.length * 15);
}

export function advanceGame(state: GameState, action: GameAction): GameState {
  if (state.phase !== "playing" || state.version !== action.version || state.puzzle.seed !== action.caseSeed) return state;
  const next = { ...state, version: state.version + 1 };
  if (action.type === "swap") {
    const { from, to } = action;
    if (!Number.isInteger(from) || !Number.isInteger(to) || from === to || from < 0 || to < 0 || from >= state.order.length || to >= state.order.length) return state;
    const order = [...state.order];
    [order[from], order[to]] = [order[to], order[from]];
    return { ...next, order, feedback: null };
  }
  if (action.type === "hint") {
    if (state.hints.length >= 2) return state;
    const available = state.puzzle.people.filter((person) =>
      !state.hints.some((clue) => clue.a === person.id) &&
      !state.puzzle.clues.some((clue) => clue.kind === "at" && clue.a === person.id));
    const person = available.find((entry) => state.order.indexOf(entry.id) !== state.puzzle.solution.indexOf(entry.id)) ?? available[0];
    if (!person) return state;
    const hint: Clue = { kind: "at", a: person.id, seat: state.puzzle.solution.indexOf(person.id) };
    return { ...next, hints: [...state.hints, hint] };
  }
  if (action.type === "reveal") return { ...next, phase: "revealed" };
  if (action.type === "check") {
    const key = state.order.join("|");
    if (state.checkedOrders.includes(key)) return state;
    const violations = [...state.puzzle.clues, ...state.hints].filter((clue) => !matchesClue(state.order, clue)).length;
    const attempts = state.attempts + 1;
    return {
      ...next, attempts, checkedOrders: [...state.checkedOrders, key], feedback: { violations },
      phase: violations === 0 ? "solved" : attempts === 3 ? "lost" : "playing",
    };
  }
  return state;
}

export function clueText(clue: Clue, people: Person[]): string {
  const name = (id: string) => people.find((person) => person.id === id)?.name ?? id;
  if (clue.kind === "at") return `${name(clue.a)} ocupa el asiento ${clue.seat + 1}.`;
  if (clue.kind === "notSeat") return `${name(clue.a)} no ocupa el asiento ${clue.seat + 1}.`;
  if (!("b" in clue)) return "";
  if (clue.kind === "before") return `${name(clue.a)} tiene un número de asiento menor que ${name(clue.b)}.`;
  if (clue.kind === "adjacent") return `${name(clue.a)} y ${name(clue.b)} ocupan asientos consecutivos.`;
  if (clue.kind === "apart") return `Hay exactamente ${clue.distance - 1} ${clue.distance === 2 ? "persona" : "personas"} entre ${name(clue.a)} y ${name(clue.b)}.`;
  return `${name(clue.a)} se sienta entre ${name(clue.b)} y ${name(clue.c)}, sin necesidad de estar al lado.`;
}

export function explainClue(clue: Clue, puzzle: Puzzle): string {
  const ids = [clue.a, ...("b" in clue ? [clue.b] : []), ...("c" in clue ? [clue.c] : [])];
  return ids.map((id) => `${puzzle.people.find((person) => person.id === id)?.name}: asiento ${puzzle.solution.indexOf(id) + 1}`).join(" · ");
}
