export type Face = 1 | 2 | 3 | 4 | 5 | 6;
export type Laps = 1 | 2;
export type Bid = { quantity: number; face: Face };
export type BidRecord = Bid & { player: number };
export type RoundResult = {
  round: number;
  bid: Bid;
  bidder: number;
  challenger: number;
  winner: number;
  actual: number;
  held: boolean;
};
export type GameState = {
  players: string[];
  laps: Laps;
  roundCount: number;
  round: number;
  opener: number;
  active: number;
  phase: "handoff" | "turn" | "reveal" | "finished";
  hands: Face[][];
  scores: number[];
  bid: Bid | null;
  bidder: number | null;
  bids: BidRecord[];
  results: RoundResult[];
  version: number;
};
export type GameAction =
  | { type: "peek" | "challenge"; version: number }
  | { type: "bid"; version: number; bid: Bid }
  | { type: "next" | "replay"; version: number; hands?: Face[][] };

const cleanName = (name: string) => name.normalize("NFKC").trim().replace(/\s+/g, " ");

export function validateSetup(players: string[], laps: number): string[] {
  const errors: string[] = [];
  if (players.length < 2 || players.length > 8) errors.push("Juegan de 2 a 8 personas.");
  const names = players.map(cleanName);
  if (names.some((name) => !name)) errors.push("Completá todos los nombres o apodos.");
  if (names.some((name) => name.length > 24)) errors.push("Usá nombres de hasta 24 caracteres.");
  if (new Set(names.map((name) => name.toLocaleLowerCase("es"))).size !== names.length) errors.push("Usen apodos distintos para reconocer los turnos.");
  if (laps !== 1 && laps !== 2) errors.push("Elegí una o dos vueltas.");
  return errors;
}

function validHands(hands: Face[][] | undefined, count: number): hands is Face[][] {
  return Array.isArray(hands) && hands.length === count && hands.every((hand) => Array.isArray(hand) && hand.length === 3 && hand.every((face) => Number.isInteger(face) && face >= 1 && face <= 6));
}

export function rollHands(count: number, random: () => number = Math.random): Face[][] {
  if (!Number.isInteger(count) || count < 2 || count > 8) throw new Error("Grupo inválido.");
  return Array.from({ length: count }, () => Array.from({ length: 3 }, () => {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error("Azar fuera de rango.");
    return (Math.floor(value * 6) + 1) as Face;
  }));
}

export function createGame(players: string[], laps: Laps, hands: Face[][]): GameState {
  if (validateSetup(players, laps).length || !validHands(hands, players.length)) throw new Error("No se puede iniciar esta mesa.");
  return {
    players: players.map(cleanName), laps, roundCount: players.length * laps,
    round: 1, opener: 0, active: 0, phase: "handoff",
    hands: hands.map((hand) => [...hand]), scores: players.map(() => 0),
    bid: null, bidder: null, bids: [], results: [], version: 0,
  };
}

export function isValidBid(bid: Bid, previous: Bid | null, totalDice: number): boolean {
  if (!Number.isInteger(bid.quantity) || bid.quantity < 1 || bid.quantity > totalDice || !Number.isInteger(bid.face) || bid.face < 1 || bid.face > 6) return false;
  return previous === null || bid.quantity > previous.quantity || (bid.quantity === previous.quantity && bid.face > previous.face);
}

export function minimumBid(previous: Bid | null, totalDice: number): Bid | null {
  if (!previous) return { quantity: 1, face: 1 };
  if (previous.face < 6) return { quantity: previous.quantity, face: (previous.face + 1) as Face };
  return previous.quantity < totalDice ? { quantity: previous.quantity + 1, face: 1 } : null;
}

export function countFace(hands: Face[][], face: Face): number {
  return hands.reduce((sum, hand) => sum + hand.filter((die) => die === face).length, 0);
}

export function advanceGame(state: GameState, action: GameAction): GameState {
  if (action.version !== state.version) return state;
  const version = state.version + 1;
  if (action.type === "peek" && state.phase === "handoff") return { ...state, phase: "turn", version };
  if (action.type === "bid" && state.phase === "turn" && isValidBid(action.bid, state.bid, state.players.length * 3)) {
    return {
      ...state, bid: { ...action.bid }, bidder: state.active,
      bids: [...state.bids, { ...action.bid, player: state.active }],
      active: (state.active + 1) % state.players.length, phase: "handoff", version,
    };
  }
  if (action.type === "challenge" && state.phase === "turn" && state.bid && state.bidder !== null) {
    const actual = countFace(state.hands, state.bid.face);
    const held = actual >= state.bid.quantity;
    const winner = held ? state.bidder : state.active;
    const result: RoundResult = { round: state.round, bid: { ...state.bid }, bidder: state.bidder, challenger: state.active, winner, actual, held };
    return {
      ...state, phase: "reveal", version,
      scores: state.scores.map((score, index) => score + (index === winner ? 2 : 0)),
      results: [...state.results, result],
    };
  }
  if (action.type === "next" && state.phase === "reveal") {
    if (state.round === state.roundCount) return { ...state, phase: "finished", version };
    if (!validHands(action.hands, state.players.length)) return state;
    const opener = state.round % state.players.length;
    return {
      ...state, round: state.round + 1, opener, active: opener, phase: "handoff", version,
      hands: action.hands.map((hand) => [...hand]), bid: null, bidder: null, bids: [],
    };
  }
  if (action.type === "replay" && state.phase === "finished" && validHands(action.hands, state.players.length)) {
    return { ...createGame(state.players, state.laps, action.hands), version };
  }
  return state;
}

// The shared table never receives private hands until the challenge is settled.
export function publicView(state: GameState) {
  const { hands, ...view } = state;
  return { ...view, ...(state.phase === "reveal" ? { hands: hands.map((hand) => [...hand]) } : {}) };
}

export type PublicView = ReturnType<typeof publicView>;

export function privateHand(state: GameState, player: number): Face[] {
  return state.phase === "turn" && player === state.active ? [...state.hands[player]] : [];
}

export function winnerIndexes(state: Pick<GameState, "scores">): number[] {
  const highest = Math.max(...state.scores);
  return state.scores.flatMap((score, index) => score === highest ? [index] : []);
}
