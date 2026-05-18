# Impostor

Juego de roles ocultos para jugar en grupo con un solo celular.

## Reglas

1. Se cargan entre 3 y 12 jugadores.
2. La app sortea una palabra secreta dentro de la categoria elegida.
3. Todos ven la palabra, excepto los impostores.
4. En modo normal, el impostor ve que es impostor, la categoria y una pista.
5. En modo confundido, cada impostor recibe una palabra falsa distinta de la misma categoria.
6. Si se activa ocultar pista, las pantallas privadas no muestran pistas.
7. Cuando todos vieron su pantalla privada, empieza el timer.
8. El grupo juega fuera de la app: hablan, tiran pistas y sospechan.
9. Al terminar, se revela la palabra secreta y quienes eran los impostores.

## Flujo

- Configuracion: jugadores, categoria, timer, cantidad de impostores, modo confundido y pistas.
- Revelado: el celular se pasa jugador por jugador; cada uno toca Ver y luego Ocultar.
- Timer: de 1 a 10 minutos, con boton para revelar antes.
- Resultado: palabra secreta e impostores.

## Datos

Las palabras viven en Neon, en la tabla `impostor`. El juego carga la lista de
categorias desde `/api/games/impostor/categories` y, al empezar una ronda, pide
solo las palabras necesarias desde `/api/games/impostor/words`.

No usa storage local. Si se recarga la pagina, la ronda se pierde.
