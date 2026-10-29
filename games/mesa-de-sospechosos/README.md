# Mesa de sospechosos

Juego cooperativo de lógica para un grupo alrededor de un celular. Hay que reconstruir una fila de asientos numerados a partir de testimonios verdaderos. No se acusa a nadie ni se necesita trivia. El tema del expediente es ambientación original; el objetivo jugable siempre es ordenar la mesa.

## Reglas

- Primer caso usa 4 sospechosos; Detectives, 5; Mesa experta, 6. El elenco tiene ocho nombres distintos y símbolos diferenciables. No hay alta de personas ni nombres vacíos o repetidos.
- Los asientos forman una fila del 1 al N, siempre visible sin envolver en otra fila. El primero y el último no son vecinos. Las pistas usan números menores, asientos consecutivos, cantidad exacta de personas entre dos sospechosos, ubicación entre otros dos y exclusión de asiento. Primer caso puede dar una ubicación exacta como ancla, nunca más de una.
- Todos debaten y una persona acomoda las fichas. No hay reloj, roles privados, turnos individuales ni empates individuales. Se toca una ficha y otra para intercambiarlas; tocar la misma cancela. También se puede seleccionar con Tab y Enter/Espacio y usar Anterior/Siguiente. Las flechas intercambian con el vecino, sin duplicar ni dejar asientos vacíos.
- Marcar un testimonio es una anotación manual; no revela si se cumple. No hay evaluación automática mientras se mueve el tablero.
- Se empieza con 100 puntos posibles y hasta tres comprobaciones. Cada orden equivocado cuesta 10 puntos e informa cuántas pistas y ayudas incumple, sin identificar cuáles. Repetir un orden ya comprobado no consume otro intento. Un acierto incluso en el tercer intento gana.
- Hasta dos ayudas, confirmadas antes de comprarlas, cuestan 15 puntos cada una. Revelan una ubicación exacta que no repite otra ayuda ni una ubicación ya explícita en los testimonios. Se priorizan personas que estén mal ubicadas. No mueven la mesa ni consumen comprobaciones. Al cambiar la evidencia se borra el feedback de la comprobación anterior, que ya no describe todas las pistas visibles.
- Al acertar se ganan los puntos restantes. Al tercer error o al confirmar Revelar, el caso termina con 0 puntos. Se muestran la única solución, los asientos que justifican cada pista y la última hipótesis para comparar. Todos ganan o pierden juntos.
- Otro caso conserva dificultad y reinicia tablero, intentos, ayudas y marcas; también se puede cambiar de dificultad. Salir de un caso abierto pide confirmación, también al usar Atrás del navegador/celular. Cancelar conserva incluso la selección y las marcas. Escape y el botón de cierre también cancelan. Una entrada protectora con la misma URL intercepta Atrás antes de desmontar el juego; conserva el estado del router, se reutiliza en revanchas y se salta al confirmar o al salir de un caso terminado.

## Datos y generación

`data/cases.ts` contiene seis ambientaciones originales. El elenco, vocabulario y relaciones viven en `logic/engine.ts`. La semilla de 32 bits se obtiene localmente con Web Crypto al abrir un caso; las reglas no dependen de React ni del navegador.

La generación siempre termina: enumera como máximo 6! = 720 órdenes, construye una cantidad finita de afirmaciones ciertas y las recorre una vez, descartando órdenes incompatibles. El conjunto candidato incluye todas las relaciones de precedencia del orden real, lo que garantiza alcanzar una única solución. Luego poda cualquier pista redundante; cada testimonio publicado aporta información. No hay reintentos aleatorios ni búsquedas sin límite. Las dificultades cambian la cantidad de personas y habilitan relaciones «entre» a partir de cinco; no prometen un tiempo fijo de resolución.

La mesa inicial nunca coincide con la solución. Las acciones incluyen revisión y semilla del caso para ignorar doble toque y eventos viejos, también después de cambiar de caso. Los estados anteriores no se mutan.

## Pantallas e integración

Intro de plataforma → dificultad → expediente con tablero y testimonios → comprobación / ayuda / revelado → solución explicada → otro caso o dificultad. El manifest es `playable`, entrada `intro`, acento `violet`, icono `ScanSearch`. La única integración compartida es la entrada de `games/registry.ts`; el manifest y componente se exportan desde `index.ts`.

CSS Module propio, botones de 44px como mínimo, estado seleccionado anunciado y visible por forma/texto, diálogo modal nativo, foco visible, numeración constante, selección con teclado y respeto de movimiento reducido. No requiere arrastrar fichas.

No usa Neon, APIs, IA remota, almacenamiento, dependencias extra ni assets descargados. Todo vive en memoria; recargar o volver al menú pierde el caso. Se aclara en intro, preparación y pie de juego.

## Verificación

`node --test games/mesa-de-sospechosos/logic/engine.test.mjs` comprueba las relaciones con ejemplos literales, límite de 720 órdenes, 600 casos/semillas en tres dificultades, unicidad y ausencia de pistas redundantes, setup inválido, tablero válido, intercambios, inmutabilidad, acciones viejas/repetidas, intentos distintos, ayudas no repetidas, puntaje, victoria al tercer intento, derrota, revelado y reinicio.

`node --test games/mesa-de-sospechosos/logic/navigation.test.mjs` comprueba la confirmación de Atrás, cancelación sin cambiar URL/estado del router ni acumular entradas, navegación confirmada, casos terminados, revancha y limpieza de listeners. La integración con el historial real de Next se verifica en navegador.

La prueba visual debe cubrir un caso completo, la fila de seis fichas en 360px, intercambio por dos toques y por botones con teclado, anotación de pistas, compra/cancelación de ayuda, cancelación de salida preservando tablero y marcas, revelado/derrota y revancha limpia.
