import assert from "node:assert/strict";
import test from "node:test";

import { PROMPTS } from "../data.ts";
import { chooseDeck, createGame, gameReducer, getWinners, scorePrediction, validateNames } from "../logic.ts";

const names = ["Ana", "Beto", "Cami"];
const prompts = [
  { id: "one", category: "cotidiano", question: "¿Qué elegís?", a: "Uno", b: "Dos" },
  { id: "two", category: "planes", question: "¿Qué preferís?", a: "Tres", b: "Cuatro" },
];

function openRound(state) {
  return gameReducer(state, { type: "begin", roundIndex: state.roundIndex });
}

function cast(state, choice, prediction, double = false) {
  const token = { roundIndex: state.roundIndex, voterIndex: state.voterIndex };
  state = gameReducer(state, { type: "open", ...token });
  return gameReducer(state, { type: "submit", ...token, ballot: { choice, prediction, double } });
}

test("setup rejects missing, duplicate, oversized names and invalid group sizes", () => {
  assert.equal(validateNames(names), null);
  for (const invalid of [[], ["Ana", "Beto"], [...names, "  "], [" Ana ", "ana", "Beto"], ["é", "e\u0301", "Beto"], ["A".repeat(25), "B", "C"], Array(11).fill("A")]) {
    assert.equal(typeof validateNames(invalid), "string");
  }
});

test("starting trims names, clears points and refuses an empty deck", () => {
  const state = createGame([" Ana ", "Beto", "Cami"], prompts);
  assert.deepEqual(state.players.map((p) => [p.name, p.score, p.doubleUsed]), [["Ana", 0, false], ["Beto", 0, false], ["Cami", 0, false]]);
  assert.equal(state.phase, "round");
  assert.throws(() => createGame(names, []));
  assert.throws(() => createGame(["Ana"], prompts));
});

test("predictions award 3 exact, 1 adjacent and 0 otherwise; double multiplies earned points", () => {
  for (let actual = 0; actual <= 10; actual += 1) {
    for (let predicted = 0; predicted <= 10; predicted += 1) {
      const expected = predicted === actual ? 3 : Math.abs(predicted - actual) === 1 ? 1 : 0;
      assert.equal(scorePrediction(predicted, actual, false), expected);
      assert.equal(scorePrediction(predicted, actual, true), expected * 2);
    }
  }
});

test("local decks support every length without duplicate prompts or leaking another theme", () => {
  assert.equal(new Set(PROMPTS.map((p) => p.id)).size, PROMPTS.length);
  for (const theme of ["all", "cotidiano", "planes", "dilemas"]) {
    for (const length of [5, 8, 12]) {
      const deck = chooseDeck(PROMPTS, length, theme, () => 0.5);
      assert.equal(deck.length, length);
      assert.equal(new Set(deck.map((p) => p.id)).size, length);
      assert.ok(deck.every((p) => p.a.trim() && p.b.trim() && p.question.trim()));
      if (theme !== "all") assert.ok(deck.every((p) => p.category === theme));
    }
  }
  assert.throws(() => chooseDeck(prompts, 3, "all"));
  assert.throws(() => chooseDeck(PROMPTS, 0, "all"));
});

test("votes require private handoff and reject impossible predictions without advancing", () => {
  let state = createGame(names, prompts);
  const token = { roundIndex: 0, voterIndex: 0 };
  const vote = { type: "submit", ...token, ballot: { choice: "a", prediction: 2, double: false } };
  assert.equal(gameReducer(state, vote), state);
  state = openRound(state);
  assert.equal(gameReducer(state, vote), state);
  state = gameReducer(state, { type: "open", ...token });
  for (const ballot of [
    { choice: "a", prediction: 0, double: false },
    { choice: "b", prediction: 3, double: false },
    { choice: "a", prediction: 1.5, double: false },
    { choice: "b", prediction: -1, double: false },
    { choice: "a", prediction: NaN, double: false },
    { choice: "c", prediction: 2, double: false },
  ]) assert.equal(gameReducer(state, { ...vote, ballot }), state);
  state = gameReducer(state, vote);
  assert.equal(state.phase, "handoff");
  assert.equal(state.voterIndex, 1);
  assert.equal(state.players[0].score, 0);
});

