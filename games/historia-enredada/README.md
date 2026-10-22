# Historia enredada

Una historia cooperativa que se complica con cada persona. El grupo pasa un
celular y agrega frases con una palabra obligatoria y un giro narrativo.

## Brief previo

1. **Nombre / slug:** Historia enredada / `historia-enredada`.
2. **Card:** Inventen un cuento entre todos: una frase, una palabra obligatoria y un giro inesperado por turno.
3. **Píldoras:** `2–8 personas`, `Crear historias`, `Un celular`.
4. **Estado:** `playable`.
5. **Acento:** `violet`, con una libreta violeta en el juego.
6. **Ícono:** `NotebookPen` de Lucide.
7. **Entrada:** `intro`; explica la creación por turnos, palabras, pases,
   duración, ambientes y final. El botón Empezar lleva a la configuración.
8. **Dinámica:** se cargan los nombres y el ambiente. Cada persona lee la
   historia, incorpora su palabra y sigue la consigna en una frase; al final
   leen juntos el cuento completo. No hay votaciones ni equipos.
9. **Dispositivos:** un solo celular; de 2 a 8 personas, 2 o 3 rondas.
10. **Persistencia / Neon:** ninguna. El estado vive en memoria. Recargar,
    salir al menú o cambiar la configuración descarta la historia actual.

## Reglas

- Todos escriben una vez por ronda, siempre en el orden configurado.
- Elegís misterio barrial, ciencia ficción casera o comedia absurda.
- Cada turno combina una palabra obligatoria con una consigna narrativa.
- Escribís entre 5 y 30 palabras, hasta 360 caracteres. La palabra debe aparecer
  completa y en singular tal como figura; se aceptan mayúsculas y diferencias
  de tildes, pero `ñ` sigue siendo distinta de `n`.
- La app verifica extensión y palabra. El grupo cuida que la frase siga el
  cuento y la consigna: esa parte creativa no se evalúa automáticamente.
- Podés pasar: consume el turno y no suma una frase. No se pierde nada de lo
  que ya escribió el grupo.
- El primer turno presenta un protagonista y un problema; el último pide un
  cierre. La premisa inicial existe aunque alguien pase.
- Las palabras y consignas intermedias no se repiten durante una partida.
- Cada frase válida suma un desafío cumplido al grupo. El resultado muestra
  frases/turnos totales, pases, autores y el cuento completo. Si pasan todos,
  queda la premisa y un mensaje invita a otra historia. No hay ganador
  individual ni desempates.

## Pantallas

Entrada → configuración → pasar el celular → escribir → pasar el celular… →
historia terminada. El encabezado indica persona, ronda y progreso. La historia
se puede consultar durante cada turno. El final ofrece Otra historia (mismos
ajustes, nuevo sorteo) y Cambiar configuración. Volver al menú está siempre
disponible.

## Implementación y datos

`logic/engine.ts` concentra validación, sorteos sin reemplazo y transiciones
puras. Cada acción incluye el número de turno: los clics repetidos o acciones
tardías no agregan frases/puntos extra. `data/content.ts` tiene tres premisas,
40 palabras y 28 giros originales. `Game.tsx` administra la UI; `Game.module.css`
solo afecta este juego. No hay cronómetros, peticiones de red ni dependencias
nuevas.

## Verificación

```powershell
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test games/historia-enredada/logic/engine.test.mjs
npm run lint
npm run build -- --webpack
```

Webpack permite verificar en worktrees cuyo `node_modules` es un junction fuera
del root que acepta Turbopack. No cambia la configuración de producción.
