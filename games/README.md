# Juegos

Cada juego de Fingiendo Jugar vive en su propia carpeta:

```txt
games/[gameId]/
```

La carpeta publica del juego debe exponer su manifest desde `index.ts`.

Ejemplo:

```ts
export { impostorManifest } from "./manifest";
```

El registro global esta en `games/registry.ts`. Para sumar un juego al menu, se
importa desde la carpeta del juego:

```ts
import { impostorManifest } from "@/games/impostor";
```

## Brief inicial

Antes de crear la carpeta de un juego, responder estas preguntas. No tienen que
ser largas: sirven para que el juego entre bien en la plataforma desde el primer
commit.

1. Como se llama el juego y cual va a ser su `gameId`/slug?
2. Que frase corta explica la card del menu en una sola idea?
3. Cuales son las 3 pildoras visibles del juego?
4. El juego arranca como `coming-soon`, `playable` o `hidden`?
5. Que color o acento representa al juego?
6. Que icono usa: uno de `lucide-react` o una imagen en `public/games/[gameId]/`?
7. Que va a mostrar la pre-card de entrada antes de jugar?
   Debe incluir descripcion y como se juega, salvo que el juego use `entryMode: "direct"`.
8. Como se juega en terminos simples: que hace el grupo antes, durante y al final?
9. Se juega en un solo celular o necesita varios dispositivos?
10. Necesita guardar progreso local o Neon?
    Si usa Neon, cual es la unica tabla del juego y es `read-only` o `read-write`?

Con esas respuestas se puede completar el `manifest`, decidir la estructura de
la carpeta y evitar que cada juego invente su integracion desde cero.

## Estados

- `coming-soon`: aparece en el menu, no es jugable todavia.
- `playable`: aparece en el menu y puede montar su componente `Game`.
- `hidden`: no aparece en el menu.

## Entrada

Los juegos pueden usar `entryMode`.

- `intro`: muestra una pantalla previa con informacion del manifest.
- `direct`: entra directo al juego.

La card del menu usa `shortDescription`. La pantalla de entrada usa
`description`, que puede ser un texto o una lista de parrafos. La descripcion de
entrada debe explicar como se juega y que opciones importantes tiene el juego,
sin repetir exactamente el texto corto de la card.

La pre-card de entrada es parte del contrato de los juegos con `entryMode:
"intro"`. Antes de llegar al componente jugable, la persona debe poder entender
que va a pasar, como se juega y que decisiones tiene que tomar el grupo. Si esa
pantalla no aporta nada, recien ahi se puede considerar `entryMode: "direct"`.

## Identidad visual

Cada juego elige su identidad de plataforma desde el manifest:

```ts
import { Music } from "lucide-react";

export const miJuegoManifest = {
  // ...
  accent: "mint",
  icon: Music,
} satisfies GameManifest;
```

`accent` define los colores de card, entrada, boton de empezar y pildoras.
`icon` define el loguito visible en card y entrada. Si no se declara icono, se
usa uno generico. Si el juego usa una imagen propia, puede declarar `iconImage`
con una ruta publica.

Acentos disponibles:

- `violet`
- `rose`
- `mint`
- `amber`
- `nightclub`

Si hace falta otra tonalidad, se agrega un nuevo valor a `GameAccent` y una clase
`.game-theme--nuevo-color` en `app/globals.css`.

Ejemplo con imagen:

```ts
export const miJuegoManifest = {
  // ...
  accent: "nightclub",
  iconImage: {
    src: "/games/mi-juego/icon.png",
    alt: "Icono de Mi Juego",
  },
} satisfies GameManifest;
```

## Base de datos

Un juego puede no usar base de datos. Si la usa, puede declarar una tabla Neon en
su manifest con `database`.

Ver tambien:

- `games/_template/README.md`
- `database/README.md`

## Storage local

Si un juego quiere guardar progreso en el navegador, debe usar una clave aislada
por juego. La plataforma ofrece helpers en `lib/platform/storage.ts` para leer,
escribir y limpiar estado con la convencion:

```txt
fingiendo-jugar:game:[gameId]:state
```
