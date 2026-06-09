import { TimerReset } from "lucide-react";

import type { GameManifest } from "@/lib/platform/game-types";

import { contrarrelojDatabaseConfig } from "./config";
import { ContrarrelojGame } from "./Game";

export const contrarrelojManifest = {
  id: "contrarreloj",
  slug: "contrarreloj",
  title: "Contrarreloj",
  shortDescription:
    "Dale vuelta a una carta, describi cinco frases y move el tablero antes de que gane otro equipo.",
  description: [
    "Un juego por equipos para jugar desde un solo celular. En cada turno una persona describe una carta con cinco palabras o frases, mientras su equipo intenta adivinar la mayor cantidad posible antes de que termine el tiempo.",
    "La app funciona como tablero y mesa de control: pedis una carta, la das vuelta para iniciar el cronometro, corroboras los aciertos y moves las fichas manualmente.",
    "El flujo queda flexible para la reunion: se puede pedir otra carta, repetir, avanzar o retroceder equipos y ajustar el tiempo global de la partida.",
  ],
  featurePills: ["2-5 equipos", "Un celular", "30 seg"],
  actionLabel: "Jugar",
  tags: [],
  status: "playable",
  route: "/games/contrarreloj",
  entryMode: "intro",
  accent: "amber",
  icon: TimerReset,
  database: contrarrelojDatabaseConfig,
  Game: ContrarrelojGame,
} satisfies GameManifest;
