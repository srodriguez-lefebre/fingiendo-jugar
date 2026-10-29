import assert from "node:assert/strict";
import test from "node:test";

import * as rules from "./engine.ts";

const teams = ["Las antenas", "La frecuencia"];

test("only two distinct named teams and 6, 8 or 10 rounds can start", () => {
  for (const [names, rounds] of [[[], 6], [["A"], 6], [["A", "B", "C"], 6], [[" ", "B"], 6], [["A", " a "], 6], [["A".repeat(25), "B"], 6], [teams, 7], [teams, 0]]) {
    assert.ok(rules.validateSetup?.(names, rounds)?.length > 0);
  }
  assert.deepEqual(rules.validateSetup?.([" A ", "B"], 8), []);
  assert.throws(() => rules.createGame?.(["", "B"], 6, () => 0));
});

test("distance awards 4, 3, 2, 1 then zero in either direction", () => {
  for (const [target, guess, points] of [[5, 5, 4], [5, 4, 3], [5, 6, 3], [5, 3, 2], [5, 7, 2], [5, 2, 1], [5, 8, 1], [5, 1, 0], [5, 9, 0], [1, 9, 0], [9, 1, 0]]) {
    assert.equal(rules.scoreGuess?.(target, guess), points);
  }
});

test("opposition scores one for the true side, two for exact and zero otherwise", () => {
  for (const [target, guess, prediction, points] of [[2, 5, "left", 1], [8, 5, "right", 1], [5, 5, "exact", 2], [2, 5, "right", 0], [8, 5, "left", 0], [5, 5, "left", 0], [5, 5, "right", 0], [4, 5, "exact", 0]]) {
    assert.equal(rules.scorePrediction?.(target, guess, prediction), points);
  }
});

test("local axes supply different valid continuums without repetition in any match", () => {
  assert.ok(rules.AXES?.length >= 40);
  assert.equal(new Set(rules.AXES.map((axis) => axis.id)).size, rules.AXES.length);
  assert.equal(new Set(rules.AXES.map((axis) => [axis.left, axis.right].sort().join("/"))).size, rules.AXES.length);
  for (const random of [() => 0, () => 0.5, () => 0.999999]) {
    for (const count of [6, 8, 10]) {
      const state = rules.createGame?.(teams, count, random);
      assert.equal(state?.rounds.length, count);
      assert.equal(new Set(state?.rounds.map((round) => round.axis.id)).size, count);
      assert.ok(state?.rounds.every((round) => Number.isInteger(round.target) && round.target >= 1 && round.target <= 9));
    }
  }
});

const act = (state, type, extra = {}) => rules.advanceGame?.(state, { type, version: state?.version, ...extra });
const start = (count = 6) => rules.createGame(teams, count, () => 0.5);
const readyToGuess = () => act(act(act(start(), "open"), "hide"), "begin-guess");

test("private target is absent from every handoff, clue, guess and opposition view", () => {
  let state = start();
  assert.equal(rules.getView?.(state)?.phase, "handoff");
  for (const action of [null, "open", "hide", "begin-guess", "select-guess", "confirm-guess"]) {
    if (action) state = act(state, action, { position: 4 });
    const view = rules.getView?.(state);
    assert.ok(view);
    assert.equal("rounds" in view, false);
    assert.equal("history" in view, false);
    assert.equal("target" in view, view.phase === "private");
    if (view.phase === "private") assert.equal(view.target, 5);
  }
  assert.equal(state.phase, "opposition");
});

test("selection is required and out-of-range or fractional positions cannot be locked", () => {
  let state = readyToGuess();
  assert.equal(state?.phase, "guess");
  assert.equal(act(state, "confirm-guess"), state);
  for (const position of [0, 10, -1, 1.5, NaN, Infinity, "5"]) assert.equal(act(state, "select-guess", { position }), state);
  state = act(state, "select-guess", { position: 9 });
  assert.equal(state.guess, 9);
  state = act(state, "confirm-guess");
  assert.equal(state.phase, "opposition");
  assert.equal(act(state, "reveal"), state);
  assert.equal(act(state, "select-prediction", { prediction: "up" }), state);
});

test("reveal awards both teams once after a locked guess and a rival prediction", () => {
  let state = act(readyToGuess(), "select-guess", { position: 4 });
  state = act(state, "confirm-guess");
  state = act(state, "select-prediction", { prediction: "right" });
  const reveal = { type: "reveal", version: state.version };
  state = rules.advanceGame(state, reveal);
  assert.equal(state.phase, "reveal");
  assert.deepEqual(state.scores, [3, 1]);
  assert.equal(state.history.length, 1);
  assert.equal(rules.getView(state).target, 5);
  assert.equal(rules.getView(state).result.teamPoints, 3);
  assert.equal(rules.advanceGame(state, reveal), state);
  assert.equal(act(state, "reveal"), state);
});

