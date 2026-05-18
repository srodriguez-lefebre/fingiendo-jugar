# Caso cero para crear un juego

Esta carpeta representa el modelo mental para agregar juegos a Fingiendo Jugar.
No es todavia un juego real: es una guia viva que se ira ajustando cuando exista
la base Next.js y el primer juego implementado.

La idea es que, en el futuro, crear un juego nuevo sea algo parecido a:

1. Copiar `games/_template`.
2. Renombrar la carpeta a `games/mi-juego`.
3. Completar el manifest.
4. Exportar el manifest desde `index.ts`.
5. Agregar el manifest al registro.
6. Probar que aparece en el menu.
7. Cuando el juego exista, implementar `Game.tsx` y cambiar su estado a `playable`.

## Que es un juego en este repo

Un juego es una experiencia autocontenida. Puede compartir layout y componentes
de plataforma, pero su logica principal vive dentro de su propia carpeta.

Un juego puede ser:

- De roles ocultos.
- De cartas.
- De numeros.
- De palabras.
- De votacion.
- De memoria.
- De dibujo.
- De azar.
- De un solo dispositivo.
- Con otra dinamica completamente distinta.

La arquitectura no debe asumir que todos los juegos tienen los mismos pasos.

## Estructura sugerida

```txt
games/mi-juego/
  index.ts
  manifest.ts
  Game.tsx
  README.md
  components/
  logic/
  data/
  database/
  assets/
```

### `manifest.ts`

Describe el juego para la plataforma.

Debe responder:

- Como se llama.
- Cual es su URL.
- Que descripcion aparece en el menu.
- Que pildoras visibles aparecen dentro de la card.
- Que descripcion larga aparece en la entrada del juego.
- Que estado tiene.
- Si usa entrada previa o va directo al juego.
- Cual es su acento visual.
- Que icono usa en el menu y en la entrada.
- Si quiere usar una tabla Neon propia.

Ejemplo:

```ts
import { Puzzle } from "lucide-react";

import type { GameManifest } from "@/lib/platform/game-types";

export const miJuegoManifest = {
  id: "mi-juego",
  slug: "mi-juego",
  title: "Mi Juego",
  shortDescription: "Una descripcion corta para la card del menu.",
  description: [
    "Una descripcion un poco mas completa para la entrada del juego.",
    "Aca conviene explicar como se juega, que decisiones tiene el grupo y que variantes importantes existen.",
  ],
  featurePills: ["Grupo", "Rapido", "Un celular"],
  statusLabel: "En preparacion",
  tags: [],
  status: "coming-soon",
  route: "/games/mi-juego",
  entryMode: "intro",
  accent: "violet",
  icon: Puzzle,
  database: {
    provider: "neon",
    tableName: "mi_juego",
    access: "read-only",
  },
} satisfies GameManifest;
```

`database` es opcional. Si el juego no necesita base de datos, se borra esa
propiedad.

`description` puede ser un texto o una lista de parrafos. La card usa
`shortDescription`; la entrada usa `description`. No conviene repetir lo mismo:
la card debe vender la idea rapido y la entrada debe explicar como se juega,
que opciones tiene y que espera el grupo antes de tocar "Empezar".

`accent` define la identidad visual de plataforma de ese juego: card, icono,
pildoras, entrada y boton principal. Los acentos disponibles son:

- `violet`
- `rose`
- `mint`
- `amber`
- `nightclub`

Si manana hay un juego de musica con tonalidades verdes, por ejemplo, puede usar
`accent: "mint"` e importar un icono como `Music` desde `lucide-react`.
La idea es que las cards puedan convivir con colores distintos segun la identidad
del juego.

Si un juego necesita un color que no existe, primero se agrega el nuevo valor a
`GameAccent` en `lib/platform/game-types.ts` y despues se crea su clase
`.game-theme--nuevo-color` en `app/globals.css`.

`icon` tambien es opcional. Si no se declara, la plataforma usa un icono generico
de juego. Cuando un juego tiene tema claro, conviene elegir uno propio:

```ts
import { Music } from "lucide-react";

export const musicaManifest = {
  // ...
  accent: "mint",
  icon: Music,
} satisfies GameManifest;
```

Tambien se puede usar una imagen publica en vez de un icono Lucide:

```ts
export const miJuegoManifest = {
  // ...
  iconImage: {
    src: "/games/mi-juego/icon.png",
    alt: "Icono de Mi Juego",
  },
} satisfies GameManifest;
```

En ese caso, guardar la imagen en `public/games/[gameId]/`.

### `index.ts`

Es la puerta publica de la carpeta del juego.

El registro global debe importar desde la carpeta del juego, no desde archivos
internos:

