import { Dices } from "lucide-react";
import type { GameManifest } from "@/lib/platform/game-types";
import { DudoGame } from "./Game";

export const dudoManifest = {
  id: "dudo",
  slug: "dudo",
  title: "Dudo",
  shortDescription: "Apostá lo que hay en la mesa. Detectá el farol antes de que te lo crean.",
  description: [
    "De 2 a 8 personas, un solo celular y 3 dados ocultos cada una. Pasen el celular sin mostrar la pantalla: en tu turno mirás solo tus dados y apostás cuántos de una cara hay entre todos. No hay comodines: el uno vale uno.",
    "Quien sigue sube la cantidad, o mantiene la cantidad y sube la cara. También puede decir ¡Dudo!: se revelan todos los dados. Si hay al menos lo apostado, quien apostó gana 2 puntos; si faltan, los gana quien dudó. El resto suma 0. Tus dados se ocultan automáticamente al apostar.",
    "Elijan una o dos vueltas: cada persona abre exactamente una o dos rondas, con dados nuevos en cada ronda y sin eliminación. Gana quien termine con más puntos; el empate es compartido. Hay revancha. La partida queda en memoria: recargar o volver al menú la reinicia.",
  ],
  featurePills: ["2–8 personas", "Dados ocultos", "Farol"],
  actionLabel: "Armar la mesa",
  tags: [],
  status: "playable",
  route: "/games/dudo",
  entryMode: "intro",
  accent: "mint",
  icon: Dices,
  Game: DudoGame,
} satisfies GameManifest;
