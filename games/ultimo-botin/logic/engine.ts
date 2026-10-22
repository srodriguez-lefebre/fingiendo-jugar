export type Danger = "grieta" | "derrumbe" | "niebla";
export type Finding =
  | { kind: "treasure"; value: number }
  | { kind: "hazard"; danger: Danger };
export type ExpeditionCount = 3 | 5 | 7;
export type Outcome = "banked" | "rescued" | "lost" | "exhausted";
export type ExpeditionResult = {
  expedition: number;
  captain: string;
  outcome: Outcome;
  gold: number;
  steps: number;
};
export type GameState = {
  players: string[];
  expeditionCount: ExpeditionCount;
  target: number;
  expedition: number;
  phase: "exploring" | "accident" | "summary" | "finished";
  version: number;
  total: number;
  pending: number;
  ropeAvailable: boolean;
  deck: Finding[];
  revealed: Finding[];
  dangers: Danger[];
  results: ExpeditionResult[];
};

export const EXPEDITIONS = [3, 5, 7] as const;
export const TARGETS: Record<ExpeditionCount, number> = { 3: 40, 5: 65, 7: 90 };
export const DANGER_NAMES: Record<Danger, string> = {
  grieta: "Grieta",
  derrumbe: "Derrumbe",
  niebla: "Niebla",
};

export function validateSetup(players: string[], expeditionCount: number): string[] {
  const errors: string[] = [];
  if (players.length < 2 || players.length > 8) {
    errors.push("Anotá de 2 a 8 personas.");
  }
  const names = players.map((name) => name.trim());
  if (names.some((name) => !name || name.length > 24)) {
    errors.push("Cada nombre debe tener entre 1 y 24 caracteres.");
  }
  if (new Set(names.map((name) => name.toLocaleLowerCase("es"))).size !== names.length) {
    errors.push("Usen nombres distintos para reconocer la capitanía.");
  }
  if (!EXPEDITIONS.includes(expeditionCount as ExpeditionCount)) {
    errors.push("Elegí 3, 5 o 7 expediciones.");
  }
  return errors;
}

export function createGame(
  players: string[],
  expeditionCount: ExpeditionCount,
  deck: Finding[],
): GameState {
  const errors = validateSetup(players, expeditionCount);
  if (errors.length) throw new Error(errors.join(" "));
  return {
    players: players.map((name) => name.trim()),
    expeditionCount,
    target: TARGETS[expeditionCount],
    expedition: 1,
    phase: "exploring",
    version: 0,
    total: 0,
    pending: 0,
    ropeAvailable: true,
    deck: [...deck],
    revealed: [],
    dangers: [],
    results: [],
  };
}

export type GameAction = { version: number } & (
  | { type: "explore" | "bank" | "rescue" | "abandon" }
  | { type: "next"; deck: Finding[] }
);

export function shuffleDeck(random: () => number = Math.random): Finding[] {
  const deck: Finding[] = [3, 3, 4, 4, 4, 5, 5, 5, 7, 7, 9, 9].map(
    (value) => ({ kind: "treasure", value }),
  );
  for (const danger of ["grieta", "derrumbe", "niebla"] as const) {
    deck.push({ kind: "hazard", danger }, { kind: "hazard", danger });
  }
  for (let index = deck.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [deck[index], deck[swap]] = [deck[swap], deck[index]];
  }
  return deck;
}

export function getRisk(state: GameState): { dangerous: number; remaining: number } {
  return {
    dangerous: state.deck.filter(
      (finding) => finding.kind === "hazard" && state.dangers.includes(finding.danger),
    ).length,
    remaining: state.deck.length,
  };
}

function closeExpedition(state: GameState, outcome: Outcome, gold: number): GameState {
  return {
    ...state,
    phase: state.expedition === state.expeditionCount ? "finished" : "summary",
    version: state.version + 1,
    pending: 0,
    total: state.total + gold,
    ropeAvailable: outcome === "rescued" ? false : state.ropeAvailable,
    results: [
      ...state.results,
      {
        expedition: state.expedition,
        captain: state.players[(state.expedition - 1) % state.players.length],
        outcome,
        gold,
        steps: state.revealed.length,
      },
    ],
  };
}

export function advanceGame(state: GameState, action: GameAction): GameState {
  if (action.version !== state.version || state.phase === "finished") return state;

  if (action.type === "next") {
    if (state.phase !== "summary") return state;
    return {
      ...state,
      phase: "exploring",
      version: state.version + 1,
      expedition: state.expedition + 1,
      deck: [...action.deck],
      revealed: [],
      dangers: [],
      pending: 0,
    };
  }

  if (state.phase === "accident") {
    if (action.type === "abandon") return closeExpedition(state, "lost", 0);
    if (action.type === "rescue" && state.ropeAvailable && state.pending >= 2) {
      return closeExpedition(state, "rescued", Math.floor(state.pending / 2));
    }
    return state;
  }

  if (state.phase !== "exploring") return state;
  if (action.type === "bank" && state.pending > 0) {
    return closeExpedition(state, "banked", state.pending);
  }
  if (action.type !== "explore") return state;

  const [finding, ...deck] = state.deck;
  if (!finding) return closeExpedition(state, "exhausted", state.pending);

  const repeated = finding.kind === "hazard" && state.dangers.includes(finding.danger);
  const next: GameState = {
    ...state,
    deck,
    revealed: [...state.revealed, finding],
    pending: state.pending + (finding.kind === "treasure" ? finding.value : 0),
    dangers: finding.kind === "hazard" && !repeated
      ? [...state.dangers, finding.danger]
      : state.dangers,
  };
  if (repeated) return { ...next, phase: "accident", version: state.version + 1 };
  if (!deck.length) return closeExpedition(next, "exhausted", next.pending);
  return { ...next, version: state.version + 1 };
}
