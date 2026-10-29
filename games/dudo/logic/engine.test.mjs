import assert from "node:assert/strict";
import test from "node:test";
import * as rules from "./engine.ts";

const names = ["Ana", "Beto"];
const hands = [[1, 1, 6], [1, 2, 3]];
const act = (state, type, extra = {}) => rules.advanceGame?.(state, { type, version: state?.version, ...extra });
const start = (laps = 1) => rules.createGame?.(names, laps, hands);
const bid = (state, quantity, face) => act(state, "bid", { bid: { quantity, face } });
const peek = (state) => act(state, "peek");

test("setup normalizes names and keeps everyone in a fixed number of rounds", () => {
  const state = rules.createGame?.([" Ana ", "Beto"], 2, hands);
  assert.deepEqual(state?.players, names);
  assert.equal(state?.roundCount, 4);
  assert.equal(state?.round, 1);
  assert.equal(state?.phase, "handoff");
  assert.deepEqual(state?.scores, [0, 0]);
});

test("empty, duplicate, long and out-of-range setup never starts", () => {
  for (const players of [["Ana"], ["Ana", " "], ["Ana", " ana "], ["a".repeat(25), "B"], Array.from({length: 9}, (_, i) => `P${i}`)]) {
    assert.ok(rules.validateSetup?.(players, 1)?.length > 0);
    assert.throws(() => rules.createGame?.(players, 1, hands));
  }
  assert.ok(rules.validateSetup?.(names, 3)?.length > 0);
  assert.deepEqual(rules.validateSetup?.(["Ana  Sol", "Beto"], 1), []);
  assert.ok(rules.validateSetup?.(["Ana  Sol", "ana sol"], 1)?.length > 0);
});

test("invalid dice are rejected instead of producing a broken private round", () => {
  for (const invalid of [[], [[1, 2, 3]], [[1, 2], [3, 4, 5]], [[0, 2, 3], [4, 5, 6]], [[1, 2, 7], [4, 5, 6]], [[1, 2, 2.5], [4, 5, 6]]]) {
    assert.throws(() => rules.createGame?.(names, 1, invalid));
  }
});

test("bids increase by face within a quantity or by quantity with any face", () => {
  const old = {quantity: 2, face: 4};
  for (const next of [{quantity: 2, face: 5}, {quantity: 3, face: 1}]) assert.equal(rules.isValidBid?.(next, old, 6), true);
  for (const next of [{quantity: 2, face: 4}, {quantity: 2, face: 3}, {quantity: 1, face: 6}, {quantity: 7, face: 1}, {quantity: 0, face: 1}, {quantity: 1.5, face: 2}, {quantity: 3, face: 7}, {quantity: 3, face: 0}]) assert.equal(rules.isValidBid?.(next, old, 6), false);
  assert.equal(rules.isValidBid?.({quantity: 1, face: 1}, null, 6), true);
  assert.deepEqual(rules.minimumBid?.(old, 6), {quantity: 2, face: 5});
  assert.deepEqual(rules.minimumBid?.({quantity: 2, face: 6}, 6), {quantity: 3, face: 1});
  assert.equal(rules.minimumBid?.({quantity: 6, face: 6}, 6), null);
});

test("the handoff exposes no dice and a private view only grants the active hand", () => {
  let state = start();
  assert.deepEqual(rules.privateHand?.(state, 0), []);
  assert.equal(rules.publicView?.(state)?.hands, undefined);
  state = peek(state);
  assert.deepEqual(rules.privateHand?.(state, 0), [1, 1, 6]);
  assert.deepEqual(rules.privateHand?.(state, 1), []);
  assert.equal(rules.publicView?.(state)?.hands, undefined);
  const copy = rules.privateHand?.(state, 0);
  copy?.fill(4);
  assert.deepEqual(rules.privateHand?.(state, 0), [1, 1, 6]);
  state = bid(state, 3, 1);
  assert.equal(state?.phase, "handoff");
  assert.equal(state?.active, 1);
  assert.deepEqual(rules.privateHand?.(state, 0), []);
  assert.equal(rules.publicView?.(state)?.hands, undefined);
});

test("actions in the wrong phase do not skip privacy or create a free challenge", () => {
  const initial = start();
  assert.ok(initial);
  for (const type of ["bid", "challenge", "next", "replay"]) assert.equal(act(initial, type, {bid:{quantity:1,face:1}, hands}), initial);
  const ready = peek(initial);
  assert.equal(act(ready, "challenge"), ready);
  assert.equal(peek(ready), ready);
  assert.equal(bid(ready, 7, 1), ready);
});

test("a true bid including an exact count awards the bidder and reveals every matching die", () => {
  let state = peek(bid(peek(start()), 3, 1));
  state = act(state, "challenge");
  assert.equal(state?.phase, "reveal");
  assert.deepEqual(state?.scores, [2, 0]);
  assert.equal(state?.results[0].actual, 3);
  assert.equal(state?.results[0].winner, 0);
  assert.equal(state?.results[0].challenger, 1);
  assert.equal(state?.results[0].held, true);
  assert.deepEqual(rules.publicView?.(state)?.hands, hands);
  assert.deepEqual(rules.privateHand?.(state, 1), []);
});

