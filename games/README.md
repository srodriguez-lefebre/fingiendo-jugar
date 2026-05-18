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
