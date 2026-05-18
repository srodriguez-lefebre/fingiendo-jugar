"use client";

import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Play, Plus, RotateCcw, Timer, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type ImpostorPhase = "setup" | "handoff" | "reveal" | "timer" | "ended" | "result";
type ImpostorCountMode = "fixed" | "random";
type CategoryStatus = "loading" | "ready" | "error";

type ImpostorCategory = {
  id: string;
  label: string;
  wordCount: number;
};

type ImpostorWord = {
  word: string;
  hint: string;
};

type PlayerAssignment = {
  name: string;
  isImpostor: boolean;
  word: string | null;
  hint: string;
};

type RoundState = {
  assignments: PlayerAssignment[];
  categoryLabel: string;
  secretWord: ImpostorWord;
  timerMinutes: number;
};

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 12;
const DEFAULT_TIMER_MINUTES = 5;

export function ImpostorGame() {
  const [phase, setPhase] = useState<ImpostorPhase>("setup");
  const [playerNames, setPlayerNames] = useState(["", "", ""]);
  const [categories, setCategories] = useState<ImpostorCategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [categoryStatus, setCategoryStatus] = useState<CategoryStatus>("loading");
  const [roundError, setRoundError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [countMode, setCountMode] = useState<ImpostorCountMode>("fixed");
  const [fixedImpostorCount, setFixedImpostorCount] = useState(1);
  const [confusedMode, setConfusedMode] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(DEFAULT_TIMER_MINUTES);
  const [round, setRound] = useState<RoundState | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_TIMER_MINUTES * 60);

  const players = useMemo(
    () =>
      playerNames.map((name, index) => {
        const trimmedName = name.trim();

        return trimmedName || `Jugador ${index + 1}`;
      }),
    [playerNames],
  );
  const maxImpostors = getMaxImpostors(Math.max(players.length, MIN_PLAYERS));
  const safeFixedImpostorCount = clamp(fixedImpostorCount, 1, maxImpostors);
  const selectedCategory = categories.find((category) => category.id === categoryId) ?? null;
  const canStart =
    players.length >= MIN_PLAYERS &&
    categoryStatus === "ready" &&
    Boolean(selectedCategory) &&
    !isStarting;
  const currentAssignment = round?.assignments[currentPlayerIndex] ?? null;

  useEffect(() => {
    let isActive = true;

    async function loadCategories() {
      try {
        const response = await fetch("/api/games/impostor/categories");

        if (!response.ok) {
          throw new Error("No se pudieron cargar las categorias.");
        }

        const data = await response.json() as { categories: ImpostorCategory[] };

        if (!isActive) {
          return;
        }

        setCategories(data.categories);
        setCategoryId((current) => current || data.categories[0]?.id || "");
        setCategoryStatus("ready");
      } catch {
        if (!isActive) {
          return;
        }

        setCategoryStatus("error");
      }
    }

    loadCategories();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (phase !== "timer") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(intervalId);
          setPhase("ended");
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [phase]);

  function updatePlayerName(index: number, value: string) {
    setPlayerNames((current) =>
      current.map((name, playerIndex) => (playerIndex === index ? value : name)),
    );
  }

  function addPlayer() {
    setPlayerNames((current) =>
      current.length >= MAX_PLAYERS ? current : [...current, ""],
    );
  }

  function removePlayer(index: number) {
    setPlayerNames((current) =>
      current.length <= MIN_PLAYERS
        ? current
        : current.filter((_, playerIndex) => playerIndex !== index),
    );
  }

  async function startRound() {
    if (!canStart || !selectedCategory) {
      return;
    }

    const playerCount = players.length;
    const impostorLimit = getMaxImpostors(playerCount);
    const impostorCount =
      countMode === "random"
        ? randomInt(1, impostorLimit)
        : clamp(safeFixedImpostorCount, 1, impostorLimit);
    const neededWords = confusedMode ? impostorCount + 1 : 1;

    setIsStarting(true);
    setRoundError("");

    try {
      const words = await loadRoundWords(categoryId, neededWords);
      const secretWord = words[0];
      const falseWords = words.slice(1);
      const impostorIndexes = new Set(pickIndexes(playerCount, impostorCount));
      let falseWordIndex = 0;

      const assignments = players.map((name, index) => {
        const isImpostor = impostorIndexes.has(index);

        if (!isImpostor) {
          return {
            name,
            isImpostor,
            word: secretWord.word,
            hint: secretWord.hint,
          };
        }

        if (confusedMode) {
          const falseWord = falseWords[falseWordIndex % falseWords.length];
          falseWordIndex += 1;

          return {
            name,
            isImpostor,
            word: falseWord.word,
            hint: falseWord.hint,
          };
        }

        return {
          name,
          isImpostor,
          word: null,
          hint: secretWord.hint,
        };
      });

      setRound({
        assignments,
        categoryLabel: selectedCategory.label,
        secretWord,
        timerMinutes,
      });
      setCurrentPlayerIndex(0);
      setRemainingSeconds(timerMinutes * 60);
      setPhase("handoff");
    } catch {
      setRoundError("No se pudieron cargar palabras para esta ronda.");
    } finally {
      setIsStarting(false);
    }
  }

  function hideAndContinue() {
    if (!round) {
      setPhase("setup");
      return;
    }

    if (currentPlayerIndex >= round.assignments.length - 1) {
      setPhase("timer");
      return;
    }

    setCurrentPlayerIndex((index) => index + 1);
    setPhase("handoff");
  }

  function resetRound(keepPlayers = true) {
    setRound(null);
    setCurrentPlayerIndex(0);
    setRemainingSeconds(timerMinutes * 60);
    setRoundError("");
    setPhase("setup");

    if (!keepPlayers) {
      setPlayerNames(["", "", ""]);
    }
  }

  if (phase === "handoff" && currentAssignment) {
    return (
      <ImpostorShell>
        <section className="impostor-panel impostor-panel--center">
          <p className="impostor-kicker">Turno privado</p>
          <h1>{currentAssignment.name}</h1>
          <p className="impostor-copy">
            Pasale el celular a esta persona. Cuando este lista, puede ver su rol.
          </p>
          <button className="impostor-primary-button" type="button" onClick={() => setPhase("reveal")}>
            <Eye size={18} strokeWidth={2.3} />
            Ver
          </button>
        </section>
      </ImpostorShell>
    );
  }

  if (phase === "reveal" && currentAssignment && round) {
    return (
      <ImpostorShell>
        <section className="impostor-panel impostor-panel--center">
          <p className="impostor-kicker">{round.categoryLabel}</p>
          {currentAssignment.word ? (
            <>
              <h1>{currentAssignment.word}</h1>
              <p className="impostor-copy">Pista: {currentAssignment.hint}</p>
            </>
          ) : (
            <>
              <p className="impostor-role-alert">Sos impostor</p>
              <h1>{round.categoryLabel}</h1>
              <p className="impostor-copy">Pista: {currentAssignment.hint}</p>
            </>
          )}
          <button className="impostor-primary-button" type="button" onClick={hideAndContinue}>
            <EyeOff size={18} strokeWidth={2.3} />
            Ocultar / Pasar al siguiente
          </button>
        </section>
      </ImpostorShell>
    );
  }

  if ((phase === "timer" || phase === "ended") && round) {
    return (
      <ImpostorShell>
        <section className="impostor-panel impostor-panel--center">
          <p className="impostor-kicker">{round.categoryLabel}</p>
          <h1>{phase === "ended" ? "Tiempo terminado" : formatTime(remainingSeconds)}</h1>
          <p className="impostor-copy">
            Hablen, tiren pistas y sospechen. La app no vota por ustedes.
          </p>
          <button className="impostor-primary-button" type="button" onClick={() => setPhase("result")}>
            Revelar resultado
          </button>
        </section>
      </ImpostorShell>
    );
  }

  if (phase === "result" && round) {
    const impostors = round.assignments
      .filter((assignment) => assignment.isImpostor)
      .map((assignment) => assignment.name)
      .join(", ");

    return (
      <ImpostorShell>
        <section className="impostor-panel impostor-panel--center">
          <p className="impostor-kicker">Resultado</p>
          <h1>{round.secretWord.word}</h1>
          <div className="impostor-result">
            <span>Palabra secreta</span>
            <strong>{round.secretWord.word}</strong>
          </div>
          <div className="impostor-result">
            <span>Impostores</span>
            <strong>{impostors}</strong>
          </div>
          <div className="impostor-actions">
            <button className="impostor-primary-button" type="button" onClick={() => resetRound(true)}>
              <RotateCcw size={18} strokeWidth={2.3} />
              Nueva ronda
            </button>
          </div>
        </section>
      </ImpostorShell>
    );
  }

  return (
    <ImpostorShell>
      <section className="impostor-panel" aria-labelledby="impostor-title">
        <div className="impostor-heading">
          <p className="impostor-kicker">Un celular, una palabra, alguien fingiendo</p>
          <h1 id="impostor-title">Impostor</h1>
        </div>

        <div className="impostor-setup-grid">
          <section className="impostor-setup-section" aria-labelledby="players-title">
            <div className="impostor-section-title">
              <Users size={18} strokeWidth={2.3} />
              <h2 id="players-title">Jugadores</h2>
              <span>{players.length}/{MAX_PLAYERS}</span>
            </div>

            <div className="impostor-player-list">
              {playerNames.map((name, index) => (
                <label className="impostor-player-field" key={index}>
                  <span>Jugador {index + 1}</span>
                  <div>
                    <input
                      value={name}
                      maxLength={24}
                      onChange={(event) => updatePlayerName(index, event.target.value)}
                      placeholder={`Jugador ${index + 1}`}
                    />
                    {playerNames.length > MIN_PLAYERS ? (
                      <button
                        aria-label={`Quitar jugador ${index + 1}`}
                        type="button"
                        onClick={() => removePlayer(index)}
                      >
                        x
                      </button>
                    ) : null}
                  </div>
                </label>
              ))}
            </div>

            <button
              className="impostor-secondary-button"
              type="button"
              disabled={playerNames.length >= MAX_PLAYERS}
              onClick={addPlayer}
            >
              <Plus size={17} strokeWidth={2.4} />
              Agregar jugador
            </button>
          </section>

          <section className="impostor-setup-section" aria-labelledby="settings-title">
            <div className="impostor-section-title">
              <Timer size={18} strokeWidth={2.3} />
              <h2 id="settings-title">Partida</h2>
            </div>

            <label className="impostor-field">
              <span>Categoria</span>
              <select
                value={categoryId}
                disabled={categoryStatus !== "ready"}
                onChange={(event) => setCategoryId(event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="impostor-field">
              <span>Timer</span>
              <input
                type="range"
                min="1"
                max="10"
                value={timerMinutes}
                onChange={(event) => setTimerMinutes(Number(event.target.value))}
              />
              <strong>{timerMinutes} min</strong>
            </label>

            <div className="impostor-toggle-row" role="group" aria-label="Cantidad de impostores">
              <button
                className={countMode === "fixed" ? "is-active" : ""}
                type="button"
                onClick={() => setCountMode("fixed")}
              >
                Elegir
              </button>
              <button
                className={countMode === "random" ? "is-active" : ""}
                type="button"
                onClick={() => setCountMode("random")}
              >
                Incognito
              </button>
            </div>

            {countMode === "fixed" ? (
              <label className="impostor-field">
                <span>Impostores</span>
                <select
                  value={safeFixedImpostorCount}
                  onChange={(event) => setFixedImpostorCount(Number(event.target.value))}
                >
                  {Array.from({ length: maxImpostors }, (_, index) => index + 1).map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="impostor-note">La app sortea entre 1 y {maxImpostors} impostores.</p>
            )}

            <label className="impostor-check">
              <input
                type="checkbox"
                checked={confusedMode}
                onChange={(event) => setConfusedMode(event.target.checked)}
              />
              <span>Impostor confundido</span>
            </label>
          </section>
        </div>

        <div className="impostor-start-row">
          <p>
            {getSetupMessage({
              canStart,
              categoryStatus,
              selectedCategory,
              minPlayers: MIN_PLAYERS,
            })}
          </p>
          <button className="impostor-primary-button" type="button" disabled={!canStart} onClick={startRound}>
            <Play size={18} strokeWidth={2.3} />
            {isStarting ? "Cargando" : "Empezar"}
          </button>
          {roundError ? <p className="impostor-error">{roundError}</p> : null}
        </div>
      </section>
    </ImpostorShell>
  );
}

function ImpostorShell({ children }: { children: ReactNode }) {
  return (
    <main className="impostor-shell">
      <Link href="/" className="back-link">
        <ArrowLeft size={16} strokeWidth={2.3} />
        Volver al menu
      </Link>
      {children}
    </main>
  );
}

function getMaxImpostors(playerCount: number) {
  return Math.max(1, Math.floor(playerCount / 2));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickIndexes(size: number, count: number) {
  return shuffle(Array.from({ length: size }, (_, index) => index)).slice(0, count);
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString();
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

async function loadRoundWords(categoryId: string, count: number) {
  const params = new URLSearchParams({
    categoryId,
    count: count.toString(),
  });
  const response = await fetch(`/api/games/impostor/words?${params.toString()}`);

  if (!response.ok) {
    throw new Error("No se pudieron cargar las palabras de esta ronda.");
  }

  const data = await response.json() as { words: ImpostorWord[] };

  return data.words;
}

function getSetupMessage({
  canStart,
  categoryStatus,
  selectedCategory,
  minPlayers,
}: {
  canStart: boolean;
  categoryStatus: CategoryStatus;
  selectedCategory: ImpostorCategory | null;
  minPlayers: number;
}) {
  if (categoryStatus === "loading") {
    return "Cargando categorias.";
  }

  if (categoryStatus === "error") {
    return "No se pudieron cargar las categorias.";
  }

  if (!canStart) {
    return `Minimo ${minPlayers} jugadores.`;
  }

  return `${selectedCategory?.wordCount ?? 0} palabras en ${selectedCategory?.label ?? "categoria"}.`;
}
