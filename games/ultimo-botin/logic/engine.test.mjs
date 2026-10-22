import assert from "node:assert/strict";
import test from "node:test";

import * as rules from "./engine.ts";

const gold = (value) => ({ kind: "treasure", value });
const hazard = (danger) => ({ kind: "hazard", danger });
const crew = ["Ana", "Beto"];

test("starts a cooperative expedition with trimmed names and protected empty score", () => {
  const state = rules.createGame?.([" Ana ", " Beto "], 3, [gold(3)]);
  assert.equal(state?.phase, "exploring");
  assert.deepEqual(state?.players, crew);
  assert.equal(state?.target, 40);
  assert.equal(state?.total, 0);
  assert.equal(state?.pending, 0);
  assert.equal(state?.ropeAvailable, true);
  assert.equal(state?.expedition, 1);
});

test("rejects empty, repeated, oversized and out-of-range crew setup", () => {
  for (const names of [["Ana"], ["Ana", " "], ["Ana", " ana "], ["a".repeat(25), "Beto"], Array(9).fill("A")]) {
    assert.ok(rules.validateSetup?.(names, 3)?.length > 0);
  }
  assert.ok(rules.validateSetup?.(crew, 4)?.length > 0);
  assert.deepEqual(rules.validateSetup?.(crew, 5), []);
});

test("invalid setup cannot start a game", () => {
  assert.throws(() => rules.createGame?.(["Ana", ""], 3, [gold(3)]));
});

function act(state, type, extra = {}) {
  return rules.advanceGame?.(state, { type, version: state?.version, ...extra });
}

test("treasure remains at risk until the group banks it", () => {
  let state = rules.createGame(crew, 3, [gold(3), gold(5), hazard("niebla")]);
  state = act(act(state, "explore"), "explore");
  assert.equal(state?.pending, 8);
  assert.equal(state?.total, 0);
  assert.equal(state?.phase, "exploring");
  state = act(state, "bank");
  assert.equal(state?.pending, 0);
  assert.equal(state?.total, 8);
  assert.equal(state?.results[0].gold, 8);
  assert.equal(state?.results[0].outcome, "banked");
});

test("only a repeated danger causes an accident and preserves the rescue decision", () => {
  let state = rules.createGame(crew, 3, [gold(9), hazard("grieta"), hazard("niebla"), hazard("grieta")]);
  state = act(act(act(state, "explore"), "explore"), "explore");
  assert.equal(state?.phase, "exploring");
  assert.equal(state?.pending, 9);
  state = act(state, "explore");
  assert.equal(state?.phase, "accident");
  assert.equal(state?.pending, 9);
  assert.equal(state?.total, 0);
  assert.equal(state?.results.length, 0);
});

test("abandoning an accident keeps the previously secured treasure", () => {
  let state = rules.createGame(crew, 3, [gold(7), hazard("niebla")]);
  state = act(act(state, "explore"), "bank");
  state = act(state, "next", { deck: [gold(9), hazard("grieta"), hazard("grieta")] });
  state = act(act(act(state, "explore"), "explore"), "explore");
  state = act(state, "abandon");
  assert.equal(state?.total, 7);
  assert.equal(state?.pending, 0);
  assert.equal(state?.results[1].gold, 0);
  assert.equal(state?.results[1].outcome, "lost");
  assert.equal(state?.ropeAvailable, true);
});

test("one rope rescues half rounded down and stays spent in later expeditions", () => {
  let state = rules.createGame(crew, 3, [gold(9), hazard("grieta"), hazard("grieta")]);
  state = act(act(act(state, "explore"), "explore"), "explore");
  state = act(state, "rescue");
  assert.equal(state?.total, 4);
  assert.equal(state?.ropeAvailable, false);
  assert.equal(state?.results[0].outcome, "rescued");
  state = act(state, "next", { deck: [gold(7), hazard("niebla"), hazard("niebla")] });
  state = act(act(act(state, "explore"), "explore"), "explore");
  assert.equal(act(state, "rescue"), state);
});

test("rope cannot be wasted when the pending treasure is too small to rescue", () => {
  let state = rules.createGame(crew, 3, [hazard("niebla"), hazard("niebla")]);
  state = act(act(state, "explore"), "explore");
  assert.equal(state?.phase, "accident");
  assert.equal(act(state, "rescue"), state);
  assert.equal(state?.ropeAvailable, true);
});

