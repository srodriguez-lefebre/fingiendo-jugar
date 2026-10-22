import type { Category, Prompt } from "./logic";

const cotidiano: [string, string, string][] = [
  ["Arranca un día libre. ¿Qué elegís?", "Levantarte temprano y aprovecharlo", "Dormir hasta que el cuerpo quiera"],
  ["Llega un mensaje de tres minutos. ¿Cómo respondés?", "Con otro audio", "Por escrito"],
  ["Tenés una serie favorita. ¿Cómo la mirás?", "Un capítulo por noche", "Varios de una sentada"],
  ["En la cocina, ¿qué te representa más?", "Seguir la receta", "Improvisar con lo que hay"],
  ["Para trabajar o estudiar, ¿qué preferís?", "Música de fondo", "Silencio"],
  ["Se corta internet toda la tarde. ¿Qué hacés primero?", "Salís a dar una vuelta", "Te quedás con algo pendiente"],
  ["Cuando encontrás un lugar que te encanta, ¿qué hacés?", "Volvés siempre al mismo", "Buscás otro para descubrir"],
  ["Una comida tiene que ganar para siempre. ¿Cuál?", "Algo dulce", "Algo salado"],
  ["Para ordenar tus cosas, ¿cuál es tu estilo?", "Un poco todos los días", "Una gran limpieza cada tanto"],
  ["Te ofrecen aprender algo nuevo hoy. ¿Qué elegís?", "Un instrumento", "Una receta espectacular"],
  ["Te esperan veinte minutos de viaje. ¿Qué hacés?", "Escuchás algo", "Mirás por la ventana"],
  ["¿Qué pequeño lujo elegirías para tu casa?", "Una ducha increíble", "Una cama increíble"],
  ["Aparece una foto vieja tuya. ¿Qué preferís?", "Compartirla con el grupo", "Guardarla para vos"],
  ["Al terminar un buen libro, ¿qué hacés?", "Lo recomendás enseguida", "Te quedás pensándolo en silencio"],
];

const planes: [string, string, string][] = [
  ["Hay un fin de semana libre. ¿Dónde te vas?", "A la playa", "Al campo"],
  ["Sale un viaje con amigos. ¿Cómo lo organizás?", "Reservás todo antes", "Dejás lugar para improvisar"],
  ["La noche recién empieza. ¿Qué plan elegís?", "Cena larga y charla", "Música y baile"],
  ["Llueve justo antes de salir. ¿Qué preferís?", "Mantener el plan", "Armar algo en casa"],
  ["Solo podés hacer una salida este mes. ¿Cuál?", "Un concierto", "Una escapada de un día"],
  ["Un viaje soñado tiene una condición. ¿Cuál aceptás?", "Ir lejos pero por pocos días", "Ir cerca pero por un mes"],
  ["Te toca elegir la juntada. ¿Qué armás?", "Un grupo chico", "Que venga todo el mundo"],
  ["La sobremesa se alarga. ¿Qué proponés?", "Un juego", "Otra ronda de historias"],
  ["Para conocer una ciudad nueva, ¿qué elegís?", "Recorrer a pie sin ruta", "Seguir un recorrido armado"],
  ["Quedan entradas para dos planes. ¿Cuál comprás?", "Una comedia", "Un espectáculo de misterio"],
  ["Te proponen una aventura. ¿Qué te entusiasma más?", "Algo en el agua", "Algo en las alturas"],
  ["Hay que organizar un cumpleaños. ¿Qué elegís?", "Preparar una sorpresa", "Preguntarle qué quiere hacer"],
  ["De vacaciones, ¿qué momento cuidás más?", "El amanecer", "El atardecer"],
  ["Una juntada necesita comida. ¿Qué resolvés?", "Cocinar entre todos", "Pedir y olvidarse del tema"],
];

const dilemas: [string, string, string][] = [
  ["Te regalan una habilidad por un día. ¿Cuál?", "Hablar cualquier idioma", "Tocar cualquier instrumento"],
  ["Podés repetir una experiencia perfecta. ¿Qué elegís?", "Un viaje", "Una conversación"],
  ["Una máquina te ofrece un cambio. ¿Cuál aceptás?", "Una hora extra cada día", "No volver a hacer filas"],
  ["Tenés que vivir una semana en otro mundo. ¿Cuál?", "Un futuro con robots", "Un pasado con castillos"],
  ["Podés dominar un talento nuevo. ¿Qué preferís?", "Dibujar lo que imaginás", "Contar historias que atrapan"],
  ["Te ofrecen una puerta especial. ¿A dónde va?", "A un lugar nuevo cada vez", "A tu lugar favorito siempre"],
  ["Un botón te cambia la rutina. ¿Qué hace?", "Termina las tareas de la casa", "Resuelve todos los trámites"],
  ["Podés conocer algo del futuro. ¿Qué elegís?", "Una gran noticia del mundo", "Un día cualquiera de tu vida"],
  ["Durante un año, ¿qué compañía mágica preferís?", "Una mascota que habla", "Una planta que aconseja"],
  ["Una biblioteca guarda cosas imposibles. ¿Qué leés?", "Sueños de otras personas", "Historias que todavía no pasaron"],
  ["Te ofrecen un superpoder discreto. ¿Cuál?", "Encontrar cualquier cosa perdida", "Elegir el clima de tus salidas"],
  ["Podés mandar una sola invitación extraordinaria. ¿A quién?", "A tu yo de hace diez años", "A tu yo de dentro de diez años"],
  ["La próxima juntada puede ser mágica. ¿Qué agregás?", "Una mesa que prepara cualquier comida", "Un parlante que toca música en vivo"],
  ["Una foto puede guardar algo más que una imagen. ¿Qué preferís?", "El sonido de ese momento", "La sensación de ese momento"],
];

function makePrompts(category: Category, rows: [string, string, string][]): Prompt[] {
  return rows.map(([question, a, b], index) => ({ id: `${category}-${index + 1}`, category, question, a, b }));
}

export const PROMPTS: Prompt[] = [
  ...makePrompts("cotidiano", cotidiano),
  ...makePrompts("planes", planes),
  ...makePrompts("dilemas", dilemas),
];
