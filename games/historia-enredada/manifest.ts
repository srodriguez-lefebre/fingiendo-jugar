import { NotebookPen } from "lucide-react";

import type { GameManifest } from "@/lib/platform/game-types";

import { HistoriaEnredadaGame } from "./Game";

export const historiaEnredadaManifest = {
  id: "historia-enredada",
  slug: "historia-enredada",
  title: "Historia enredada",
  shortDescription: "Inventen un cuento entre todos: una frase, una palabra obligatoria y un giro inesperado por turno.",
  description: [
    "De 2 a 8 personas crean una historia cooperativa en un solo celular. Carguen los nombres, elijan misterio barrial, ciencia ficción casera o comedia absurda y jueguen 2 o 3 rondas.",
    "Pasen el teléfono en el orden indicado. Cada persona lee lo que ya pasó y escribe una frase de 5 a 30 palabras que incluya su palabra obligatoria y siga el giro narrativo. La app comprueba la palabra y la extensión; el grupo cuida que el cuento tenga sentido. Pueden pasar un turno si se traban.",
    "Cada frase suma un desafío cumplido al grupo. El último turno pide un cierre y al final leen la historia completa con sus autores. No hay cronómetro: disfruten inventando. Recargar la página o volver al menú descarta la partida.",
  ],
  featurePills: ["2–8 personas", "Crear historias", "Un celular"],
  actionLabel: "Jugar",
  tags: [],
  status: "playable",
  route: "/games/historia-enredada",
  entryMode: "intro",
  accent: "violet",
  icon: NotebookPen,
  Game: HistoriaEnredadaGame,
} satisfies GameManifest;