test("stale actions and wrong-phase actions cannot skip people, rounds or points", () => {
  let state = start();
  for (const type of ["hide", "begin-guess", "select-guess", "confirm-guess", "select-prediction", "reveal", "next"]) {
    assert.equal(act(state, type, { position: 5, prediction: "exact" }), state);
  }
  const open = { type: "open", version: state.version };
  state = rules.advanceGame(state, open);
  assert.equal(rules.advanceGame(state, open), state);
  assert.equal(state.phase, "private");
  state = act(act(state, "hide"), "begin-guess");
  const choose = { type: "select-guess", position: 2, version: state.version };
  state = rules.advanceGame(state, choose);
  assert.equal(rules.advanceGame(state, choose), state);
  state = act(state, "confirm-guess");
  assert.equal(act(state, "select-guess", { position: 7 }), state);
  assert.equal(state.guess, 2);
});

test("canceling exit preserves the guess and opposition drafts while hiding all play content", () => {
  let state = act(readyToGuess(), "select-guess", { position: 7 });
  for (const phase of ["guess", "opposition"]) {
    if (phase === "opposition") state = act(act(state, "confirm-guess"), "select-prediction", { prediction: "left" });
    state = act(state, "request-exit");
    const view = rules.getView(state);
    assert.equal(view.phase, "exit");
    for (const key of ["target", "axis", "guess", "prediction", "result", "history"]) assert.equal(key in view, false);
    assert.equal(act(state, "reveal"), state);
    state = act(state, "cancel-exit");
    assert.equal(state.phase, phase);
    assert.equal(state.guess, 7);
    if (phase === "opposition") assert.equal(state.prediction, "left");
  }
});

test("exit from the private screen hides its secret and cancel restores that same target", () => {
  let state = act(start(), "open");
  state = act(state, "request-exit");
  assert.equal("target" in rules.getView(state), false);
  state = act(state, "cancel-exit");
  assert.equal(rules.getView(state).target, 5);
});

test("all even match lengths alternate teams and speaker turns, clear drafts and finish honestly", () => {
  for (const count of [6, 8, 10]) {
    let state = start(count);
    for (let index = 0; index < count; index++) {
      const view = rules.getView?.(state);
      assert.equal(view?.activeTeam, index % 2);
      assert.equal(view?.speakerTurn, Math.floor(index / 2) + 1);
      assert.equal(state.guess, null);
      assert.equal(state.prediction, null);
      state = act(act(act(state, "open"), "hide"), "begin-guess");
      state = act(act(state, "select-guess", { position: 5 }), "confirm-guess");
      state = act(act(state, "select-prediction", { prediction: "exact" }), "reveal");
      assert.equal(state.history.length, index + 1);
      const next = { type: "next", version: state.version };
      state = rules.advanceGame(state, next);
      assert.equal(rules.advanceGame(state, next), state);
    }
    assert.equal(state.phase, "finished");
    assert.deepEqual(state.scores, count === 6 ? [18, 18] : count === 8 ? [24, 24] : [30, 30]);
    assert.deepEqual(rules.getView(state).winners, [0, 1]);
    assert.equal(rules.getView(state).history.length, count);
    for (const type of ["open", "hide", "begin-guess", "select-guess", "confirm-guess", "reveal", "next"]) assert.equal(act(state, type, { position: 5 }), state);
    const rematch = rules.createGame(state.teams, count, () => 0);
    assert.equal(rematch.phase, "handoff");
    assert.deepEqual(rematch.scores, [0, 0]);
    assert.deepEqual(rematch.history, []);
    assert.equal(rematch.guess, null);
  }
});

test("a winner is decided by both proximity and opposition points without early stopping", () => {
  let state = start();
  for (let index = 0; index < 6; index++) {
    state = act(act(act(state, "open"), "hide"), "begin-guess");
    state = act(act(state, "select-guess", { position: index % 2 === 0 ? 5 : 1 }), "confirm-guess");
    state = act(act(state, "select-prediction", { prediction: "left" }), "reveal");
    assert.equal(state.phase, "reveal");
    state = act(state, "next");
  }
  assert.deepEqual(state.scores, [12, 0]);
  assert.deepEqual(rules.getView(state).winners, [0]);
});