test("a false bid awards the challenger and ones are never wild", () => {
  let state = peek(bid(peek(start()), 2, 6));
  state = act(state, "challenge");
  assert.deepEqual(state?.scores, [0, 2]);
  assert.equal(state?.results[0].actual, 1);
  assert.equal(state?.results[0].winner, 1);
  assert.equal(state?.results[0].held, false);
  assert.equal(rules.countFace?.(hands, 2), 1);
});

test("raising transfers the bid and the maximum bid leaves only a challenge", () => {
  let state = bid(peek(start()), 1, 1);
  state = bid(peek(state), 6, 6);
  assert.equal(state?.bidder, 1);
  assert.equal(state?.active, 0);
  assert.equal(state?.bids.length, 2);
  const ready = peek(state);
  assert.equal(bid(ready, 6, 5), ready);
  assert.equal(rules.minimumBid?.(ready.bid, 6), null);
  state = act(ready, "challenge");
  assert.deepEqual(state?.scores, [2, 0]);
});

test("repeated taps and stale tokens cannot expose another hand, bid or score twice", () => {
  const initial = start();
  const action = {type: "peek", version: initial?.version};
  let state = rules.advanceGame?.(initial, action);
  assert.equal(rules.advanceGame?.(state, action), state);
  const offer = {type:"bid", version:state.version, bid:{quantity:3,face:1}};
  state = rules.advanceGame(state, offer);
  assert.equal(rules.advanceGame(state, offer), state);
  state = peek(state);
  const challenge = {type:"challenge", version:state.version};
  state = rules.advanceGame(state, challenge);
  assert.equal(rules.advanceGame(state, challenge), state);
  assert.deepEqual(state.scores, [2, 0]);
  const next = {type:"next",version:state.version,hands};
  state = rules.advanceGame(state, next);
  assert.equal(rules.advanceGame(state, next), state);
  assert.equal(rules.advanceGame(state, challenge), state);
  assert.equal(state.round, 2);
});

test("rounds rotate the opener, clear old bids, preserve scores and reject invalid deals", () => {
  let state = act(peek(bid(peek(start()), 3, 1)), "challenge");
  assert.equal(act(state, "next", {hands: []}), state);
  state = act(state, "next", {hands: [[6,6,6], [2,2,2]]});
  assert.equal(state?.active, 1);
  assert.equal(state?.opener, 1);
  assert.equal(state?.round, 2);
  assert.deepEqual(state?.bids, []);
  assert.equal(state?.bid, null);
  assert.deepEqual(state?.scores, [2, 0]);
  assert.equal(rules.publicView?.(state)?.hands, undefined);
});

test("a complete game can tie, ends only after the final reveal, and replays cleanly", () => {
  let state = start();
  state = act(peek(bid(peek(state), 3, 1)), "challenge");
  state = act(state, "next", {hands});
  state = act(peek(bid(peek(state), 3, 1)), "challenge");
  assert.equal(state.phase, "reveal");
  assert.deepEqual(state.scores, [2, 2]);
  state = act(state, "next");
  assert.equal(state.phase, "finished");
  assert.deepEqual(rules.winnerIndexes?.(state), [0, 1]);
  const stale = {type:"peek", version:state.version};
  for (const type of ["peek", "bid", "challenge", "next"]) assert.equal(act(state, type, {bid:{quantity:1,face:1},hands}), state);
  const replayed = act(state, "replay", {hands});
  assert.equal(replayed.round, 1);
  assert.equal(replayed.phase, "handoff");
  assert.deepEqual(replayed.scores, [0, 0]);
  assert.deepEqual(replayed.results, []);
  assert.equal(rules.advanceGame(replayed, stale), replayed);
  assert.equal(rules.publicView(replayed).hands, undefined);
});

test("all two-to-eight-person groups get exactly two opening turns without elimination", () => {
  for (let count = 2; count <= 8; count++) {
    const people = Array.from({length:count}, (_,i)=>`P${i}`);
    const dice = people.map(()=>[1,2,3]);
    let state = rules.createGame?.(people, 2, dice);
    const opened = Array(count).fill(0);
    for (let round=0; round<count*2; round++) {
      opened[state.opener]++;
      state=act(peek(bid(peek(state), 1, 1)), "challenge");
      state=act(state,"next",{hands:dice});
    }
    assert.equal(state.phase,"finished");
    assert.deepEqual(opened, Array(count).fill(2));
    assert.equal(state.players.length,count);
    assert.equal(state.results.length,count*2);
  }
});

test("generated deals use three independent dice per person with inclusive faces one through six", () => {
  const samples=[0, .999999, .5, .18, .34, .68];
  let i=0;
  assert.deepEqual(rules.rollHands?.(2,()=>samples[i++]), [[1,6,4], [2,3,5]]);
  assert.throws(()=>rules.rollHands?.(1,()=>0));
  assert.throws(()=>rules.rollHands?.(2,()=>1));
});
