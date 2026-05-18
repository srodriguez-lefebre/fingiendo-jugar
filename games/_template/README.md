# Caso cero para crear un juego

Esta carpeta representa el modelo mental para agregar juegos a Fingiendo Jugar.
No es todavia un juego real: es una guia viva que se ira ajustando cuando exista
la base Next.js y el primer juego implementado.

La idea es que, en el futuro, crear un juego nuevo sea algo parecido a:

1. Copiar `games/_template`.
2. Renombrar la carpeta a `games/mi-juego`.
3. Completar el manifest.
4. Implementar `Game.tsx`.
5. Agregar el manifest al registro.
6. Probar `/games/mi-juego`.

## Que es un juego en este repo

Un juego es una experiencia autocontenida. Puede compartir layout y componentes
de plataforma, pero su logica principal vive dentro de su propia carpeta.

Un juego puede ser:

- De roles ocultos.
- De cartas.
- De numeros.
- De palabras.
- De votacion.
- De memoria.
- De dibujo.
- De azar.
- De un solo dispositivo.
- Con otra dinamica completamente distinta.

La arquitectura no debe asumir que todos los juegos tienen los mismos pasos.

## Estructura sugerida

```txt
games/mi-juego/
  manifest.ts
  Game.tsx
  README.md
  components/
  logic/
  data/
  assets/
```

### `manifest.ts`

Describe el juego para la plataforma.

Debe responder:

- Como se llama.
- Cual es su URL.
- Que descripcion aparece en el menu.
- Cuantos jugadores recomienda.
- Que tags tiene.
- Si esta jugable o escondido.

Ejemplo futuro:

```ts
import type { GameManifest } from "@/lib/platform/game-types";

export const manifest = {
  id: "mi-juego",
  slug: "mi-juego",
  title: "Mi Juego",
  shortDescription: "Una descripcion corta para la card del menu.",
  tags: ["2-8 jugadores", "Rapido", "Celular"],
  status: "playable",
  route: "/games/mi-juego",
} satisfies GameManifest;
```

### `Game.tsx`

Es el componente principal del juego.

Debe encargarse de:

- Mostrar la experiencia jugable.
- Manejar su estado interno.
- Usar sus componentes propios.
- Guardar estado si el juego lo necesita.

No deberia encargarse de:

- Aparecer en el menu.
- Definir la navegacion global.
- Modificar otros juegos.

### `README.md`

Explica el juego para futuros desarrolladores.

Debe incluir:

- Resumen.
- Reglas.
- Flujo de pantallas.
- Decisiones raras o importantes.
- Que datos usa.
- Si guarda estado o no.

### `components/`

UI propia del juego.

Ejemplos:

- Cartas.
- Paneles.
- Botones especiales.
- Marcadores.
- Pantallas internas.

Si un componente solo tiene sentido en este juego, vive aca.

### `logic/`

Reglas puras del juego.

Ejemplos:

- Reducer.
- Motor de turnos.
- Validaciones.
- Sorteos.
- Calculo de resultados.
- Selectores.

Idealmente, esta carpeta deberia poder probarse sin renderizar React.

### `data/`

Contenido especifico del juego.

Ejemplos:

- Categorias.
- Palabras.
- Preguntas.
- Cartas.
- Configuraciones iniciales.

### `assets/`

Archivos visuales o estaticos del juego.

Ejemplos:

- Imagenes.
- Texturas.
- Ilustraciones.
- Sonidos, si algun dia se justifican.

## Reglas de frontera

Un juego puede importar desde:

- Su propia carpeta.
- `components/platform`, si necesita UI compartida.
- `lib/platform`, si necesita helpers comunes.

Un juego no deberia importar desde:

- La carpeta de otro juego.
- Archivos internos de rutas de Next.
- Componentes globales que no formen parte del contrato de plataforma.

Si dos juegos necesitan lo mismo, primero se puede duplicar un poco. Si la
necesidad se repite y queda clara, se extrae una utilidad compartida.

## Storage

El storage es opcional.

Si un juego guarda estado, debe usar una clave aislada. Convencion:

```txt
fingiendo-jugar:game:[gameId]:state
```

Ejemplo:

```txt
fingiendo-jugar:game:impostor:state
```

Por ahora, volver al menu puede resetear una partida. Mas adelante se puede
agregar "continuar partida", historial o estadisticas.

## Diseno

Cada juego puede tener personalidad propia.

Debe respetar:

- Buena legibilidad en celular.
- Acciones claras.
- Flujo rapido para reuniones.
- Boton o patron para volver al menu.
- Nada que dependa de una explicacion larga para empezar.

Puede cambiar:

- Colores.
- Layout.
- Componentes.
- Ritmo.
- Animaciones.
- Tipo de interaccion.

## Checklist para crear un juego nuevo

- [ ] Crear `games/[gameId]`.
- [ ] Escribir `manifest.ts`.
- [ ] Escribir `Game.tsx`.
- [ ] Agregar `README.md` con reglas.
- [ ] Agregar datos internos si hacen falta.
- [ ] Agregar assets si hacen falta.
- [ ] Registrar el manifest en `games/registry.ts`.
- [ ] Verificar que aparece en el home.
- [ ] Probar `/games/[gameId]` en celular y escritorio.
- [ ] Confirmar que no rompe otros juegos.

## Preguntas antes de implementar un juego

- Cuantas personas juegan.
- Si se juega en un solo celular o en varios dispositivos.
- Si la partida tiene turnos.
- Si hay contador.
- Si hay informacion secreta.
- Si se necesita guardar progreso.
- Que pasa si se recarga la pagina.
- Que datos son fijos y cuales cambian.
- Cual es la accion principal de la pantalla.
- Cuando termina una partida.
- Como se explica en menos de treinta segundos.

## Criterio de calidad

Un juego esta listo cuando:

- Se entiende desde su card.
- Se puede abrir desde el menu.
- Se puede jugar sin leer documentacion tecnica.
- No depende de otro juego.
- Su carpeta explica lo suficiente para mantenerlo.
- Se ve bien en celular.
- Su estado no contamina otros juegos.
