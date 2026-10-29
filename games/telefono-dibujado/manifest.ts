import { PencilLine } from 'lucide-react';
import type { GameManifest } from '@/lib/platform/game-types';
import { TelefonoDibujadoGame } from './Game';

export const telefonoDibujadoManifest = {
  id: 'telefono-dibujado', slug: 'telefono-dibujado', title: 'Teléfono dibujado',
  shortDescription: 'Una idea pasa de dibujo a frase. Mirá en qué termina.',
  description: [
    'De 2 a 8 personas, en un solo celular. Armen la ronda y elijan 1, 2 o 3 cadenas. La primera persona recibe una idea secreta para dibujar; la siguiente describe ese dibujo; la siguiente dibuja esa frase. Cada persona ve únicamente la entrega anterior y participa una vez por cadena. Quien empieza rota entre cadenas.',
    'Dibujen con el dedo, mouse o teclado. No hace falta saber dibujar: los malentendidos son la gracia. Sin reloj ni puntos, y con un pase explícito si se traban. Con una cantidad impar de personas, la cadena termina en dibujo. Todas las cadenas se abren juntas en el álbum final, donde revelan las entregas de a una.',
    'Los dibujos y las frases quedan en memoria en este dispositivo, sin subirse a ningún lado. Recargar la página o volver al menú borra la partida.',
  ],
  featurePills: ['2–8 personas', 'Dibujo y palabras', 'Un celular'],
  actionLabel: 'Jugar', tags: [], status: 'playable', route: '/games/telefono-dibujado',
  entryMode: 'intro', accent: 'amber', icon: PencilLine, Game: TelefonoDibujadoGame,
} satisfies GameManifest;
