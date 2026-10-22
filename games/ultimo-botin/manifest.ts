import { Compass } from "lucide-react";

import type { GameManifest } from "@/lib/platform/game-types";

import { UltimoBotinGame } from "./Game";

export const ultimoBotinManifest = {
  id: "ultimo-botin",
  slug: "ultimo-botin",
  title: "Último Botín",
  shortDescription:
    "Junten tesoro, midan el riesgo y decidan cuándo volver antes de perderlo todo.",
  description: [
    "De 2 a 8 personas cooperan desde un solo celular. Anoten sus nombres y elijan 3, 5 o 7 expediciones: necesitan guardar 40, 65 o 90 monedas entre todas. La capitanía rota y registra lo que decida el grupo.",
    "Explorar descubre un tesoro o un peligro. Los tesoros se acumulan como botín pendiente: pueden seguir arriesgando o guardarlo y cerrar la expedición. Hay tres peligros distintos; la segunda aparición del mismo provoca un accidente y pierde el botín pendiente. Lo que ya guardaron queda a salvo.",
    "Tienen una sola cuerda para toda la partida: después de un accidente pueden gastarla para rescatar la mitad del botín, redondeada hacia abajo. La app muestra el riesgo del próximo paso. Jueguen todas las expediciones y comparen el tesoro seguro con su objetivo. Recargar o volver al menú reinicia la partida.",
  ],
  featurePills: ["2–8 personas", "Cooperativo", "Riesgo"],
  actionLabel: "Explorar",
  tags: [],
  status: "playable",
  route: "/games/ultimo-botin",
  entryMode: "intro",
  accent: "amber",
  icon: Compass,
  Game: UltimoBotinGame,
} satisfies GameManifest;
