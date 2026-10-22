import type { StoryStyle } from "../logic/engine";

export const STORY_STYLES: StoryStyle[] = [
  {
    id: "misterio",
    title: "Misterio de barrio",
    premise: "A las tres de la mañana, todos los timbres de la cuadra sonaron al mismo tiempo. En cada puerta había un sobre que decía: «No lo abras todavía».",
  },
  {
    id: "espacio",
    title: "Ciencia ficción casera",
    premise: "La heladera empezó a recibir mensajes del futuro. El primero decía: «Por favor, no se coman lo que está en el estante de arriba».",
  },
  {
    id: "comedia",
    title: "Comedia absurda",
    premise: "La reunión del edificio iba tranquila hasta que una paloma entró con un maletín y pidió hablar con la administración.",
  },
];

export const WORDS = [
  "paraguas", "bigote", "heladera", "tostada", "dragón", "ascensor", "mate",
  "pantufla", "robot", "sartén", "pingüino", "semáforo", "corona", "alfombra",
  "ventana", "limón", "bicicleta", "cuchara", "fantasma", "almohada", "sirena",
  "cohete", "caracol", "imán", "peluca", "galleta", "brújula", "espejo", "llave",
  "nube", "zapato", "trompeta", "sandía", "baldosa", "telescopio", "bufanda",
  "cangrejo", "campana", "sombra", "boleto",
] as const;

export const TWISTS = [
  "Alguien entiende todo al revés.",
  "Un objeto empieza a hablar.",
  "Aparece alguien que no estaba invitado.",
  "Revelá un pequeño secreto del protagonista.",
  "Algo cotidiano se vuelve gigantesco.",
  "La solución propuesta empeora el problema.",
  "Alguien encuentra una nota inesperada.",
  "Se corta la luz en el peor momento.",
  "Un ruido extraño interrumpe la conversación.",
  "Un personaje promete algo difícil de cumplir.",
  "El grupo tiene que esconderse.",
  "Aparece una pista que parece una broma.",
  "Alguien trae una noticia muy inoportuna.",
  "Un animal se mete en el asunto.",
  "El protagonista reconoce a un desconocido.",
  "Algo desaparece a la vista de todos.",
  "La ayuda llega de una persona inesperada.",
  "Se descubre que algo era falso.",
  "Un personaje intenta negociar.",
  "Una puerta lleva a un lugar sorprendente.",
  "Alguien confiesa que tenía otro plan.",
  "El protagonista tiene que improvisar un disfraz.",
  "Una llamada cambia el rumbo de la historia.",
  "Una regla absurda complica las cosas.",
  "Algo perdido vuelve en un lugar imposible.",
  "Alguien se toma demasiado en serio una broma.",
  "Una coincidencia reúne a dos personajes.",
  "El protagonista cambia de opinión.",
] as const;
