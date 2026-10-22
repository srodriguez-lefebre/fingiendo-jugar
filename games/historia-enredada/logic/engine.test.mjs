import assert from "node:assert/strict";
import test from "node:test";

import { STORY_STYLES, TWISTS, WORDS } from "../data/content.ts";

import {
  countWords,
  createChallenges,
  createGame,
  transition,
  validateLine,
  validateSetup,
} from "./engine.ts";

const setup = {
  names: [" Ana ", "Beto"],
  rounds: 2,
  style: { id: "misterio", title: "Misterio de barrio", premise: "La llave desapareció." },
};
const challenges = [
  { word: "llave", twist: "Presentá al protagonista." },
  { word: "robot", twist: "Aparece una visita." },
  { word: "sartén", twist: "Cambia el plan." },
  { word: "mate", twist: "Cerrá la historia." },
];
const line = "La llave apareció debajo del sillón.";

test("rechaza nombres vacíos, repetidos y grupos fuera de 2–8", () => {
  assert.equal(validateSetup(["Ana", "Beto"], 2), null);
  for (const names of [["Ana"], ["Ana", " "], ["Ana", " aNA "], Array(9).fill("Persona")]) {
    assert.equal(typeof validateSetup(names, 2), "string");
  }
  assert.equal(typeof validateSetup(["a".repeat(25), "Beto"], 2), "string");
});

test("solo acepta dos o tres rondas completas", () => {
  assert.equal(validateSetup(["Ana", "Beto"], 3), null);
  for (const rounds of [0, 1, 2.5, 4, NaN]) {
    assert.equal(typeof validateSetup(["Ana", "Beto"], rounds), "string");
  }
});

test("cuenta palabras con puntuación y letras de otros idiomas", () => {
  assert.equal(countWords("¡Hola, año! café… naïve 世界"), 5);
  assert.equal(countWords("   123 --- 😃 "), 0);
  assert.equal(countWords("Cafe\u0301 junto al robot, de noche."), 6);
});

test("las tildes sueltas no cuentan como palabras ni habilitan una frase incompleta", () => {
  assert.equal(countWords("\u0301 \u0308"), 0);
  assert.equal(typeof validateLine("llave \u0301 \u0301 \u0301 \u0301", "llave"), "string");
});

test("acepta la palabra completa con mayúsculas y tildes distintas", () => {
  assert.equal(validateLine("La SARTEN apareció misteriosamente bajo la mesa.", "sartén"), null);
  assert.equal(validateLine("Vimos una sartén, justo al llegar.", "sartén"), null);
  assert.equal(validateLine("La cafe\u0301 escondía un gran secreto.", "café"), null);
});

test("rechaza fragmentos, plurales y cambios de ñ por n", () => {
  for (const [text, word] of [
    ["La puerta del llavero estaba abierta.", "llave"],
    ["Las llaves quedaron sobre la mesa.", "llave"],
    ["Ese ano todo era muy extraño.", "año"],
  ]) assert.equal(typeof validateLine(text, word), "string");
});

test("rechaza frases demasiado cortas, largas o sin letras", () => {
  assert.equal(typeof validateLine("La llave apareció.", "llave"), "string");
  assert.equal(typeof validateLine(`llave ${"hola ".repeat(30)}`, "llave"), "string");
  assert.equal(typeof validateLine("😃 1 2 3 llave", "llave"), "string");
  assert.equal(typeof validateLine(`llave ${"a".repeat(360)} b c d`, "llave"), "string");
  assert.equal(validateLine("Una llave cayó junto a mí.", "llave"), null);
  assert.equal(validateLine(`llave ${"hola ".repeat(29)}`, "llave"), null);
});

test("sortea sin reemplazo y reserva apertura y cierre", () => {
  const words = ["uno", "dos", "tres", "cuatro", "cinco"];
  const twists = ["A", "B", "C"];
  const result = createChallenges(5, words, twists, () => 0);
  assert.equal(result.length, 5);
  assert.equal(new Set(result.map((challenge) => challenge.word)).size, 5);
  assert.equal(new Set(result.slice(1, -1).map((challenge) => challenge.twist)).size, 3);
  assert.match(result[0].twist, /protagonista/i);
  assert.match(result[4].twist, /cerrá/i);
  assert.deepEqual(words, ["uno", "dos", "tres", "cuatro", "cinco"]);
  assert.deepEqual(twists, ["A", "B", "C"]);
});

test("contenido insuficiente o turnos inválidos impiden crear el mazo", () => {
  assert.equal(createChallenges(4, ["a", "b"], ["A", "B"], () => 0), null);
  assert.equal(createChallenges(5, ["a", "b", "c", "d", "e"], ["A"], () => 0), null);
  assert.equal(createChallenges(2.5, ["a", "b", "c"], ["A"], () => 0), null);
});

