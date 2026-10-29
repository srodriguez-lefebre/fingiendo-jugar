# Teléfono dibujado

Juego local de dibujo y reinterpretación para 2–8 personas en un solo dispositivo.
Una idea secreta se transforma en dibujos y frases; el premio es abrir el álbum juntos.

## Reglas y flujo

1. Anoten nombres diferentes, sentados en ese orden. Elijan 1, 2 o 3 cadenas.
2. Una pantalla sellada indica a quién pasarle el celular. Solo esa persona abre la entrega.
3. La primera recibe una idea local y la dibuja sin palabras. La siguiente ve solo ese dibujo y escribe lo que interpreta (hasta 120 caracteres). La siguiente dibuja esa frase, y así alternan.
4. Cada persona contribuye una vez por cadena. La cadena siguiente empieza una posición más adelante; las funciones de dibujar/describir también rotan. Con un grupo impar, la última entrega es un dibujo.
5. No se entregan textos ni dibujos vacíos. Un punto cuenta como dibujo. «Me trabé, prefiero pasar» pide confirmación y registra un pase; la siguiente persona inventa una frase o dibujo para seguir. Volver del pase conserva el borrador.
6. Todas las cadenas se mantienen selladas hasta terminar la partida. El álbum revela cada entrega de a una, con su autor, el original y los pases. Se puede cambiar de cadena y volver a recorrerla.
7. No hay reloj, puntos, ganadores ni desempate. El final ofrece otra partida con el mismo grupo o cambiar configuración.

## Dibujo táctil y teclado

`DrawingBoard` usa SVG nativo, cuatro colores y tres grosores. Mantiene todos los trazos en estado React controlado por el juego, sin bitmaps. Deshacer quita el último trazo; limpiar pide confirmación.

- Dedo, mouse o lápiz: presionar y arrastrar en la hoja; se captura el puntero. `pointerup`, `pointercancel` y pérdida de captura terminan el trazo sin borrar los puntos ya registrados. Un segundo puntero no interfiere.
- Teclado: botón **Teclado** enfoca «Hoja para dibujar». **Espacio** apoya el lápiz; las **flechas** trazan (15 unidades). **Shift + flecha** avanza 50 unidades. **Espacio** o **Escape** levanta el lápiz para mover el cursor sin dibujar. **Tab** sale. La posición y el estado del lápiz se anuncian. Así se pueden dibujar formas completas y líneas separadas sin mouse.
- Prueba rápida con `locator.press`: enfocar la hoja; `Space`, `Shift+ArrowRight`, `Shift+ArrowDown`, `Shift+ArrowLeft`, `Shift+ArrowUp`, `Space`. Se forma un cuadrado, el botón «Sellar dibujo» se habilita y «Deshacer» lo elimina.
- Las coordenadas se guardan como pares enteros normalizados en un plano 1000×700. La hoja conserva esa proporción y redibuja al cambiar tamaño; no se pierde nada en resize o al cancelar salida.
- Máximo **64 trazos × 160 puntos** por dibujo. Cada muestra nueva pasa por `appendStrokePoint`, compartido por puntero y teclado: al superar 160, descarta el vértice con menor distancia al segmento entre sus vecinos, conservando los extremos y los giros con más información. Solo evalúa 161 puntos transitorios; no hay un buffer crudo creciente ni remuestreo uniforme repetido. Es una aproximación geométrica, no conserva cada oscilación de un gesto arbitrariamente largo. Al llegar a 64 trazos se explica cómo deshacer o entregar. Máximo 3 cadenas × 8 contribuciones, por lo tanto 12 dibujos en una partida de 8 personas: 122.880 pares de coordenadas como máximo.

## Privacidad, memoria y decisiones

Los borradores viven en `Game.tsx`. Durante confirmaciones se desmonta la pantalla privada: ni la frase ni el dibujo aparecen en el título, en el pase del celular o en la confirmación. Cancelar vuelve a montar la hoja con los mismos trazos y la descripción intacta. Al sellar o pasar se limpia el borrador. El selector `getTurn` expone la entrega anterior exclusivamente en fase `create`; `getGallery` solo entrega el historial al finalizar.

Todo queda en memoria. No usa storage, Neon, API, subida de imágenes ni dependencias nuevas. Recargar, navegar al menú o confirmar abandono borra la partida; se advierte en intro y setup. Los prompts originales están en `data/prompts.ts` y se mezclan sin repetirse dentro de una partida. El motor puro recibe una sesión y acciones con token de sesión/cadena/turno; rechaza dobles clics, acciones viejas y acciones tardías.

Los archivos específicos viven en esta carpeta; el único cambio compartido es una entrada en `games/registry.ts`. El manifest usa `playable`, entrada `intro`, acento `amber` e icono `PencilLine`.

## Validación

`node --test games/telefono-dibujado/logic/engine.test.mjs` comprueba setup, alternancia/rotación para 2–8 participantes, privacidad, vacíos, pases, límites/normalización, copia del historial, undo y partida completa/reinicio. Las regresiones del mismo helper usado por `DrawingBoard` reproducen un círculo de 721 muestras con cobertura de toda la curva, un giro collinear de ida/vuelta y la pérdida de captura de un segundo dedo ignorado: solo el puntero dueño puede terminar su trazo, sin borrar los puntos ya confirmados. El controlador verifica además móvil y escritorio en navegador, dibujo por puntero/teclado, resize/pointercancel y borradores al cancelar salida.
