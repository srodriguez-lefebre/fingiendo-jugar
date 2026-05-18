import { VenetianMask } from "lucide-react";

import type { GameManifest } from "@/lib/platform/game-types";

import { impostorDatabaseConfig } from "./config";
import { ImpostorGame } from "./Game";

export const impostorManifest = {
  id: "impostor",
  slug: "impostor",
  title: "Impostor",
  shortDescription: "Descubri quien esta fingiendo antes de que termine la ronda.",
  description: [
    "Un juego de palabras secretas para jugar en grupo con un solo celular. La mayoria recibe la misma palabra; los impostores tienen que fingir que tambien la conocen.",
    "Se elige una categoria, jugadores y tiempo. Despues el celular pasa de mano en mano para que cada persona vea su palabra o rol en secreto. Cuando todos vieron, el grupo conversa, sospecha y decide por su cuenta.",
    "Puede jugarse con cantidad fija de impostores o en modo incognito, donde la app sortea cuantos impostores hay.",
    "Tambien existe el modo impostor confundido: el impostor no sabe que lo es y recibe otra palabra de la misma categoria. Tiene que darse cuenta durante la charla de que algo no encaja.",
  ],
  featurePills: ["3-12", "Un celular", "Roles"],
  actionLabel: "Jugar",
  tags: [],
  status: "playable",
  route: "/games/impostor",
  entryMode: "intro",
  accent: "rose",
  icon: VenetianMask,
  database: impostorDatabaseConfig,
  Game: ImpostorGame,
} satisfies GameManifest;
