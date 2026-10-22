# Último Botín

## Brief previo

1. Nombre y slug: **Último Botín**, `ultimo-botin`.
2. Card: «Junten tesoro, midan el riesgo y decidan cuándo volver antes de perderlo todo».
3. Píldoras: `2–8 personas`, `Cooperativo`, `Riesgo`.
4. Estado: `playable`.
5. Acento: `amber`.
6. Ícono: `Compass` de Lucide.
7. Entrada: explica las expediciones, el botín pendiente, los peligros repetidos,
   la cuerda de un solo uso y la duración elegible.
8. Antes: anotan sus nombres y eligen 3, 5 o 7 expediciones. Durante: debaten
   seguir o guardar; quien tiene la capitanía registra la decisión. Al final:
   comparan el tesoro seguro con el objetivo grupal y pueden jugar otra vez.
9. Un solo celular, visible para todo el grupo.
10. Sin persistencia ni Neon. Recargar o volver al menú reinicia la partida.
11. Reglas, hallazgos, motor y estilos propios dentro de esta carpeta.

## Reglas

- Juegan de 2 a 8 personas, cooperando. La capitanía rota por orden de nombres
  entre expediciones; recibe el celular y registra lo que acuerde el grupo.
- Elijan 3, 5 o 7 expediciones, con objetivos de 40, 65 o 90 monedas.
- Cada expedición mezcla nuevamente 18 hallazgos: 12 tesoros (3, 4, 5, 7 o 9
  monedas) y 6 peligros (dos grietas, dos derrumbes y dos nieblas).
- Explorar revela un hallazgo. Los tesoros suman al botín pendiente. El primer
  peligro de cada tipo avisa; la segunda aparición de ese tipo causa un accidente.
- Después de un hallazgo seguro pueden guardar el botín y terminar la expedición,
  o explorar otra vez. El tesoro guardado nunca se pierde.
- Un accidente pierde solamente el botín pendiente. El grupo puede gastar su única
  cuerda para rescatar la mitad, redondeada hacia abajo, y cerrar la expedición.
  Si no alcanza para rescatar una moneda, la cuerda no se puede gastar.
- El riesgo mostrado es la cantidad de peligros repetidos que quedan dividida
  entre todos los hallazgos restantes. Un peligro nuevo todavía no causa pérdida.
- Si se agotan los hallazgos sin accidente, la expedición guarda todo automáticamente.
- La partida siempre juega todas las expediciones. Llegar al objetivo es una
  victoria compartida; si falta tesoro, pueden probar otra estrategia en la revancha.

## Flujo y decisiones técnicas

Entrada de plataforma → configuración → exploración/accidente → resumen de cada
expedición → siguiente capitanía → resultado final → revancha o configuración.

El motor puro vive en `logic/engine.ts`. Recibe el mazo ya mezclado, por lo que
las pruebas usan secuencias controladas sin simular React. Cada acción incluye
la versión del estado que vio quien tocó el botón: una segunda acción con esa
misma versión se ignora, incluso si se reevalúa un updater de React.

El azar se genera en el handler, fuera de los updaters. Los estilos quedan
aislados en `Game.module.css`; no se modifica la plataforma ni otros juegos.

## Verificación

`node --test games/ultimo-botin/logic/engine.test.mjs` prueba validación,
puntuación, peligros, cuerda, riesgo, cierre, capitanía y acciones repetidas.
También se ejecutan `npm run lint` y la compilación de Next.js. En el worktree
con node_modules como junction, Turbopack rechaza el enlace externo; la
compilación equivalente se verifica con `npm run build -- --webpack`.