```ts
import { miJuegoManifest } from "@/games/mi-juego";
```

Ejemplo de `index.ts`:

```ts
export { miJuegoManifest } from "./manifest";
```

### `Game.tsx`

Es el componente principal del juego.

Debe encargarse de:

- Mostrar la experiencia jugable.
- Manejar su estado interno.
- Usar sus componentes propios.
- Guardar estado si el juego lo necesita.

No deberia encargarse de:

- Aparecer en el menu.
- Definir la navegacion global.
- Modificar otros juegos.

Un juego con `status: "coming-soon"` no necesita `Game.tsx` todavia. La ruta
`/games/[gameId]` puede mostrar una entrada comun con la informacion del
manifest.

Cuando el juego pase a `playable`, el manifest debe conectar el componente:

```ts
import { TemplateGame } from "./Game";

export const miJuegoManifest = {
  // ...
  status: "playable",
  Game: TemplateGame,
} satisfies GameManifest;
```

Con `entryMode: "intro"`, `/games/[gameId]` muestra primero `GameEntry` y el
boton "Empezar" lleva a `/games/[gameId]?play=1`. Ese boton queda fuera de la
card grande de descripcion para que la lectura y la accion no compitan. Con
`entryMode: "direct"`, la ruta monta el juego directamente.

### `README.md`

Explica el juego para futuros desarrolladores.

Debe incluir:

- Resumen.
- Reglas.
- Flujo de pantallas.
- Decisiones raras o importantes.
- Que datos usa.
- Si guarda estado o no.

### `components/`

UI propia del juego.

Ejemplos:

- Cartas.
- Paneles.
- Botones especiales.
- Marcadores.
- Pantallas internas.

Si un componente solo tiene sentido en este juego, vive aca.

### `logic/`

Reglas puras del juego.

Ejemplos:

- Reducer.
- Motor de turnos.
- Validaciones.
- Sorteos.
- Calculo de resultados.
- Selectores.

Idealmente, esta carpeta deberia poder probarse sin renderizar React.

### `data/`

Contenido especifico del juego.

Ejemplos:

- Categorias.
- Palabras.
- Preguntas.
- Cartas.
- Configuraciones iniciales.

Si el juego usa Neon, esta carpeta puede contener transformadores o tipos del
contenido, pero no credenciales ni datos privados.

### `database/`

Archivos SQL opcionales del juego.

Ejemplos:

- `schema.sql`: crea la unica tabla del juego.
- `seed.sql`: carga datos iniciales.

Estos archivos no deben incluir credenciales. El nombre de tabla debe coincidir
con `manifest.database.tableName`.

### `assets/`

Archivos visuales o estaticos del juego.

Ejemplos:

- Imagenes.
- Texturas.
- Ilustraciones.
- Sonidos, si algun dia se justifican.

## Reglas de frontera

Un juego puede importar desde:

- Su propia carpeta.
- `components/platform`, si necesita UI compartida.
- `lib/platform`, si necesita helpers comunes.

Un juego no deberia importar desde:

- La carpeta de otro juego.
- Archivos internos de rutas de Next.
- Componentes globales que no formen parte del contrato de plataforma.

Si dos juegos necesitan lo mismo, primero se puede duplicar un poco. Si la
necesidad se repite y queda clara, se extrae una utilidad compartida.

## Estados del juego

### `coming-soon`

Visible en el menu, pero no jugable. La card no funciona como link de juego.
La ruta puede mostrar una entrada de preparacion con descripcion y pildoras.

### `playable`

Visible y jugable. Debe tener componente `Game` conectado al manifest o a la
convencion que defina la plataforma.

### `hidden`

No aparece en el menu. Sirve para trabajar un juego sin publicarlo todavia.

## Pildoras visibles

Las pildoras de la card salen de `featurePills`.

Ejemplos:

- `Grupo`
- `Roles`
- `Rapido`
- `Un celular`
- `Cartas`
- `Trivia`

Estas pildoras son texto corto de lectura rapida. No deben ser frases largas.
Los `tags` quedan reservados para usos internos o futuros filtros; por ahora no
son necesarios.

Las pildoras heredan el `accent` del juego. No hay que elegirles color por
separado: si el juego es `rose`, las pildoras se ven rojizas/rosadas; si es
`mint`, se ven verdes.

## Storage

El storage es opcional.

Si un juego guarda estado, debe usar una clave aislada. Convencion:

```txt
fingiendo-jugar:game:[gameId]:state
```

Ejemplo:

```txt
fingiendo-jugar:game:impostor:state
```

Por ahora, volver al menu puede resetear una partida. Mas adelante se puede
agregar "continuar partida", historial o estadisticas.

