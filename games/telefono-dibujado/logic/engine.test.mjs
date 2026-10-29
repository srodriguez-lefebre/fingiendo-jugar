import assert from 'node:assert/strict';
import test from 'node:test';
import { PROMPTS, choosePrompts } from '../data/prompts.ts';
import {
  MAX_POINTS, MAX_STROKES, addStroke, appendStrokePoint, finishPointerStroke, createGame, gameReducer,
  getGallery, getTurn, normalizePoint, sanitizeDrawing, sanitizeStroke,
  undoStroke, validateNames,
} from './engine.ts';

const prompts = ['Un mate en la luna', 'Una paloma chef', 'Un fantasma en patines'];
const stroke = { color: '#25233a', width: 8, points: [[100, 100], [300, 300]] };
const token = (game) => ({ sessionId: game.sessionId, chainIndex: game.chainIndex, turnIndex: game.turnIndex });
const open = (game) => gameReducer(game, { type: 'open', ...token(game) });
const deliver = (game) => gameReducer(game, { type: 'submit', ...token(game), entry: getTurn(game).mode === 'drawing' ? { kind: 'drawing', strokes: [stroke] } : { kind: 'text', text: 'Una nueva interpretación' } });

test('setup rejects empty, duplicate and out-of-range groups and trims names', () => {
  for (const names of [[], ['Ana'], ['Ana', ' '], ['Ána', ' ana '], Array(9).fill('a'), ['x'.repeat(25), 'Leo']]) assert.ok(validateNames(names));
  assert.equal(validateNames(['Ana', 'Leo']), null);
  assert.deepEqual(createGame([' Ana ', 'Leo'], prompts.slice(0, 1), 'one').names, ['Ana', 'Leo']);
  assert.throws(() => createGame(['Ana'], prompts, 'bad'));
  assert.throws(() => createGame(['Ana', 'Leo'], [], 'bad'));
  assert.throws(() => createGame(['Ana', 'Leo'], Array(4).fill('idea'), 'bad'));
});

test('handoff and exit selectors never disclose previous entries; only the current delivery is exposed', () => {
  let game = createGame(['Ana', 'Leo', 'Sol'], prompts, 'privacy');
  assert.equal(getTurn(game).previous, undefined);
  assert.deepEqual(getGallery(game), []);
  game = open(game);
  assert.equal(getTurn(game).previous.text, prompts[0]);
  game = deliver(game);
  assert.equal(getTurn(game).previous, undefined);
  game = open(game);
  assert.equal(getTurn(game).previous.kind, 'drawing');
  assert.equal(JSON.stringify(getTurn(game)).includes(prompts[0]), false);
  game = deliver(game);
  game = open(game);
  assert.equal(getTurn(game).previous.kind, 'text');
  assert.equal(getTurn(game).previous.text, 'Una nueva interpretación');
});

test('every person contributes once per chain and beginning rotates for 2 through 8 people', () => {
  for (let n = 2; n <= 8; n++) {
    const names = Array.from({ length: n }, (_, i) => `Persona ${i}`);
    let game = createGame(names, prompts, `rotation${n}`);
    for (let chain = 0; chain < 3; chain++) {
      const players = [];
      for (let turn = 0; turn < n; turn++) {
        game = open(game);
        const view = getTurn(game);
        assert.equal(view.playerIndex, (chain + turn) % n);
        assert.equal(view.mode, turn % 2 ? 'text' : 'drawing');
        players.push(view.playerIndex);
        game = deliver(game);
      }
      assert.equal(new Set(players).size, n);
    }
    assert.equal(game.phase, 'finished');
    assert.equal(getGallery(game).length, 3);
    assert.ok(getGallery(game).every((chain) => chain.length === n + 1));
  }
});

