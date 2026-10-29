export const PROMPTS = [
  'Un carpincho vendiendo helados en la luna',
  'Una tostadora que sueña con ser DJ',
  'Un pulpo cebando ocho mates',
  'Una paloma dirigiendo el tránsito',
  'Un fantasma aprendiendo a andar en patines',
  'Un dinosaurio que no entra en el ascensor',
  'Un cactus esperando un abrazo',
  'Una empanada escapando en monopatín',
  'Un perro dando una clase de yoga',
  'Una sirena comprando zapatos',
  'Un robot llorando por una cebolla',
  'Un pingüino haciendo un asado en la playa',
  'Una nube usando paraguas',
  'Un dragón apagando velitas con cuidado',
  'Una banana disfrazada de detective',
  'Un gato entrevistando a un ratón',
  'Un extraterrestre esperando el ómnibus',
  'Una tortuga ganando una carrera en taxi',
  'Un árbol cortándose el pelo',
  'Un sol poniéndose protector solar',
  'Una pizza haciendo equilibrio en una cuerda',
  'Un pez paseando a su humano',
  'Un gallo con miedo al despertador',
  'Una abuela surfeando sobre una tabla de planchar',
  'Un marciano aprendiendo a bailar candombe',
  'Un queso fotografiando a una familia de ratones',
  'Una montaña rusa para caracoles',
  'Un tiburón con flotadores en una piscina',
  'Una vaca pintando manchas en la pared',
  'Un mate gigante buscando una bombilla',
  'Un oso polar vendiendo bufandas',
  'Una luna con hipo tirando estrellas',
] as const;

export function choosePrompts(count: number, random: () => number = Math.random): string[] {
  const deck: string[] = [...PROMPTS];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.max(0, Math.min(i, Math.floor(random() * (i + 1))));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(0, Math.max(1, Math.min(3, Math.floor(count))));
}