test("final vote reveals complete results and awards points only once", () => {
  let state = openRound(createGame(names, prompts));
  state = cast(state, "a", 2, true);
  state = cast(state, "b", 1);
  const token = { roundIndex: 0, voterIndex: 2 };
  state = cast(state, "a", 1);
  assert.equal(state.phase, "reveal");
  assert.equal(state.history[0].aCount, 2);
  assert.deepEqual(state.players.map((p) => p.score), [6, 1, 1]);
  assert.deepEqual(state.history[0].results.map((p) => p.points), [6, 1, 1]);
  assert.equal(state.players[0].doubleUsed, true);
  assert.equal(gameReducer(state, { type: "submit", ...token, ballot: { choice: "a", prediction: 2, double: true } }), state);
});

test("old action tokens cannot skip a player or consume the next round", () => {
  let state = openRound(createGame(names, prompts));
  const first = { type: "submit", roundIndex: 0, voterIndex: 0, ballot: { choice: "b", prediction: 0, double: false } };
  state = gameReducer(state, { type: "open", roundIndex: 0, voterIndex: 0 });
  state = gameReducer(state, first);
  assert.equal(gameReducer(state, first), state);
  assert.equal(gameReducer(state, { type: "open", roundIndex: 0, voterIndex: 0 }), state);
  state = cast(state, "b", 0);
  state = cast(state, "b", 0);
  const next = { type: "next", roundIndex: 0 };
  state = gameReducer(state, next);
  assert.equal(state.phase, "round");
  assert.equal(state.roundIndex, 1);
  assert.equal(gameReducer(state, next), state);
  assert.equal(gameReducer(state, { type: "begin", roundIndex: 0 }), state);
  assert.ok(state.ballots.every((ballot) => ballot === null));
});

test("the double is spent even after missing and cannot be reused", () => {
  let state = openRound(createGame(names, prompts));
  state = cast(state, "a", 3, true);
  state = cast(state, "b", 0);
  state = cast(state, "b", 0);
  assert.equal(state.players[0].score, 0);
  assert.equal(state.players[0].doubleUsed, true);
  state = openRound(gameReducer(state, { type: "next", roundIndex: 0 }));
  state = gameReducer(state, { type: "open", roundIndex: 1, voterIndex: 0 });
  const vote = { type: "submit", roundIndex: 1, voterIndex: 0, ballot: { choice: "a", prediction: 1, double: true } };
  assert.equal(gameReducer(state, vote), state);
  state = gameReducer(state, { ...vote, ballot: { ...vote.ballot, double: false } });
  assert.equal(state.voterIndex, 1);
});

test("a complete game finishes on the last reveal, preserves shared winners and ignores later actions", () => {
  let state = createGame(names, prompts);
  for (let round = 0; round < 2; round += 1) {
    state = openRound(state);
    for (let person = 0; person < 3; person += 1) state = cast(state, "b", 0);
    state = gameReducer(state, { type: "next", roundIndex: round });
  }
  assert.equal(state.phase, "finished");
  assert.equal(state.history.length, 2);
  assert.deepEqual(state.players.map((p) => p.score), [6, 6, 6]);
  assert.deepEqual(getWinners(state).map((p) => p.name), names);
  for (const type of ["begin", "open", "next", "submit"]) assert.equal(gameReducer(state, { type, roundIndex: 1, voterIndex: 2, ballot: { choice: "a", prediction: 3, double: true } }), state);
  assert.deepEqual(getWinners(createGame(names, prompts)).map((p) => p.name), names);
});