test('empty or wrong deliveries cannot advance and passes are explicit entries', () => {
  let game = open(createGame(['Ana', 'Leo'], [prompts[0]], 'empty'));
  for (const entry of [{ kind: 'text', text: 'No' }, { kind: 'drawing', strokes: [] }, { kind: 'drawing', strokes: [{ ...stroke, points: [] }] }]) {
    assert.equal(gameReducer(game, { type: 'submit', ...token(game), entry }), game);
  }
  game = gameReducer(game, { type: 'pass', ...token(game) });
  game = open(game);
  assert.equal(getTurn(game).previous.kind, 'pass');
  assert.equal(getTurn(game).previous.expected, 'drawing');
  assert.equal(gameReducer(game, { type: 'submit', ...token(game), entry: { kind: 'text', text: '   ' } }), game);
  game = gameReducer(game, { type: 'pass', ...token(game) });
  assert.equal(game.phase, 'finished');
  assert.equal(getGallery(game)[0][2].expected, 'text');
});

test('double clicks, stale turn and previous-session actions are inert, including after finish', () => {
  let game = createGame(['Ana', 'Leo'], [prompts[0]], 'stale');
  const action = { type: 'open', ...token(game) };
  game = gameReducer(game, action);
  assert.equal(gameReducer(game, action), game);
  const submit = { type: 'submit', ...token(game), entry: { kind: 'drawing', strokes: [stroke] } };
  game = gameReducer(game, submit);
  assert.equal(gameReducer(game, submit), game);
  assert.equal(gameReducer(game, { type: 'pass', ...token(game), sessionId: 'old' }), game);
  game = deliver(open(game));
  assert.equal(gameReducer(game, { type: 'pass', ...token(game) }), game);
  const rematch = createGame(game.names, [prompts[1]], 'new');
  assert.equal(rematch.turnIndex, 0);
  assert.equal(getGallery(rematch).length, 0);
  assert.equal(gameReducer(rematch, action), rematch);
});

test('normalization is resize independent, bounded and rejects nonfinite input', () => {
  assert.deepEqual(normalizePoint(50, 25, 100, 50), [500, 350]);
  assert.deepEqual(normalizePoint(100, 50, 200, 100), [500, 350]);
  assert.deepEqual(normalizePoint(-50, 200, 100, 100), [0, 700]);
  for (const args of [[NaN, 1, 1, 1], [1, Infinity, 1, 1], [1, 1, 0, 1]]) assert.equal(normalizePoint(...args), null);
});

test('compact drawing limits retain endpoints, valid palette and undo without mutating input', () => {
  const points = Array.from({ length: MAX_POINTS * 4 }, (_, i) => [i, i]);
  const compact = sanitizeStroke({ color: 'bad', width: 900, points });
  assert.equal(compact.points.length, MAX_POINTS);
  assert.deepEqual(compact.points[0], [0, 0]);
  assert.deepEqual(compact.points.at(-1), [Math.min(points.length - 1, 1000), Math.min(points.length - 1, 700)]);
  assert.equal(compact.color, '#25233a');
  assert.equal(compact.width, 8);
  assert.equal(sanitizeStroke({ ...stroke, points: [[NaN, 10]] }), null);
  const drawing = sanitizeDrawing(Array(MAX_STROKES + 5).fill(stroke));
  assert.equal(drawing.length, MAX_STROKES);
  assert.equal(addStroke(drawing, stroke), drawing);
  const removed = undoStroke(drawing);
  assert.equal(removed.length, MAX_STROKES - 1);
  assert.equal(drawing.length, MAX_STROKES);
  assert.deepEqual(undoStroke([]), []);
  const added = addStroke([], stroke);
  assert.equal(added.length, 1);
  assert.notEqual(added[0], stroke);
});

test('submitted data is copied, trimmed and capped so later draft changes do not edit history', () => {
  let game = open(createGame(['Ana', 'Leo'], [prompts[0]], 'copy'));
  const mutable = { ...stroke, points: [[20, 30], [40, 50]] };
  game = gameReducer(game, { type: 'submit', ...token(game), entry: { kind: 'drawing', strokes: [mutable] } });
  mutable.points[0][0] = 900;
  game = open(game);
  assert.deepEqual(getTurn(game).previous.strokes[0].points[0], [20, 30]);
  game = gameReducer(game, { type: 'submit', ...token(game), entry: { kind: 'text', text: `  ${'a'.repeat(240)}  ` } });
  assert.equal(getGallery(game)[0].at(-1).text.length, 120);
});