test("next-step risk counts only repeats among the remaining findings", () => {
  let state = rules.createGame(crew, 3, [hazard("grieta"), gold(3), hazard("grieta"), hazard("niebla")]);
  assert.deepEqual(rules.getRisk?.(state), { dangerous: 0, remaining: 4 });
  state = act(state, "explore");
  assert.deepEqual(rules.getRisk?.(state), { dangerous: 1, remaining: 3 });
});

test("exhausting a safe route banks it automatically", () => {
  const state = act(rules.createGame(crew, 3, [gold(7)]), "explore");
  assert.equal(state?.phase, "summary");
  assert.equal(state?.total, 7);
  assert.equal(state?.results[0].outcome, "exhausted");
  assert.deepEqual(rules.getRisk?.(state), { dangerous: 0, remaining: 0 });
});

test("a new expedition rotates captain and clears pending findings and warnings", () => {
  let state = rules.createGame(crew, 5, [gold(3), hazard("grieta"), gold(7)]);
  state = act(act(act(state, "explore"), "explore"), "bank");
  state = act(state, "next", { deck: [gold(5)] });
  assert.equal(state?.expedition, 2);
  assert.equal(state?.phase, "exploring");
  assert.equal(state?.total, 3);
  assert.equal(state?.pending, 0);
  assert.deepEqual(state?.dangers, []);
  assert.deepEqual(state?.revealed, []);
  state = act(state, "explore");
  assert.equal(state?.results[1].captain, "Beto");
});

test("repeated taps with a stale version cannot draw twice or score twice", () => {
  const initial = rules.createGame(crew, 3, [gold(3), gold(5)]);
  const draw = { type: "explore", version: initial.version };
  const drawn = rules.advanceGame?.(initial, draw);
  assert.equal(rules.advanceGame?.(drawn, draw), drawn);
  assert.equal(drawn?.revealed.length, 1);
  const bank = { type: "bank", version: drawn?.version };
  const banked = rules.advanceGame?.(drawn, bank);
  assert.equal(rules.advanceGame?.(banked, bank), banked);
  assert.equal(banked?.total, 3);
});

test("out-of-phase actions cannot skip expeditions or spend the rope", () => {
  const state = rules.createGame(crew, 3, [gold(3)]);
  for (const type of ["next", "rescue", "abandon", "bank"]) {
    assert.equal(act(state, type, { deck: [gold(9)] }), state);
  }
});

test("the last expedition finishes exactly once with an honest group result", () => {
  let state = rules.createGame(crew, 3, [gold(7)]);
  for (let expedition = 1; expedition <= 3; expedition++) {
    state = act(state, "explore");
    if (expedition < 3) state = act(state, "next", { deck: [gold(7)] });
  }
  assert.equal(state?.phase, "finished");
  assert.equal(state?.total, 21);
  assert.equal(state?.results.length, 3);
  assert.equal(state?.total >= state?.target, false);
  for (const type of ["next", "explore", "bank", "rescue", "abandon"]) {
    assert.equal(act(state, type, { deck: [gold(9)] }), state);
  }
});

test("reaching the objective early still plays all configured expeditions", () => {
  let state = rules.createGame(crew, 3, [gold(9), gold(9), gold(9)]);
  state = act(act(act(state, "explore"), "explore"), "explore");
  state = act(state, "next", { deck: [gold(9), gold(9)] });
  state = act(act(state, "explore"), "explore");
  assert.equal(state?.total, 45);
  assert.equal(state?.phase, "summary");
  state = act(state, "next", { deck: [gold(3)] });
  state = act(state, "explore");
  assert.equal(state?.phase, "finished");
  assert.equal(state?.total >= state?.target, true);
});

test("each shuffled route contains every treasure and two copies of each danger", () => {
  const deck = rules.shuffleDeck?.(() => 0);
  assert.equal(deck?.length, 18);
  assert.equal(deck?.filter((finding) => finding.kind === "treasure").length, 12);
  assert.equal(deck?.filter((finding) => finding.kind === "treasure").reduce((sum, finding) => sum + finding.value, 0), 65);
  for (const danger of ["grieta", "derrumbe", "niebla"]) {
    assert.equal(deck?.filter((finding) => finding.kind === "hazard" && finding.danger === danger).length, 2);
  }
});