Para no repetir la convencion a mano, la plataforma expone helpers:

```ts
import {
  clearGameStorage,
  readGameStorage,
  writeGameStorage,
} from "@/lib/platform/storage";

const initialState = readGameStorage("mi-juego", { step: "setup" });

writeGameStorage("mi-juego", {
  step: "playing",
});

clearGameStorage("mi-juego");
```

Estos helpers son para componentes cliente. En server-side devuelven el fallback
o no hacen nada.

## Neon

Neon es opcional por juego.

Si un juego quiere usar datos cargados desde base de datos, puede declarar una
sola tabla propia en su manifest:

```ts
database: {
  provider: "neon",
  tableName: "mi_juego",
  access: "read-only",
}
```

Reglas:

- Un juego puede no usar Neon.
- Si usa Neon, por ahora declara una sola tabla.
- La tabla debe pertenecer conceptualmente a ese juego.
- El nombre de tabla debe ser estable y claro.
- Las credenciales van en variables de entorno, nunca en la carpeta del juego.
- La plataforma decide como leer esa tabla; el juego no deberia abrir conexiones
  por su cuenta si existe un helper compartido.
- Las consultas deben ejecutarse server-side; no desde componentes cliente.
- Si el juego necesita crear o cargar esa tabla, puede incluir SQL en
  `games/[gameId]/database/`.

`access: "read-only"` sirve para juegos que solo consumen contenido cargado,
por ejemplo preguntas, cartas, palabras o desafios. `access: "read-write"` queda
reservado para juegos que realmente necesiten escribir datos.

Ejemplo server-side:

```ts
import { readGameTableRows } from "@/lib/platform/database";

import { miJuegoManifest } from "@/games/mi-juego";

type Row = {
  id: string;
  prompt: string;
};

export async function loadRows() {
  if (!miJuegoManifest.database) {
    return [];
  }

  return readGameTableRows<Row>(miJuegoManifest.database, { limit: 100 });
}
```

Ver tambien `database/README.md`.

Si el juego necesita escribir:

```ts
import { insertGameTableRow } from "@/lib/platform/database";

import { miJuegoManifest } from "@/games/mi-juego";

export async function saveRow() {
  if (!miJuegoManifest.database) {
    return;
  }

  await insertGameTableRow(miJuegoManifest.database, {
    id: crypto.randomUUID(),
    prompt: "Nueva fila",
  });
}
```

Para poder escribir, el manifest debe usar `access: "read-write"`.

## Diseno

Cada juego puede tener personalidad propia.

Debe respetar:

- Buena legibilidad en celular.
- Acciones claras.
- Flujo rapido para reuniones.
- Boton o patron para volver al menu.
- Nada que dependa de una explicacion larga para empezar.

Puede cambiar:

- Colores.
- Icono.
- Layout.
- Componentes.
- Ritmo.
- Animaciones.
- Tipo de interaccion.

## Checklist para crear un juego nuevo

- [ ] Crear `games/[gameId]`.
- [ ] Escribir `manifest.ts`.
- [ ] Exportar el manifest desde `index.ts`.
- [ ] Registrar el manifest en `games/registry.ts`.
- [ ] Decidir estado inicial: `coming-soon`, `playable` o `hidden`.
- [ ] Decidir si usa Neon. Si usa, declarar `database`.
- [ ] Si usa Neon, agregar `database/schema.sql` y `database/seed.sql` si hacen falta.
- [ ] Agregar `README.md` con reglas.
- [ ] Escribir `Game.tsx` solo cuando el juego sea jugable.
- [ ] Agregar datos internos si hacen falta.
- [ ] Agregar assets si hacen falta.
- [ ] Verificar que aparece en el home.
- [ ] Probar `/games/[gameId]` en celular y escritorio.
- [ ] Confirmar que no rompe otros juegos.

## Preguntas antes de implementar un juego

- Cuantas personas juegan.
- Si se juega en un solo celular o en varios dispositivos.
- Si la partida tiene turnos.
- Si hay contador.
- Si hay informacion secreta.
- Si se necesita guardar progreso.
- Que pasa si se recarga la pagina.
- Que datos son fijos y cuales cambian.
- Cual es la accion principal de la pantalla.
- Cuando termina una partida.
- Como se explica en menos de treinta segundos.

## Criterio de calidad

Un juego esta listo cuando:

- Se entiende desde su card.
- Se puede abrir desde el menu.
- Se puede jugar sin leer documentacion tecnica.
- No depende de otro juego.
- Su carpeta explica lo suficiente para mantenerlo.
- Se ve bien en celular.
- Su estado no contamina otros juegos.