test('original local deck supplies distinct prompts for every supported chain count', () => {
  assert.ok(PROMPTS.length >= 30);
  assert.equal(new Set(PROMPTS).size, PROMPTS.length);
  for (const count of [1, 2, 3]) {
    for (const random of [() => 0, () => .5, () => .999999]) {
      const selected = choosePrompts(count, random);
      assert.equal(selected.length, count);
      assert.equal(new Set(selected).size, count);
      assert.ok(selected.every((prompt) => PROMPTS.includes(prompt)));
    }
  }
});

test('streaming a long circle preserves the whole curve and endpoints under the live point cap', () => {
  const circle = Array.from({ length: 721 }, (_, i) => [Math.round(500 + 250 * Math.cos(i * Math.PI / 360)), Math.round(350 + 250 * Math.sin(i * Math.PI / 360))]);
  let live = { ...stroke, points: [circle[0]] };
  for (const point of circle.slice(1)) {
    live = appendStrokePoint(live, point);
    assert.ok(live.points.length <= MAX_POINTS, 'active samples remain bounded at every event');
  }
  assert.deepEqual(live.points[0], circle[0]);
  assert.deepEqual(live.points.at(-1), circle.at(-1));
  const xs = live.points.map(([x]) => x);
  const ys = live.points.map(([, y]) => y);
  assert.ok(Math.min(...xs) <= 255, 'left arc is retained after the final append');
  assert.ok(Math.max(...xs) >= 745, 'right arc is retained');
  assert.ok(Math.min(...ys) <= 105 && Math.max(...ys) >= 595, 'top and bottom arcs are retained');
  for (const [x, y] of circle) {
    assert.ok(live.points.some(([a, b]) => Math.hypot(x - a, y - b) < 30), 'the entire original circle remains represented, not just its recent end');
  }
});

test('capture loss from an ignored second finger cannot end the first stroke or keyboard pen', () => {
  let active = { index: 0, pointer: 11 };
  let drawing = { ...stroke, points: [[100, 100]] };
  active = finishPointerStroke(active, 22);
  assert.ok(active, 'second touch capture loss keeps the drawing finger active');
  if (active.pointer === 11) drawing = appendStrokePoint(drawing, [150, 160]);
  assert.deepEqual(drawing.points.at(-1), [150, 160]);
  const saved = drawing.points;
  active = finishPointerStroke(active, 11);
  assert.equal(active, null);
  assert.equal(drawing.points, saved, 'matching cancel ends capture without dropping committed points');
  const keyboard = { index: 0, pointer: 'keyboard' };
  assert.equal(finishPointerStroke(keyboard, 22), keyboard);
  assert.equal(finishPointerStroke(null, 22), null);
});

test('streaming simplification preserves sharp collinear reversals and rejects bad pointer coordinates', () => {
  const path = [
    ...Array.from({ length: 501 }, (_, i) => [i * 2, 200]),
    ...Array.from({ length: 451 }, (_, i) => [1000 - i * 2, 200]),
    ...Array.from({ length: 201 }, (_, i) => [100, 200 + i * 2]),
  ];
  let live = { ...stroke, points: [path[0]] };
  for (const point of path.slice(1)) live = appendStrokePoint(live, point);
  assert.ok(live.points.length <= MAX_POINTS);
  assert.deepEqual(live.points[0], [0, 200]);
  assert.deepEqual(live.points.at(-1), [100, 600]);
  assert.ok(live.points.some(([x, y]) => x === 1000 && y === 200), 'the hairpin tip must not be mistaken for a straight line');
  assert.ok(live.points.some(([x, y]) => x === 100 && y === 200), 'the corner after the reversal remains');
  assert.equal(appendStrokePoint(live, [NaN, 50]), live);
  assert.equal(appendStrokePoint(live, [100, 600]), live);
});
