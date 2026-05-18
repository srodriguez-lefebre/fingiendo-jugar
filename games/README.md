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
