"use client";

import Link from "next/link";
import { ArrowLeft, Check, RotateCcw, Settings, X } from "lucide-react";
import { useState } from "react";

const DEFAULT_RULES: readonly string[] = [
  "Das 1 trago a alguien",
  "Das 2 tragos",
  "Imitar",
  "Put4",
  "Barquito",
  "Izquierda",
  "Derecha",
  "Historia",
  "Yo nunca",
  "Regla nueva",
  "Aplastas la carta, último toma",
  "Pregunta",
];

const SUITS = ["oros", "copas", "espadas", "bastos"] as const;
type Suit = (typeof SUITS)[number];

type Card = { value: number; suit: Suit };
type Phase = "config" | "playing" | "ended";

const TOTAL_CARDS = 48;

function buildDeck(): Card[] {
  const cards: Card[] = [];

  for (const suit of SUITS) {
    for (let value = 1; value <= 12; value++) {
      cards.push({ value, suit });
    }
  }

  return shuffle(cards);
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function LaPutitaGame() {
  const [phase, setPhase] = useState<Phase>("config");
  const [rules, setRules] = useState<string[]>([...DEFAULT_RULES]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [cardIndex, setCardIndex] = useState(-1);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const currentCard = cardIndex >= 0 ? deck[cardIndex] : null;
  const cardsDrawn = cardIndex + 1;
  const rulesModified = rules.some((rule, i) => rule !== DEFAULT_RULES[i]);

  function startGame() {
    setDeck(buildDeck());
    setCardIndex(-1);
    setPhase("playing");
  }

  function drawCard() {
    const nextIndex = cardIndex + 1;

    if (nextIndex >= TOTAL_CARDS) {
      setPhase("ended");
      return;
    }

    setCardIndex(nextIndex);
  }

  function restartGame() {
    setDeck(buildDeck());
    setCardIndex(-1);
    setPhase("playing");
  }

  function goToConfig() {
    setDeck([]);
    setCardIndex(-1);
    setPhase("config");
  }

  function startEditRule(index: number) {
    setEditingIndex(index);
    setEditingValue(rules[index]);
  }

  function saveRule() {
    if (editingIndex === null) return;
    const trimmed = editingValue.trim();

    if (trimmed) {
      setRules((prev) => prev.map((rule, i) => (i === editingIndex ? trimmed : rule)));
    }

    setEditingIndex(null);
    setEditingValue("");
  }

  function cancelEdit() {
    setEditingIndex(null);
    setEditingValue("");
  }

  // — Config phase —
  if (phase === "config") {
    return (
      <main className="putita-shell">
        <Link href="/" className="back-link">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Inicio
        </Link>

        <div className="putita-panel">
          <div className="putita-heading">
            <p className="putita-kicker">Un mazo, doce reglas</p>
            <h1>La Put*ta</h1>
          </div>

          <p className="putita-lead">
            Estas son las reglas por número. Tocá cualquiera para editarla.
          </p>

          <div className="putita-rules-config">
            {rules.map((rule, index) => (
              <div className="putita-rule-row" key={index}>
                <span className="putita-rule-num">{index + 1}</span>

                {editingIndex === index ? (
                  <div className="putita-rule-edit">
                    <input
                      autoFocus
                      aria-label={`Editar regla ${editingIndex !== null ? editingIndex + 1 : ""}`}
                      value={editingValue}
                      maxLength={60}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={saveRule}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveRule();
                        if (e.key === "Escape") cancelEdit();
                      }}
                    />
                    <button
                      type="button"
                      aria-label="Guardar"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={saveRule}
                    >
                      <Check size={15} strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      aria-label="Cancelar"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={cancelEdit}
                    >
                      <X size={15} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <button
                    className="putita-rule-btn"
                    type="button"
                    onClick={() => startEditRule(index)}
                  >
                    {rule}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="putita-start-row">
            {rulesModified && (
              <button
                className="putita-text-btn"
                type="button"
                onClick={() => setRules([...DEFAULT_RULES])}
              >
                <RotateCcw size={14} strokeWidth={2.5} />
                Restaurar default
              </button>
            )}
            <button className="putita-primary-btn" type="button" onClick={startGame}>
              Empezar partida
            </button>
          </div>
        </div>
      </main>
    );
  }

  // — Ended phase —
  if (phase === "ended") {
    return (
      <main className="putita-shell">
        <button
          className="putita-back-btn"
          type="button"
          onClick={goToConfig}
          aria-label="Volver a configuración"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
        </button>

        <div className="putita-panel putita-panel--center">
          <p className="putita-kicker">Fin del mazo</p>
          <h1>¡Se acabó!</h1>
          <p className="putita-copy">Se terminaron las 48 cartas. ¿Qué hacemos?</p>
          <div className="putita-end-actions">
            <button className="putita-primary-btn" type="button" onClick={restartGame}>
              <RotateCcw size={17} strokeWidth={2.4} />
              Volver a jugar
            </button>
            <button className="putita-secondary-btn" type="button" onClick={goToConfig}>
              <Settings size={17} strokeWidth={2.4} />
              Cambiar reglas
            </button>
          </div>
        </div>
      </main>
    );
  }

  // — Playing phase —
  return (
    <main className="putita-shell">
      <div className="putita-top-bar">
        <button
          className="putita-back-btn"
          type="button"
          onClick={goToConfig}
          aria-label="Volver a configuración"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
        </button>
        <span className="putita-progress">
          {cardsDrawn} / {TOTAL_CARDS}
        </span>
        <div aria-hidden />
      </div>

      <div className="putita-game-layout">
        <div className="putita-play-area">
          {currentCard === null ? (
            <button
              className="putita-deck"
              type="button"
              onClick={drawCard}
              aria-label="Robar primera carta"
            >
              <div className="putita-deck-stack" aria-hidden />
              <div className="putita-deck-stack" aria-hidden />
              <div className="putita-deck-top">
                <span>Tocá para empezar</span>
              </div>
            </button>
          ) : (
            <div className="putita-card" role="status" aria-live="polite">
              <div className="putita-card-suit" aria-hidden>
                {currentCard.suit}
              </div>
              <div className="putita-card-value">{currentCard.value}</div>
              <div className="putita-card-rule">{rules[currentCard.value - 1]}</div>
            </div>
          )}

          <button
            className="putita-draw-btn"
            type="button"
            onClick={drawCard}
          >
            {currentCard === null ? "Empezar" : "Siguiente carta"}
          </button>
        </div>

        <div className="putita-reference">
          <p className="putita-reference-title">Reglas</p>
          <div className="putita-reference-grid">
            {rules.map((rule, index) => (
              <div
                className={`putita-reference-row${currentCard?.value === index + 1 ? " is-active" : ""}`}
                key={index}
              >
                <span className="putita-reference-num">{index + 1}</span>
                <span className="putita-reference-rule">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
