# Base de datos

Fingiendo Jugar puede usar Neon como base de datos compartida, pero ningun juego
esta obligado a usarla.

## Variables de entorno

Localmente se usa `.env.local`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

En Vercel, la misma variable debe cargarse como Environment Variable.

Nunca se commitean credenciales reales. El repo solo versiona `.env.example`.

## Regla por juego

Cada juego puede declarar como maximo una tabla Neon en su manifest:

```ts
database: {
  provider: "neon",
  tableName: "mi_juego",
  access: "read-only",
}
```

Si el juego no necesita base de datos, no declara `database`.

## SQL por juego

Si un juego necesita crear o cargar su tabla, puede incluir archivos SQL dentro
de su propia carpeta:

```txt
games/[gameId]/database/
  schema.sql
  seed.sql
```

La plataforma no ejecuta estos archivos automaticamente todavia. Funcionan como
contrato y punto de partida para migraciones o carga manual controlada.

## Acceso

Los juegos no deben conectarse a Neon directamente desde componentes cliente.
Las lecturas/escrituras deben pasar por codigo server-side y por helpers
compartidos de `lib/platform/database.ts`.

Helpers disponibles:

- `readGameTableRows(config, { limit })`
- `insertGameTableRow(config, row)`
- `assertGameCanWrite(config)`

`insertGameTableRow` solo funciona si el manifest declara `access: "read-write"`.

## Nombres de tabla

Usar `snake_case` en minusculas:

- `impostor`
- `trivia_cartas`
- `codigo_rojo`

Evitar nombres genericos como `data`, `items` o `game`.
