import { AXES } from "../data/axes.mjs";

export { AXES };
export type Axis = { id: string; left: string; right: string };
export type RoundCount = 6 | 8 | 10;
export type Prediction = "left" | "right" | "exact";
export type Round = { axis: Axis; target: number };
export type Phase = "handoff" | "private" | "clue" | "guess" | "opposition" | "reveal" | "finished";
export type RoundResult = Round & {
  team: number;
  guess: number;
  prediction: Prediction;
  teamPoints: number;
  rivalPoints: number;
};
export type GameState = {
  teams: string[];
  rounds: Round[];
  roundIndex: number;
  phase: Phase;
  version: number;
  scores: number[];
  guess: number | null;
  prediction: Prediction | null;
  history: RoundResult[];
  confirmingExit: boolean;
};
export const ROUND_COUNTS = [6, 8, 10] as const;

const cleanName = (name: string) => name.normalize("NFKC").trim().replace(/\s+/g, " ");

export function validateSetup(teams: string[], rounds: number): string[] {
  const errors: string[] = [];
  const names = teams.map(cleanName);
  if (names.length !== 2) errors.push("Armen exactamente dos equipos.");
  if (names.some((name) => !name || name.length > 24)) errors.push("Cada equipo necesita un nombre de 1 a 24 caracteres.");
  if (new Set(names.map((name) => name.toLocaleLowerCase("es"))).size !== names.length) errors.push("Usen nombres distintos para los equipos.");
  if (!ROUND_COUNTS.includes(rounds as RoundCount)) errors.push("Elegí 6, 8 o 10 rondas.");
  return errors;
}

export function scoreGuess(target: number, guess: number): number {
  return Math.max(0, 4 - Math.abs(target - guess));
}

export function scorePrediction(target: number, guess: number, prediction: Prediction): number {
  if (prediction === "exact") return target === guess ? 2 : 0;
  return (prediction === "left" && target < guess) || (prediction === "right" && target > guess) ? 1 : 0;
}

export function createGame(teams: string[], count: RoundCount, random: () => number = Math.random): GameState {
  const errors = validateSetup(teams, count);
  if (errors.length) throw new Error(errors.join(" "));
  const axes = [...AXES];
  for (let index = axes.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [axes[index], axes[swap]] = [axes[swap], axes[index]];
  }
  return {
    teams: teams.map(cleanName),
    rounds: axes.slice(0, count).map((axis) => ({ axis: { ...axis }, target: 1 + Math.floor(random() * 9) })),
    roundIndex: 0,
    phase: "handoff",
    version: 0,
    scores: [0, 0],
    guess: null,
    prediction: null,
    history: [],
    confirmingExit: false,
  };
}

export type GameAction = { version: number } & (
  | { type: "open" | "hide" | "begin-guess" | "confirm-guess" | "reveal" | "next" | "request-exit" | "cancel-exit" }
  | { type: "select-guess"; position: number }
  | { type: "select-prediction"; prediction: Prediction }
);

export function advanceGame(state: GameState, action: GameAction): GameState {
  if (action.version !== state.version) return state;
  const change = (patch: Partial<GameState>): GameState => ({ ...state, ...patch, version: state.version + 1 });
  if (action.type === "cancel-exit") return state.confirmingExit ? change({ confirmingExit: false }) : state;
  if (state.confirmingExit || state.phase === "finished") return state;
  if (action.type === "request-exit") return change({ confirmingExit: true });
  if (action.type === "open" && state.phase === "handoff") return change({ phase: "private" });
  if (action.type === "hide" && state.phase === "private") return change({ phase: "clue" });
  if (action.type === "begin-guess" && state.phase === "clue") return change({ phase: "guess" });
  if (action.type === "select-guess" && state.phase === "guess" && Number.isInteger(action.position) && action.position >= 1 && action.position <= 9) {
    return change({ guess: action.position });
  }
  if (action.type === "confirm-guess" && state.phase === "guess" && state.guess !== null) return change({ phase: "opposition" });
  if (action.type === "select-prediction" && state.phase === "opposition" && ["left", "right", "exact"].includes(action.prediction)) {
    return change({ prediction: action.prediction });
  }
  if (action.type === "reveal" && state.phase === "opposition" && state.guess !== null && state.prediction !== null) {
    const round = state.rounds[state.roundIndex];
    const team = state.roundIndex % 2;
    const rival = 1 - team;
    const teamPoints = scoreGuess(round.target, state.guess);
    const rivalPoints = scorePrediction(round.target, state.guess, state.prediction);
    const scores = [...state.scores];
    scores[team] += teamPoints;
    scores[rival] += rivalPoints;
    return change({
      phase: "reveal",
      scores,
      history: [...state.history, { ...round, team, guess: state.guess, prediction: state.prediction, teamPoints, rivalPoints }],
    });
  }
  if (action.type === "next" && state.phase === "reveal") {
    if (state.roundIndex === state.rounds.length - 1) return change({ phase: "finished" });
    return change({ phase: "handoff", roundIndex: state.roundIndex + 1, guess: null, prediction: null });
  }
  return state;
}

export type GameView = {
  phase: Phase | "exit";
  version: number;
  teams: string[];
  scores: number[];
  round: number;
  totalRounds: number;
  activeTeam: number;
  rivalTeam: number;
  speakerTurn: number;
  axis?: Axis;
  target?: number;
  guess?: number | null;
  prediction?: Prediction | null;
  result?: RoundResult;
  history?: RoundResult[];
  winners?: number[];
};

// La UI recibe esta proyección; nunca recibe rondas futuras ni un objetivo oculto.
export function getView(state: GameState): GameView {
  const base: GameView = {
    phase: state.confirmingExit ? "exit" : state.phase,
    version: state.version,
    teams: [...state.teams],
    scores: [...state.scores],
    round: state.roundIndex + 1,
    totalRounds: state.rounds.length,
    activeTeam: state.roundIndex % 2,
    rivalTeam: 1 - state.roundIndex % 2,
    speakerTurn: Math.floor(state.roundIndex / 2) + 1,
  };
  if (state.confirmingExit || state.phase === "handoff") return base;
  if (state.phase === "finished") return {
    ...base,
    history: state.history.map((result) => ({ ...result, axis: { ...result.axis } })),
    winners: state.scores[0] === state.scores[1] ? [0, 1] : [state.scores[0] > state.scores[1] ? 0 : 1],
  };
  const round = state.rounds[state.roundIndex];
  return {
    ...base,
    axis: { ...round.axis },
    ...(state.phase === "private" || state.phase === "reveal" ? { target: round.target } : {}),
    ...(["guess", "opposition", "reveal"].includes(state.phase) ? { guess: state.guess } : {}),
    ...(["opposition", "reveal"].includes(state.phase) ? { prediction: state.prediction } : {}),
    ...(state.phase === "reveal" ? { result: { ...state.history[state.history.length - 1] } } : {}),
  };
}
