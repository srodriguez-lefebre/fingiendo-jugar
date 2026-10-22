export type Category = "cotidiano" | "planes" | "dilemas";
export type Theme = Category | "all";
export type Choice = "a" | "b";
export type Prompt = { id: string; category: Category; question: string; a: string; b: string };
export type Ballot = { choice: Choice; prediction: number; double: boolean };
export type Player = { name: string; score: number; doubleUsed: boolean };
export type RoundResult = {
  prompt: Prompt;
  aCount: number;
  results: (Ballot & { name: string; points: number })[];
};
export type GameState = {
  players: Player[];
  deck: Prompt[];
  roundIndex: number;
  voterIndex: number;
  phase: "round" | "handoff" | "ballot" | "reveal" | "finished";
  ballots: (Ballot | null)[];
  history: RoundResult[];
};
export type GameAction =
  | { type: "begin"; roundIndex: number }
  | { type: "next"; roundIndex: number }
  | { type: "open"; roundIndex: number; voterIndex: number }
  | { type: "submit"; roundIndex: number; voterIndex: number; ballot: Ballot };

export function validateNames(names: string[]): string | null {
  if (names.length < 3 || names.length > 10) return "Necesitan entre 3 y 10 personas para jugar.";
  const trimmed = names.map((name) => name.trim());
  if (trimmed.some((name) => !name)) return "Completá el nombre de cada persona.";
  if (trimmed.some((name) => name.length > 24)) return "Usá nombres de hasta 24 caracteres.";
  const unique = new Set(trimmed.map((name) => name.normalize("NFC").toLocaleLowerCase("es")));
  if (unique.size !== names.length) return "Usá nombres distintos; podés agregar un apodo.";
  return null;
}

export function chooseDeck(prompts: Prompt[], rounds: number, theme: Theme, random = Math.random): Prompt[] {
  const pool = prompts.filter((prompt) => theme === "all" || prompt.category === theme);
  if (!Number.isInteger(rounds) || rounds < 1 || pool.length < rounds) {
    throw new Error("No hay suficientes dilemas para esa partida.");
  }
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, rounds);
}

export function createGame(names: string[], deck: Prompt[]): GameState {
  const error = validateNames(names);
  if (error || !deck.length) throw new Error(error ?? "Elegí un mazo con dilemas.");
  return {
    players: names.map((name) => ({ name: name.trim(), score: 0, doubleUsed: false })),
    deck: [...deck],
    roundIndex: 0,
    voterIndex: 0,
    phase: "round",
    ballots: names.map(() => null),
    history: [],
  };
}

export function scorePrediction(predicted: number, actual: number, double: boolean): number {
  const distance = Math.abs(predicted - actual);
  const points = distance === 0 ? 3 : distance === 1 ? 1 : 0;
  return points * (double ? 2 : 1);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (state.phase === "finished" || action.roundIndex !== state.roundIndex) return state;
  if (action.type === "begin") {
    return state.phase === "round" ? { ...state, phase: "handoff" } : state;
  }
  if (action.type === "next") {
    if (state.phase !== "reveal") return state;
    if (state.roundIndex === state.deck.length - 1) return { ...state, phase: "finished" };
    return {
      ...state,
      phase: "round",
      roundIndex: state.roundIndex + 1,
      voterIndex: 0,
      ballots: state.players.map(() => null),
    };
  }
  if (action.voterIndex !== state.voterIndex) return state;
  if (action.type === "open") return state.phase === "handoff" ? { ...state, phase: "ballot" } : state;
  if (state.phase !== "ballot") return state;

  const { ballot } = action;
  const player = state.players[state.voterIndex];
  const count = state.players.length;
  if (
    (ballot.choice !== "a" && ballot.choice !== "b") ||
    !Number.isInteger(ballot.prediction) ||
    ballot.prediction < (ballot.choice === "a" ? 1 : 0) ||
    ballot.prediction > (ballot.choice === "b" ? count - 1 : count) ||
    typeof ballot.double !== "boolean" ||
    (ballot.double && player.doubleUsed)
  ) return state;

  const ballots = [...state.ballots];
  ballots[state.voterIndex] = { ...ballot };
  if (state.voterIndex < count - 1) {
    return { ...state, ballots, voterIndex: state.voterIndex + 1, phase: "handoff" };
  }

  // All slots have a confirmed vote because only the current player can advance.
  const confirmed = ballots as Ballot[];
  const aCount = confirmed.filter((vote) => vote.choice === "a").length;
  const results = confirmed.map((vote, index) => ({
    ...vote,
    name: state.players[index].name,
    points: scorePrediction(vote.prediction, aCount, vote.double),
  }));
  return {
    ...state,
    ballots,
    phase: "reveal",
    history: [...state.history, { prompt: state.deck[state.roundIndex], aCount, results }],
    players: state.players.map((current, index) => ({
      ...current,
      score: current.score + results[index].points,
      doubleUsed: current.doubleUsed || confirmed[index].double,
    })),
  };
}

export function getWinners(state: GameState): Player[] {
  const top = Math.max(...state.players.map((player) => player.score));
  return state.players.filter((player) => player.score === top);
}
