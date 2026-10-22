export type StoryStyle = { id: string; title: string; premise: string };
export type Challenge = { word: string; twist: string };
export type Setup = { names: string[]; rounds: number; style: StoryStyle };
export type Contribution = {
  playerIndex: number;
  text: string;
  word: string;
  skipped: boolean;
};
export type StoryGame = {
  phase: "handoff" | "writing" | "finished";
  players: string[];
  rounds: number;
  style: StoryStyle;
  challenges: Challenge[];
  turn: number;
  contributions: Contribution[];
};
export type Action =
  | { type: "begin"; turn: number }
  | { type: "submit"; turn: number; text: string }
  | { type: "skip"; turn: number };

export function validateSetup(names: string[], rounds: number): string | null {
  if (names.length < 2 || names.length > 8) return "Necesitan entre 2 y 8 personas.";
  if (rounds !== 2 && rounds !== 3) return "Elegí 2 o 3 rondas.";
  const trimmed = names.map((name) => name.trim());
  if (trimmed.some((name) => name.length === 0)) return "Completá todos los nombres.";
  if (trimmed.some((name) => name.length > 24)) return "Usá nombres de hasta 24 caracteres.";
  if (new Set(trimmed.map((name) => name.toLocaleLowerCase("es"))).size !== names.length) {
    return "Usá nombres distintos para reconocer cada turno.";
  }
  return null;
}

function wordsIn(text: string): string[] {
  return text.match(/\p{L}[\p{L}\p{M}]*/gu) ?? [];
}

function normalizeWord(word: string): string {
  return word.toLocaleLowerCase("es").normalize("NFD")
    .replace(/n\u0303/g, "ñ").replace(/\p{M}/gu, "");
}

export function countWords(text: string): number {
  return wordsIn(text).length;
}

export function validateLine(text: string, requiredWord: string): string | null {
  if (text.trim().length > 360) return "Acortá la frase a 360 caracteres.";
  const words = wordsIn(text);
  if (words.length < 5 || words.length > 30) return "Escribí entre 5 y 30 palabras.";
  if (!words.some((word) => normalizeWord(word) === normalizeWord(requiredWord))) {
    return `Incluí la palabra «${requiredWord}» completa, tal como aparece.`;
  }
  return null;
}

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function createChallenges(
  turns: number,
  words: readonly string[],
  twists: readonly string[],
  random: () => number = Math.random,
): Challenge[] | null {
  if (!Number.isInteger(turns) || turns < 2 || turns > words.length || turns - 2 > twists.length) return null;
  const selectedWords = shuffled(words, random).slice(0, turns);
  const selectedTwists = shuffled(twists, random).slice(0, turns - 2);
  return selectedWords.map((word, index) => ({
    word,
    twist: index === 0
      ? "Presentá al protagonista y metelo en un problema."
      : index === turns - 1
        ? "Cerrá la historia y resolvé el problema principal."
        : selectedTwists[index - 1],
  }));
}

export function createGame(setup: Setup, challenges: readonly Challenge[]): StoryGame | null {
  const turns = setup.names.length * setup.rounds;
  if (validateSetup(setup.names, setup.rounds) || challenges.length < turns) return null;
  return {
    phase: "handoff",
    players: setup.names.map((name) => name.trim()),
    rounds: setup.rounds,
    style: { ...setup.style },
    challenges: challenges.slice(0, turns).map((challenge) => ({ ...challenge })),
    turn: 0,
    contributions: [],
  };
}

export function transition(state: StoryGame, action: Action): StoryGame {
  if (state.phase === "finished" || action.turn !== state.turn) return state;
  if (action.type === "begin") {
    return state.phase === "handoff" ? { ...state, phase: "writing" } : state;
  }
  if (state.phase !== "writing") return state;
  const challenge = state.challenges[state.turn];
  if (action.type === "submit" && validateLine(action.text, challenge.word)) return state;
  const nextTurn = state.turn + 1;
  return {
    ...state,
    phase: nextTurn === state.challenges.length ? "finished" : "handoff",
    turn: nextTurn,
    contributions: [...state.contributions, {
      playerIndex: state.turn % state.players.length,
      text: action.type === "submit" ? action.text.trim() : "",
      word: challenge.word,
      skipped: action.type === "skip",
    }],
  };
}