test("la partida empieza en entrega, recorta el mazo y normaliza nombres", () => {
  const game = createGame(setup, [...challenges, { word: "extra", twist: "Extra" }]);
  assert.equal(game.phase, "handoff");
  assert.equal(game.turn, 0);
  assert.deepEqual(game.players, ["Ana", "Beto"]);
  assert.equal(game.challenges.length, 4);
  assert.deepEqual(game.contributions, []);
  assert.equal(createGame(setup, challenges.slice(0, 3)), null);
  assert.equal(createGame({ ...setup, names: ["Ana", ""] }, challenges), null);
});

test("no se puede escribir ni pasar antes de recibir el celular", () => {
  const game = createGame(setup, challenges);
  assert.strictEqual(transition(game, { type: "submit", turn: 0, text: line }), game);
  assert.strictEqual(transition(game, { type: "skip", turn: 0 }), game);
  assert.strictEqual(transition(game, { type: "begin", turn: 3 }), game);
  assert.equal(transition(game, { type: "begin", turn: 0 }).phase, "writing");
});

test("una frase inválida conserva el turno sin sumar nada", () => {
  const writing = transition(createGame(setup, challenges), { type: "begin", turn: 0 });
  assert.strictEqual(transition(writing, { type: "submit", turn: 0, text: "Una llave." }), writing);
  assert.strictEqual(transition(writing, { type: "submit", turn: 0, text: "La puerta se abrió de golpe." }), writing);
});

test("una frase válida conserva autor y palabra y pasa al siguiente jugador", () => {
  const writing = transition(createGame(setup, challenges), { type: "begin", turn: 0 });
  const next = transition(writing, { type: "submit", turn: 0, text: `  ${line}  ` });
  assert.equal(next.phase, "handoff");
  assert.equal(next.turn, 1);
  assert.deepEqual(next.contributions, [{ playerIndex: 0, text: line, word: "llave", skipped: false }]);
  assert.deepEqual(writing.contributions, []);
});

test("clics repetidos y acciones tardías no agregan turnos ni frases", () => {
  const writing = transition(createGame(setup, challenges), { type: "begin", turn: 0 });
  const next = transition(writing, { type: "submit", turn: 0, text: line });
  const nextWriting = transition(next, { type: "begin", turn: 1 });
  assert.strictEqual(transition(next, { type: "submit", turn: 0, text: line }), next);
  assert.strictEqual(transition(nextWriting, { type: "skip", turn: 0 }), nextWriting);
  assert.strictEqual(transition(writing, { type: "begin", turn: 0 }), writing);
});

test("pasar consume exactamente un turno y no inventa una frase", () => {
  const writing = transition(createGame(setup, challenges), { type: "begin", turn: 0 });
  const next = transition(writing, { type: "skip", turn: 0 });
  assert.equal(next.turn, 1);
  assert.deepEqual(next.contributions, [{ playerIndex: 0, text: "", word: "llave", skipped: true }]);
});

test("dos rondas rotan equitativamente y terminan justo después del último turno", () => {
  let game = createGame(setup, challenges);
  for (let turn = 0; turn < 4; turn++) {
    game = transition(game, { type: "begin", turn });
    game = transition(game, { type: "skip", turn });
    assert.equal(game.phase, turn === 3 ? "finished" : "handoff");
  }
  assert.deepEqual(game.contributions.map((entry) => entry.playerIndex), [0, 1, 0, 1]);
  assert.equal(game.turn, 4);
  assert.strictEqual(transition(game, { type: "begin", turn: 4 }), game);
  assert.strictEqual(transition(game, { type: "skip", turn: 4 }), game);
  assert.strictEqual(transition(game, { type: "submit", turn: 4, text: line }), game);
});

test("una historia nueva no conserva las frases de la anterior", () => {
  const writing = transition(createGame(setup, challenges), { type: "begin", turn: 0 });
  const previous = transition(writing, { type: "submit", turn: 0, text: line });
  const restarted = createGame(setup, challenges);
  assert.equal(previous.contributions.length, 1);
  assert.equal(restarted.contributions.length, 0);
  assert.equal(restarted.turn, 0);
});

test("el contenido local permite cerrar 24 turnos sin repeticiones en cada ambiente", () => {
  for (const style of STORY_STYLES) {
    const deck = createChallenges(24, WORDS, TWISTS, () => 0.5);
    assert.equal(deck.length, 24);
    assert.equal(new Set(deck.map((challenge) => challenge.word)).size, 24);
    assert.equal(new Set(deck.map((challenge) => challenge.twist)).size, 24);
    let game = createGame({ names: ["A", "B", "C", "D", "E", "F", "G", "H"], rounds: 3, style }, deck);
    for (let turn = 0; turn < 24; turn++) {
      game = transition(game, { type: "begin", turn });
      game = transition(game, { type: "submit", turn, text: `La ${deck[turn].word} apareció junto a la puerta.` });
    }
    assert.equal(game.phase, "finished");
    assert.equal(game.contributions.filter((entry) => !entry.skipped).length, 24);
    for (let player = 0; player < 8; player++) {
      assert.equal(game.contributions.filter((entry) => entry.playerIndex === player).length, 3);
    }
  }
});
