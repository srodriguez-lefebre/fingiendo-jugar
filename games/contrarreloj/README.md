# Contrarreloj

Juego por equipos inspirado en la dinamica de pensar rapido y describir bajo
presion de tiempo.

## Resumen

Contrarreloj se juega desde un solo dispositivo. La app funciona como tablero,
cronometro y mesa de control. Cada turno, un equipo pide una carta con 5
palabras o frases al azar. Una persona del equipo describe la carta y el resto
intenta adivinar antes de que termine el tiempo.

## Reglas base

- Se juega con 2 a 5 equipos.
- Solo se cargan nombres de equipos, no jugadores individuales.
- Cada carta contiene 5 palabras o frases.
- El cronometro global de la partida es configurable.
- La carta queda tapada hasta que se toca "Dar vuelta la carta".
- Al dar vuelta la carta, se muestran las 5 frases juntas y arranca el timer.
- Cuando termina el tiempo suena una alerta, pero la carta sigue visible para
  corroborar aciertos.
- No hay penalizaciones automaticas.
- La mesa mueve las fichas manualmente: puede avanzar o retroceder cualquier
  equipo.
- Gana el primer equipo que llega a la meta del tablero.

## Flujo de pantallas

1. Setup: definir equipos, tiempo por carta y largo del tablero.
2. Juego: tablero horizontal con scroll, controles manuales por equipo y carta
   de ronda.
3. Carta: pedir una carta, darla vuelta, esperar el timer y corroborar.
4. Final: cuando un equipo llega a la meta, la pantalla marca ganador. La mesa
   puede reiniciar el tablero o seguir moviendo piezas si lo necesita.

## Datos

El juego declara una tabla Neon unica:

```ts
{
  provider: "neon",
  tableName: "contrarreloj",
  access: "read-only",
}
```

La tabla guarda palabras/frases sueltas en la columna `phrase`. El endpoint
`/api/games/contrarreloj/card` recupera 5 al azar. Mientras no exista la DB o no
se haya cargado el JSON definitivo, el endpoint usa un mock local de desarrollo.

## Persistencia

No guarda estado local. Si se recarga la pagina, la partida se reinicia. Como el
tablero es manual, la mesa puede mover las piezas hasta reconstruir el estado.
