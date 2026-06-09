"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Castle,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Crown,
  Eye,
  Gem,
  Plus,
  RefreshCw,
  RotateCcw,
  Shield,
  TimerReset,
  Trophy,
  type LucideIcon,
  Users,
  X,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Team = {
  id: string;
  name: string;
  position: number;
};

type CardStatus = "empty" | "loading" | "ready" | "revealed" | "ended" | "error";

type CardSource = "database" | "mock";

type CardResponse = {
  phrases: string[];
  source: CardSource;
};

const MIN_TEAMS = 2;
const MAX_TEAMS = 5;
const DEFAULT_TIMER_SECONDS = 30;
const MIN_TIMER_SECONDS = 10;
const MAX_TIMER_SECONDS = 120;
const DEFAULT_BOARD_LENGTH = 20;
const MIN_BOARD_LENGTH = 10;
const MAX_BOARD_LENGTH = 40;
const TEAM_COLORS = ["#ffd166", "#63e6be", "#ff6f91", "#9b6cff", "#6ecbff"];
const TEAM_PIECES: LucideIcon[] = [Crown, Shield, Castle, Gem, Trophy];

export function ContrarrelojGame() {
  const [phase, setPhase] = useState<"setup" | "playing">("setup");
  const [teams, setTeams] = useState<Team[]>([
    { id: "team-1", name: "Equipo 1", position: 0 },
    { id: "team-2", name: "Equipo 2", position: 0 },
  ]);
  const [timerSeconds, setTimerSeconds] = useState(DEFAULT_TIMER_SECONDS);
  const [boardLength, setBoardLength] = useState(DEFAULT_BOARD_LENGTH);
  const [phrases, setPhrases] = useState<string[]>([]);
  const [cardSource, setCardSource] = useState<CardSource>("mock");
  const [cardStatus, setCardStatus] = useState<CardStatus>("empty");
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_TIMER_SECONDS);
  const [activeTeamId, setActiveTeamId] = useState(teams[0]?.id ?? "");
  const timerRef = useRef<number | null>(null);
  const winner = teams.find((team) => team.position >= boardLength) ?? null;

  const activeTeam = useMemo(
    () => teams.find((team) => team.id === activeTeamId) ?? teams[0],
    [activeTeamId, teams],
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current === null) {
      return;
    }

    window.clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    if (cardStatus !== "revealed") {
      return;
    }

    timerRef.current = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          clearTimer();
          setCardStatus("ended");
          playTimeUpSound();
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return clearTimer;
  }, [cardStatus, clearTimer]);

  function updateTeamName(id: string, name: string) {
    setTeams((current) =>
      current.map((team) => (team.id === id ? { ...team, name } : team)),
    );
  }

  function addTeam() {
    setTeams((current) => {
      if (current.length >= MAX_TEAMS) {
        return current;
      }

      return [
        ...current,
        {
          id: crypto.randomUUID(),
          name: `Equipo ${current.length + 1}`,
          position: 0,
        },
      ];
    });
  }

  function removeTeam(id: string) {
    setTeams((current) => {
      if (current.length <= MIN_TEAMS) {
        return current;
      }

      const nextTeams = current.filter((team) => team.id !== id);

      if (activeTeamId === id) {
        setActiveTeamId(nextTeams[0]?.id ?? "");
      }

      return nextTeams;
    });
  }

  function startGame() {
    setTeams((current) =>
      current.map((team, index) => ({
        ...team,
        name: team.name.trim() || `Equipo ${index + 1}`,
        position: 0,
      })),
    );
    setRemainingSeconds(timerSeconds);
    setPhase("playing");
  }

  async function requestCard() {
    clearTimer();
    setCardStatus("loading");
    setRemainingSeconds(timerSeconds);

    try {
      const response = await fetch("/api/games/contrarreloj/card");

      if (!response.ok) {
        throw new Error("No se pudo pedir una carta.");
      }

      const data = (await response.json()) as CardResponse;

      setPhrases(data.phrases);
      setCardSource(data.source);
      setCardStatus("ready");
    } catch {
      setPhrases([]);
      setCardStatus("error");
    }
  }

  function revealCard() {
    if (cardStatus !== "ready") {
      return;
    }

    setRemainingSeconds(timerSeconds);
    setCardStatus("revealed");
  }

  function moveTeam(id: string, delta: number) {
    setTeams((current) =>
      current.map((team) =>
        team.id === id
          ? {
              ...team,
              position: clamp(team.position + delta, 0, boardLength),
            }
          : team,
      ),
    );
  }

  function resetBoard() {
    clearTimer();
    setTeams((current) => current.map((team) => ({ ...team, position: 0 })));
    setPhrases([]);
    setCardStatus("empty");
    setRemainingSeconds(timerSeconds);
  }

  function returnToSetup() {
    clearTimer();
    setPhrases([]);
    setCardStatus("empty");
    setRemainingSeconds(timerSeconds);
    setPhase("setup");
  }

  if (phase === "setup") {
    return (
      <main className="contrarreloj-shell">
        <Link href="/" className="back-link">
          <ArrowLeft size={16} strokeWidth={2.3} />
          Volver al menu
        </Link>

        <section className="contrarreloj-panel" aria-labelledby="contrarreloj-title">
          <div className="contrarreloj-heading">
            <p className="contrarreloj-kicker">Pensar rapido, hablar veloz</p>
            <h1 id="contrarreloj-title">Contrarreloj</h1>
          </div>

          <div className="contrarreloj-setup-grid">
            <section className="contrarreloj-section" aria-labelledby="teams-title">
              <div className="contrarreloj-section-title">
                <Users size={18} strokeWidth={2.3} />
                <h2 id="teams-title">Equipos</h2>
                <span>{teams.length}/{MAX_TEAMS}</span>
              </div>

              <div className="contrarreloj-team-fields">
                {teams.map((team, index) => (
                  <label className="contrarreloj-team-field" key={team.id}>
                    <span style={{ "--team-color": TEAM_COLORS[index] } as CSSProperties} />
                    <input
                      value={team.name}
                      maxLength={24}
                      onChange={(event) => updateTeamName(team.id, event.target.value)}
                      aria-label={`Nombre del equipo ${index + 1}`}
                    />
                    {teams.length > MIN_TEAMS ? (
                      <button
                        type="button"
                        aria-label={`Quitar ${team.name}`}
                        onClick={() => removeTeam(team.id)}
                      >
                        <X size={15} strokeWidth={2.5} />
                      </button>
                    ) : null}
                  </label>
                ))}
              </div>

              <button
                className="contrarreloj-secondary-button"
                type="button"
                disabled={teams.length >= MAX_TEAMS}
                onClick={addTeam}
              >
                <Plus size={17} strokeWidth={2.4} />
                Agregar equipo
              </button>
            </section>

            <section className="contrarreloj-section" aria-labelledby="settings-title">
              <div className="contrarreloj-section-title">
                <TimerReset size={18} strokeWidth={2.3} />
                <h2 id="settings-title">Partida</h2>
              </div>

              <label className="contrarreloj-field">
                <span>Tiempo por carta</span>
                <input
                  type="range"
                  min={MIN_TIMER_SECONDS}
                  max={MAX_TIMER_SECONDS}
                  step="5"
                  value={timerSeconds}
                  onChange={(event) => {
                    const nextSeconds = Number(event.target.value);
                    setTimerSeconds(nextSeconds);
                    setRemainingSeconds(nextSeconds);
                  }}
                />
                <strong>{timerSeconds} seg</strong>
              </label>

              <label className="contrarreloj-field">
                <span>Largo del tablero</span>
                <input
                  type="range"
                  min={MIN_BOARD_LENGTH}
                  max={MAX_BOARD_LENGTH}
                  step="1"
                  value={boardLength}
                  onChange={(event) => setBoardLength(Number(event.target.value))}
                />
                <strong>{boardLength} casillas</strong>
              </label>
            </section>
          </div>

          <div className="contrarreloj-start-row">
            <p>Minimo dos equipos. Cada grupo decide quien describe y quien adivina.</p>
            <button className="contrarreloj-primary-button" type="button" onClick={startGame}>
              Empezar
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="contrarreloj-shell">
      <div className="contrarreloj-topbar">
        <button className="contrarreloj-icon-button" type="button" onClick={returnToSetup}>
          <ArrowLeft size={16} strokeWidth={2.4} />
          <span className="sr-only">Volver a configuracion</span>
        </button>
        <span>{winner ? `${winner.name} gano` : `Turno sugerido: ${activeTeam?.name ?? "Equipo"}`}</span>
        <button className="contrarreloj-icon-button" type="button" onClick={resetBoard}>
          <RotateCcw size={16} strokeWidth={2.4} />
          <span className="sr-only">Reiniciar tablero</span>
        </button>
      </div>

      <section className="contrarreloj-board-panel" aria-label="Tablero">
        <div className="contrarreloj-board-header">
          <div>
            <p className="contrarreloj-kicker">Tablero</p>
            <h1>{winner ? "Meta alcanzada" : "Carrera activa"}</h1>
          </div>
          {winner ? (
            <span className="contrarreloj-winner">
              <Trophy size={16} strokeWidth={2.4} />
              {winner.name}
            </span>
          ) : null}
        </div>

        <div className="contrarreloj-track" aria-label={`${boardLength} casillas`}>
          {Array.from({ length: boardLength + 1 }, (_, index) => (
            <div className={getSpaceClassName(index, boardLength, teams)} key={index}>
              <span>{getSpaceLabel(index, boardLength)}</span>
              <div className="contrarreloj-space-tokens">
                {teams.map((team, teamIndex) =>
                  team.position === index ? (
                    <TeamPiece
                      className="contrarreloj-token"
                      key={team.id}
                      name={team.name}
                      color={TEAM_COLORS[teamIndex]}
                      icon={TEAM_PIECES[teamIndex] ?? Trophy}
                    />
                  ) : null,
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="contrarreloj-score-grid">
          {teams.map((team, index) => (
            <article className="contrarreloj-team-control" key={team.id}>
              <button
                className={team.id === activeTeamId ? "is-active" : ""}
                type="button"
                onClick={() => setActiveTeamId(team.id)}
              >
                <span style={{ "--team-color": TEAM_COLORS[index] } as CSSProperties} />
                {team.name}
              </button>
              <strong>{team.position}/{boardLength}</strong>
              <div>
                <button type="button" aria-label={`Retroceder ${team.name}`} onClick={() => moveTeam(team.id, -1)}>
                  <ChevronLeft size={16} strokeWidth={2.4} />
                </button>
                <button type="button" aria-label={`Avanzar ${team.name}`} onClick={() => moveTeam(team.id, 1)}>
                  <ChevronRight size={16} strokeWidth={2.4} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="contrarreloj-card-panel" aria-label="Carta">
        <div className="contrarreloj-card-toolbar">
          <label className="contrarreloj-inline-field">
            <Clock3 size={16} strokeWidth={2.3} />
            <input
              type="number"
              min={MIN_TIMER_SECONDS}
              max={MAX_TIMER_SECONDS}
              value={timerSeconds}
              onChange={(event) => {
                const nextSeconds = clamp(Number(event.target.value), MIN_TIMER_SECONDS, MAX_TIMER_SECONDS);
                setTimerSeconds(nextSeconds);
                if (cardStatus !== "revealed") {
                  setRemainingSeconds(nextSeconds);
                }
              }}
            />
            seg
          </label>
          <button className="contrarreloj-secondary-button" type="button" onClick={requestCard}>
            <RefreshCw size={16} strokeWidth={2.4} />
            Pedir carta
          </button>
        </div>

        <button
          className={`contrarreloj-card contrarreloj-card--${cardStatus}`}
          type="button"
          onClick={revealCard}
        >
          {cardStatus === "empty" ? (
            <span>Pedi una carta para empezar</span>
          ) : null}
          {cardStatus === "loading" ? (
            <span>Cargando carta</span>
          ) : null}
          {cardStatus === "error" ? (
            <span>No se pudo cargar la carta</span>
          ) : null}
          {cardStatus === "ready" ? (
            <>
              <Eye size={22} strokeWidth={2.3} />
              <span>Dar vuelta la carta</span>
            </>
          ) : null}
          {cardStatus === "revealed" || cardStatus === "ended" ? (
            <>
              <div className="contrarreloj-timer" aria-live="polite">
                {cardStatus === "ended" ? "Tiempo" : formatTime(remainingSeconds)}
              </div>
              <ol className="contrarreloj-phrases">
                {phrases.map((phrase) => (
                  <li key={phrase}>{phrase}</li>
                ))}
              </ol>
              <small>{cardSource === "mock" ? "Mock desarrollo" : "Base de datos"}</small>
            </>
          ) : null}
        </button>
      </section>
    </main>
  );
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString();
  const remainder = (seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainder}`;
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function getSpaceClassName(index: number, boardLength: number, teams: Team[]) {
  const classNames = ["contrarreloj-space"];

  if (index === 0) {
    classNames.push("contrarreloj-space--start");
  }

  if (index === boardLength) {
    classNames.push("contrarreloj-space--finish");
  }

  if (index > 0 && index < boardLength && index % 5 === 0) {
    classNames.push("contrarreloj-space--milestone");
  }

  if (teams.some((team) => team.position === index)) {
    classNames.push("has-token");
  }

  return classNames.join(" ");
}

function getSpaceLabel(index: number, boardLength: number) {
  if (index === 0) {
    return "Salida";
  }

  if (index === boardLength) {
    return "Meta";
  }

  return index.toString();
}

function getTeamInitial(teamName: string) {
  return teamName.trim().charAt(0).toUpperCase() || "E";
}

function TeamPiece({
  className,
  color,
  icon: PieceIcon,
  name,
}: {
  className: string;
  color: string;
  icon: LucideIcon;
  name: string;
}) {
  return (
    <span
      className={className}
      style={{ "--team-color": color } as CSSProperties}
      title={name}
      aria-label={name}
    >
      <PieceIcon size={15} strokeWidth={2.8} />
      <span>{getTeamInitial(name)}</span>
    </span>
  );
}

function playTimeUpSound() {
  const AudioContextConstructor = window.AudioContext ?? window.webkitAudioContext;

  if (!AudioContextConstructor) {
    return;
  }

  const audioContext = new AudioContextConstructor();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.16);
  gain.gain.setValueAtTime(0.001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.45);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.5);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
