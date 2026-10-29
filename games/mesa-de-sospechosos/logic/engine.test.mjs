import assert from "node:assert/strict";
import test from "node:test";
import * as rules from "./engine.ts";

test("interprets the clues literally on a line, without wrapping its ends", () => {
  const order = ["a", "b", "c", "d"];
  const examples = [
    [{ kind: "before", a: "a", b: "c" }, true],
    [{ kind: "before", a: "d", b: "a" }, false],
    [{ kind: "adjacent", a: "a", b: "b" }, true],
    [{ kind: "adjacent", a: "a", b: "d" }, false],
    [{ kind: "apart", a: "a", b: "d", distance: 3 }, true],
    [{ kind: "apart", a: "a", b: "c", distance: 1 }, false],
    [{ kind: "between", a: "b", b: "d", c: "a" }, true],
    [{ kind: "between", a: "d", b: "a", c: "c" }, false],
    [{ kind: "notSeat", a: "a", seat: 0 }, false],
    [{ kind: "at", a: "b", seat: 1 }, true],
    [{ kind: "before", a: "missing", b: "a" }, false],
  ];
  for (const [clue, expected] of examples) assert.equal(rules.matchesClue?.(order, clue), expected);
});

test("finds every solution and caps enumeration at six distinct people", () => {
  assert.equal(rules.enumerateOrders?.(["a", "b", "c", "d", "e", "f"])?.length, 720);
  assert.deepEqual(rules.solveOrders?.(["a", "b", "c"], [
    { kind: "before", a: "a", b: "b" },
    { kind: "before", a: "b", b: "c" },
  ]), [["a", "b", "c"]]);
  assert.equal(rules.solveOrders?.(["a", "b", "c"], [{ kind: "adjacent", a: "a", b: "b" }])?.length, 4);
  for (const ids of [[], ["a", "a"], [""], ["a", "b", "c", "d", "e", "f", "g"]]) {
    assert.throws(() => rules.enumerateOrders?.(ids));
  }
});

test("600 seeded cases have one verifiable solution and no redundant clues", () => {
  for (const difficulty of ["primer-caso", "detectives", "mesa-experta"]) {
    for (let seed = 0; seed < 200; seed++) {
      const puzzle = rules.generateCase?.(seed, difficulty);
      assert.ok(puzzle, "a case is generated");
      const ids = puzzle.people.map((person) => person.id);
      assert.equal(ids.length, difficulty === "primer-caso" ? 4 : difficulty === "detectives" ? 5 : 6);
      assert.equal(new Set(ids).size, ids.length);
      assert.equal(new Set(puzzle.people.map((person) => person.name)).size, ids.length);
      const solutions = rules.solveOrders(ids, puzzle.clues);
      assert.deepEqual(solutions, [puzzle.solution], `${difficulty} seed ${seed}`);
      for (const clue of puzzle.clues) assert.equal(rules.matchesClue(puzzle.solution, clue), true);
      assert.ok(puzzle.clues.filter((clue) => clue.kind === "at").length <= 1, "the beginner case still requires deduction");
      for (let i = 0; i < puzzle.clues.length; i++) {
        assert.ok(rules.solveOrders(ids, puzzle.clues.filter((_, j) => j !== i)).length > 1);
      }
      assert.notDeepEqual(puzzle.initialOrder, puzzle.solution);
      assert.deepEqual([...puzzle.initialOrder].sort(), [...ids].sort());
    }
  }
});

function act(state, type, extra = {}) {
  return rules.advanceGame?.(state, { type, caseSeed: state?.puzzle.seed, version: state?.version, ...extra });
}

function arrange(state, target) {
  for (let i = 0; i < target.length; i++) {
    if (state.order[i] !== target[i]) state = act(state, "swap", { from: i, to: state.order.indexOf(target[i]) });
  }
  return state;
}

test("starts with a valid unsolved board and guards swaps, stale and duplicate actions", () => {
  let state = rules.createGame?.(77, "detectives");
  assert.equal(state?.phase, "playing");
  assert.equal(state?.attempts, 0);
  assert.equal(rules.getScore?.(state), 100);
  const initial = state;
  for (const pair of [[0, 0], [-1, 0], [0, 5], [0.5, 2]]) assert.equal(act(state, "swap", { from: pair[0], to: pair[1] }), initial);
  const action = { type: "swap", from: 0, to: 1, caseSeed: state.puzzle.seed, version: state.version };
  state = rules.advanceGame(state, action);
  assert.equal(state.order[0], initial.order[1]);
  assert.equal(state.order[1], initial.order[0]);
  assert.deepEqual(initial.order, initial.puzzle.initialOrder, "the old state is immutable");
  assert.equal(rules.advanceGame(state, action), state);
  assert.equal(act(state, "check", { version: -1 }), state);
});

