# Radar

Dos equipos transmiten una intención a través de una pista oral y disputan puntos
sobre una escala continua de nueve posiciones. Reunión presencial, un solo celular,
al menos cuatro personas y dos por equipo. No se predicen votos ni preferencias.

## Reglas

1. Anoten dos nombres de equipo diferentes, de 1 a 24 caracteres. Elijan 6, 8 o 10
   rondas totales. El equipo 1 comienza y luego se alternan: ambos dan igual cantidad
   de pistas y pronostican igual cantidad de veces.
2. Elijan una persona de cada equipo para empezar. En cada turno propio roten a
   quien da la pista; todos deben dar una antes de repetir. No se cargan miembros,
   así que el grupo lleva esa rotación y la app recuerda el número de turno propio.
3. Solo esa persona abre el objetivo privado (1–9) y el eje. Piensa un ejemplo que
   ubicaría ahí, memoriza el objetivo y lo oculta antes de entregar el celular.
4. Dice su pista oral: una cosa, situación o ejemplo. Sin números, posiciones ni
   gestos que señalen la escala. Luego no orienta la discusión de su equipo.
5. Su equipo debate y fija una de las nueve posiciones. Hasta confirmar puede
   cambiar la elección. La línea continua siempre va del extremo 1 al extremo 9.
6. El rival elige izquierda, derecha o exacto respecto de la posición fijada, y
   confirma para revelar. Izquierda significa objetivo menor; derecha, mayor.
7. El equipo de la pista gana 4/3/2/1 puntos a distancia 0/1/2/3; más lejos gana 0.
   El rival gana 1 por lado correcto o 2 por exacto. Si el objetivo es exacto, ambos
   pronósticos laterales fallan. No se restan puntos.
8. Jueguen todas las rondas. Gana el mayor total; el empate se comparte. El final
   incluye resumen por ronda, revancha con la misma configuración y nueva partida.

## Flujo y privacidad

Configuración → entrega privada → objetivo → ocultar → pista oral → elegir →
pronóstico rival → revelado → siguiente entrega → resultado final.

`getView` proyecta solo lo necesario para la pantalla: no entrega rondas futuras,
ni el objetivo fuera de privado/revelado, ni el historial hasta el final. La UI no
monta una pantalla secreta detrás de la confirmación de salida. Cancelar conserva
la selección y el pronóstico en el motor; la siguiente ronda los limpia.

La privacidad es para el pase normal del celular, no contra alguien que inspeccione
la memoria o herramientas de desarrollo. No hay servidor ni cuentas.

## Interacción y accesibilidad

Una única barra muestra las nueve posiciones, el objetivo rosa y la elección verde
con leyendas de texto. Los botones de 48px debajo se distribuyen en dos filas en
móvil y una fila en escritorio; la barra nunca se divide. Tab/Enter/Espacio permiten
elegir; las flechas recorren posiciones y las teclas Inicio/Fin van a los extremos.
Los cambios de fase enfocan su título. El color se acompaña con texto y formas.
No hay tiempo límite, gestos obligatorios ni animación necesaria.

## Motor, datos y estado

- `logic/engine.ts`: validación, sorteo, puntuación, estado, acciones con versión y
  proyección privada. Los tokens rechazan dobles acciones o acciones de otra fase.
- `data/axes.mjs`: 48 ejes originales locales. Se barajan sin reemplazo; cada ronda
  tiene objetivo uniforme independiente entre 1 y 9. Una revancha puede repetir ejes
  de partidas anteriores, pero nunca dentro de la misma.
- El estado vive solo en memoria. Recargar, confirmar salida o volver al menú borra
  el progreso. No usa localStorage, Neon, APIs, analítica ni dependencias nuevas.
- `logic/engine.test.mjs`: pruebas de configuración, puntajes, privacidad, borradores,
  doble toque, turnos, final, empate, vencedor y revancha con Node 24.

Pruebas del motor: `node --test games/radar/logic/engine.test.mjs`.
