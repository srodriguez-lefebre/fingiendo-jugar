import { Radio } from "lucide-react";

import type { GameManifest } from "@/lib/platform/game-types";

import { SintoniaGame } from "./Game";

export const sintoniaManifest = {
  id: "sintonia",
  slug: "sintonia",
  title: "Sintonía",
  shortDescription: "Elegí tu lado y predecí cuántas personas piensan como vos.",
  description: [
    "De 3 a 10 personas, en un solo celular. Lean un dilema con dos opciones y piensen su respuesta sin debatir. Después, pásense el celular: cada persona vota A o B en privado y predice cuántas elegirán A, incluyéndose. Nadie ve las respuestas anteriores.",
    "Al terminar los votos se revela el grupo: un pronóstico exacto suma 3 puntos; quedar a una persona suma 1; los demás suman 0. Cada persona puede activar un doble una sola vez por partida, antes de confirmar su voto, para multiplicar los puntos de esa ronda por dos.",
    "Elijan 5, 8 o 12 rondas y un mazo cotidiano, de planes, de dilemas imaginarios o mezclado. Gana quien sume más puntos; los empates se comparten. Recargar la página o volver al menú reinicia la partida.",
  ],
  featurePills: ["3–10 personas", "Predicciones", "Un celular"],
  actionLabel: "Jugar",
  tags: [],
  status: "playable",
  route: "/games/sintonia",
  entryMode: "intro",
  accent: "mint",
  icon: Radio,
  Game: SintoniaGame,
} satisfies GameManifest;