test("a mistaken check reports unmet clues and costs one attempt only for each order", () => {
  let state = rules.createGame?.(16, "primer-caso");
  assert.ok(state);
  state = act(state, "check");
  assert.equal(state.attempts, 1);
  assert.equal(state.phase, "playing");
  assert.ok(state.feedback.violations > 0);
  assert.equal(rules.getScore(state), 90);
  assert.equal(act(state, "check"), state);
  const checked = state.order.slice();
  state = act(state, "swap", { from: 0, to: 1 });
  state = arrange(state, checked);
  assert.equal(act(state, "check"), state, "moving away and back cannot spend another check");
});

test("hints reveal distinct useful seats, cost points, and stop at two", () => {
  let state = rules.createGame?.(4, "primer-caso");
  assert.ok(state);
  state = act(state, "hint");
  const first = state.hints[0];
  assert.equal(state.puzzle.solution[first.seat], first.a);
  assert.equal(rules.getScore(state), 85);
  assert.ok(!state.puzzle.clues.some((clue) => clue.kind === "at" && clue.a === first.a));
  const duplicate = { type: "hint", caseSeed: state.puzzle.seed, version: state.version };
  state = rules.advanceGame(state, duplicate);
  assert.equal(state.hints.length, 2);
  assert.notEqual(state.hints[0].a, state.hints[1].a);
  assert.equal(rules.getScore(state), 70);
  assert.equal(rules.advanceGame(state, duplicate), state);
  assert.equal(act(state, "hint"), state);
});

test("a correct third check wins with earned score and rejects every late action", () => {
  let state = rules.createGame?.(8, "detectives");
  assert.ok(state);
  const wrongs = rules.enumerateOrders(state.order).filter((order) => order.join() !== state.puzzle.solution.join());
  for (const order of wrongs.slice(0, 2)) state = act(arrange(state, order), "check");
  state = act(state, "hint");
  state = act(arrange(state, state.puzzle.solution), "check");
  assert.equal(state.phase, "solved");
  assert.equal(state.attempts, 3);
  assert.equal(rules.getScore(state), 65);
  for (const type of ["check", "hint", "reveal", "swap"]) assert.equal(act(state, type, { from: 0, to: 1 }), state);
});

test("three distinct mistakes end the case honestly and a rematch resets all progress", () => {
  let state = rules.createGame?.(11, "mesa-experta");
  assert.ok(state);
  const wrongs = rules.enumerateOrders(state.order).filter((order) => order.join() !== state.puzzle.solution.join());
  for (const order of wrongs.slice(0, 3)) state = act(arrange(state, order), "check");
  assert.equal(state.phase, "lost");
  assert.equal(state.attempts, 3);
  assert.equal(rules.getScore(state), 0);
  assert.equal(act(state, "hint"), state);
  const fresh = rules.createGame(12, state.puzzle.difficulty);
  assert.equal(fresh.attempts, 0);
  assert.deepEqual(fresh.hints, []);
  assert.deepEqual(fresh.checkedOrders, []);
  assert.equal(fresh.feedback, null);
  assert.equal(rules.advanceGame(fresh, { type: "hint", caseSeed: state.puzzle.seed, version: fresh.version }), fresh);
});

test("revealing ends the case without claiming a win or changing the group's board", () => {
  const state = rules.createGame?.(32, "detectives");
  assert.ok(state);
  const ended = act(state, "reveal");
  assert.equal(ended.phase, "revealed");
  assert.deepEqual(ended.order, state.order);
  assert.equal(rules.getScore(ended), 0);
  assert.equal(act(ended, "check"), ended);
});

test("reproduces cases from seeds and rejects invalid setup instead of retrying", () => {
  assert.deepEqual(rules.generateCase?.(77, "detectives"), rules.generateCase?.(77, "detectives"));
  assert.notDeepEqual(rules.generateCase?.(77, "detectives"), rules.generateCase?.(78, "detectives"));
  assert.throws(() => rules.generateCase?.(NaN, "detectives"));
  assert.throws(() => rules.generateCase?.(5, "invalid"));
});
