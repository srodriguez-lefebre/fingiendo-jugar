# Sintonía

## Brief inicial

1. **Nombre/slug:** Sintonía, `sintonia`.
2. **Card:** «Elegí tu lado y predecí cuántas personas piensan como vos.»
3. **Tres píldoras:** `3–10 personas`, `Predicciones`, `Un celular`.
4. **Estado:** `playable` desde el primer lanzamiento.
5. **Acento:** `mint`, con paneles oscuros y un medidor A/B propio.
6. **Ícono:** `Radio` de Lucide.
7. **Entrada:** `intro`; explica votos privados, pronósticos, puntos, doble y las opciones de rondas y mazo.
8. **Reglas:** cargar nombres, leer un dilema, pasar el celular para votar A/B y pronosticar el total de A; revelar, puntuar y seguir hasta el resultado final.
9. **Dispositivos:** un único celular que se pasa entre participantes.
10. **Persistencia/Neon:** estado en memoria, sin servicios ni base de datos. Recargar o volver al menú descarta la partida.
11. **Contenido propio:** 42 dilemas originales, motor, pruebas, interfaz y CSS Module dentro de esta carpeta.

## Reglas

- Juegan de 3 a 10 personas con nombres únicos de hasta 24 caracteres.
- Elijan 5, 8 o 12 rondas y un mazo: mezclado, cotidiano, planes o dilemas.
- Lean las opciones A/B en grupo y piensen su respuesta sin debatir todavía.
- En su turno, cada persona recibe el celular, abre su pantalla privada, vota A o B y predice **cuántas personas del grupo elegirán A, incluyéndose**. El pronóstico debe ser compatible con su propio voto.
- Un pronóstico exacto vale 3 puntos; errar por una persona vale 1; cualquier otra distancia vale 0. El voto personal no tiene premio: elegí tu preferencia.
- Cada persona dispone de un doble por partida. Si lo activa antes de confirmar, los puntos de esa ronda se multiplican por dos. Se consume incluso con 0 puntos.
- Las respuestas confirmadas no se pueden cambiar y permanecen ocultas durante los turnos. Tras el último voto, se muestra el reparto A/B, todos los pronósticos y los puntos.
- Gana quien tenga más puntos al terminar. Los empates se comparten, incluso si todas las personas terminan con cero.

## Flujo y decisiones

Configuración → dilema de ronda → entrega del celular → voto y pronóstico privado → siguiente entrega → revelación → nueva ronda → podio final. Se puede consultar el marcador después de cada revelación, jugar una revancha con la misma configuración o cambiar el grupo. Abandonar una partida en curso requiere una confirmación dentro del juego. Cancelar esa confirmación conserva el voto, el pronóstico y el doble que se estaban preparando; la pantalla privada permanece montada pero oculta mientras se confirma la salida.

`logic.ts` contiene las reglas puras. Las acciones incluyen ronda y turno para ignorar confirmaciones viejas o repetidas. La puntuación se aplica una sola vez, al recibir el último voto. No hay temporizadores, red, almacenamiento ni dependencias entre juegos.

`data.ts` contiene 14 dilemas por mazo, más que la partida máxima de 12. Se barajan al iniciar y no se repiten dentro de una partida. Una revancha vuelve a barajar.

## Verificación

```powershell
node --test games/sintonia/tests/logic.test.mjs
npm run lint
npm run build -- --webpack
```

El build normal usa Turbopack; en worktrees con `node_modules` apuntando mediante junction a otro checkout, se usa Webpack para evitar la restricción de raíz de Turbopack. El checkout principal puede verificar el build normal.
