import { ScanSearch } from "lucide-react";
import type { GameManifest } from "@/lib/platform/game-types";
import { MesaDeSospechososGame } from "./Game";

export const mesaDeSospechososManifest = {
  id: "mesa-de-sospechosos",
  slug: "mesa-de-sospechosos",
  title: "Mesa de sospechosos",
  shortDescription: "Crucen las pistas y reconstruyan una mesa donde solo un orden encaja.",
  description: [
    "Todo el grupo coopera desde un celular para reconstruir una fila de asientos numerados. Elijan 4, 5 o 6 sospechosos: cada caso tiene pistas lógicas y una única solución. No hace falta saber trivia ni anotar nombres.",
    "Lean las pistas en voz alta, discutan y toquen dos fichas para intercambiarlas. También pueden usar el teclado y los botones de mover. Los asientos siempre se leen del 1 al último; los extremos no se tocan. Pueden marcar pistas a mano como anotación del grupo.",
    "Tienen tres comprobaciones. Un error informa cuántas pistas y ayudas no encajan y resta 10 de los 100 puntos posibles. Pueden comprar hasta dos ayudas de ubicación a 15 puntos cada una. Al acertar, al tercer error o al revelar, verán el orden y la explicación de todas las pistas. La victoria y los puntos son de todo el grupo. No hay reloj. Recargar o volver al menú pierde el caso.",
  ],
  featurePills: ["Cooperativo", "Deducción", "Un celular"],
  actionLabel: "Investigar",
  tags: [],
  status: "playable",
  route: "/games/mesa-de-sospechosos",
  entryMode: "intro",
  accent: "violet",
  icon: ScanSearch,
  Game: MesaDeSospechososGame,
} satisfies GameManifest;
