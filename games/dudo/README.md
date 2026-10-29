# Dudo

Farol y lectura de la mesa para 2–8 personas, desde un solo celular. Slug `dudo`, acento mint e icono Dices. Todos los datos y reglas son locales; no hay consultas, base de datos, guardado ni servicios externos.

## Reglas

- Cada persona recibe 3 dados normales. No hay comodines ni eliminación.
- Se eligen una o dos vueltas: N o 2N rondas. La apertura rota en orden, así cada persona abre exactamente una o dos veces. Dos vueltas es el valor inicial para dar más oportunidades al farol.
- Quien abre apuesta que hay **al menos** cierta cantidad de una cara entre todos los dados. La siguiente persona sube la cantidad, o mantiene la cantidad y sube la cara (2 de 4 → 2 de 5; 2 de 4 → 3 de 1). La cantidad no puede superar el total de dados.
- En lugar de subir, puede decir Dudo a la última apuesta. Si la cantidad real alcanza lo apostado, quien apostó gana 2 puntos. Si no alcanza, quien desafió gana 2. El resto suma 0. Una cantidad exacta alcanza. El uno solo cuenta como uno.
- Se muestran todas las manos y se destacan los dados que suman al conteo. Cada ronda reparte dados nuevos y conserva los puntos. La apuesta máxima deja únicamente la opción de desafiar.
- Después del último revelado aparece el resultado. Gana el mayor puntaje; los empates se comparten sin desempate por azar. La revancha conserva grupo/duración y reinicia dados, puntos, rondas e historial.

## Flujo y privacidad

Intro de plataforma → nombres y vueltas → entrega opaca a quien abre → ver solo sus tres dados → apostar → entrega opaca a la siguiente persona. Dudo lleva al revelado público, luego a la siguiente ronda o al resultado.

El selector público excluye todas las manos salvo durante el revelado. `privateHand` devuelve una copia únicamente para la persona activa durante su turno. Las manos ajenas nunca se montan en el DOM antes del desafío. Esto es privacidad al pasar el celular, no seguridad frente a herramientas de desarrollo: el juego corre completamente en el navegador.

Salir abre una confirmación que desmonta la mesa privada. Cancelar (o Escape) conserva la partida y el borrador exacto de cantidad/cara; no se manda una acción al motor. Los nombres y la apuesta preparada viven en el componente principal, fuera del contenido desmontable. Salir al menú o recargar pierde la partida; se informa en intro y en el juego.

## Decisiones

- Tres dados producen manos fáciles de memorizar y un conteo corto. Las aperturas equilibradas y rondas fijas mantienen a todo el grupo hasta el final.
- Sin dinero, apuestas económicas ni premios. «Apuesta» es una declaración sobre dados. El puntaje recompensa por igual sostener una apuesta y detectar un farol.
- El motor puro recibe las manos. La UI genera tiradas una vez por acción usando `Math.random`; ni reglas ni pruebas dependen de React o del azar global. Estado en memoria, máximo 24 dados y 16 rondas.
- Todas las acciones usan una versión monótona; repetir una acción o enviarla tras cambiar de fase no mueve turnos ni duplica puntos. La revancha continúa el contador para rechazar acciones de la partida anterior.
- La selección tiene botones y rango nativos para teclado/táctil, objetivos de al menos 44px, foco visible, nombres accesibles para dados, conteos en texto y animación opcional con movimiento reducido.

## Verificación

`node --test games/dudo/logic/engine.test.mjs` comprueba límites de setup y tiradas, apuestas crecientes, manos ocultas, desafíos de ambos resultados, máximos, acciones inválidas/repetidas, rotación de 2–8 personas, final, empate y revancha. No agrega dependencias.

Para probar en navegador: dos nombres, una vuelta; abrir dados, apostar 1 de 1, entregar, Dudo, mirar conteo, nueva ronda, apostar y desafiar, resultado, revancha. Probar cambiar cantidad/cara, abrir Salir y cancelar: el borrador y los dados deben conservarse y desaparecer mientras la confirmación está abierta. Tab y flechas operan toda la partida.
