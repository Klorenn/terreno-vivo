// Definición del set de 100 direcciones difíciles (E2). Todas inventadas o calles públicas de Temuco.
// NUNCA direcciones de beneficiarios reales.
// La coordenada de referencia se resuelve en generar-set.ts: nominatim (calle pública, cacheado),
// diccionario (coordenada de la entrada) o manual (fijada por el equipo).

import type { Categoria } from "@/domain/metricas";

export type Referencia =
  | { tipo: "nominatim"; consulta: string }
  | { tipo: "diccionario"; id: string }
  | { tipo: "manual"; latitud: number; longitud: number };

export interface DefinicionCaso {
  categoria: Categoria;
  direccion: string;
  referencia: Referencia;
  nota?: string;
}

// 25 calles públicas de Temuco con número inventado. La misma referencia sirve para la versión con errores.
const URBANAS: Array<[limpia: string, consulta: string, conErrores: string, notaErrores: string]> = [
  ["Avenida Alemania 0450, Temuco", "Avenida Alemania 0450", "av alemnia 0450 dpto 3", "tipeo + abreviatura + dpto"],
  ["Manuel Montt 1150, Temuco", "Manuel Montt 1150", "m. montt 1150", "inicial abreviada"],
  ["Avenida Pablo Neruda 1540, Temuco", "Avenida Pablo Neruda 1540", "av. p. neruda 1540", "abreviaturas"],
  ["Arturo Prat 215, Temuco", "Arturo Prat 215", "prat 215 ofic 2", "sin nombre, oficina"],
  ["Avenida Caupolicán 980, Temuco", "Avenida Caupolicán 980", "avda caupolican 980 temuco", "sin tilde, avda"],
  ["Hochstetter 1320, Temuco", "Hochstetter 1320", "hoschtetter 1320", "tipeo"],
  ["Avenida Rudecindo Ortega 2200, Temuco", "Avenida Rudecindo Ortega 2200", "rudecindo ortega 2200 blk b", "block"],
  ["Aldunate 575, Temuco", "Aldunate 575", "aldunte 575 depto 12", "tipeo + depto"],
  ["Manuel Bulnes 480, Temuco", "Manuel Bulnes 480", "bulnes 480 2do piso", "piso sobrante"],
  ["Lautaro 1250, Temuco", "Lautaro 1250", "lautaro 1250 local 4", "local sobrante"],
  ["Vicuña Mackenna 650, Temuco", "Vicuña Mackenna 650", "vicuna mackena 650", "sin ñ, tipeo"],
  ["Diego Portales 810, Temuco", "Diego Portales 810", "portales 810 of 301", "oficina"],
  ["Avenida Balmaceda 1480, Temuco", "Avenida Balmaceda 1480", "av balmaseda 1480", "tipeo s/c"],
  ["Manuel Rodríguez 925, Temuco", "Manuel Rodríguez 925", "rodriguez 925 dpto 5b", "sin tilde, dpto"],
  ["Las Heras 745, Temuco", "Las Heras 745", "las eras 745", "tipeo h"],
  ["Antonio Varas 1030, Temuco", "Antonio Varas 1030", "a. varas 1030 casa 2", "inicial + casa"],
  ["Claro Solar 880, Temuco", "Claro Solar 880", "claro solar n° 880", "N°"],
  ["General Mackenna 610, Temuco", "General Mackenna 610", "gral mackenna 610", "gral"],
  ["Avenida Javiera Carrera 1320, Temuco", "Avenida Javiera Carrera 1320", "av javiera carera 1320 block 7", "tipeo + block"],
  ["Avenida San Martín 1180, Temuco", "Avenida San Martín 1180", "san martin 1180 dpto 404", "sin tilde, dpto"],
  ["Avenida Pedro de Valdivia 2350, Temuco", "Avenida Pedro de Valdivia 2350", "av pedro de valdivia 2350 casa 3", "casa"],
  ["Avenida Luis Durand 1950, Temuco", "Avenida Luis Durand 1950", "avda. luis duran 1950", "tipeo"],
  ["Avenida Gabriela Mistral 1440, Temuco", "Avenida Gabriela Mistral 1440", "gabriela mistral 1440 depto. 23", "depto"],
  ["Andrés Bello 1290, Temuco", "Andrés Bello 1290", "andres vello 1290", "tipeo b/v"],
  ["Zenteno 540, Temuco", "Zenteno 540", "zenteno 540, temuco, 2° piso", "piso"],
];

const urbanasLimpias: DefinicionCaso[] = URBANAS.map(([limpia, consulta]) => ({
  categoria: "urbana_limpia",
  direccion: limpia,
  referencia: { tipo: "nominatim", consulta },
}));

const urbanasErrores: DefinicionCaso[] = URBANAS.map(([, consulta, conErrores, nota]) => ({
  categoria: "urbana_errores",
  direccion: conErrores,
  referencia: { tipo: "nominatim", consulta },
  nota,
}));

// Poblaciones y villas por nombre. Mezcla de alias conocidos y variantes que NO están en el diccionario.
const poblacionVilla: DefinicionCaso[] = [
  { categoria: "poblacion_villa", direccion: "villa los alerces, pasaje 3, casa 12", referencia: { tipo: "diccionario", id: "dic-009" } },
  { categoria: "poblacion_villa", direccion: "pje los aromos 123 pob sta rosa", referencia: { tipo: "diccionario", id: "dic-001" }, nota: "alias 'sta rosa' en diccionario" },
  { categoria: "poblacion_villa", direccion: "pob lanin, pasaje 7 casa 4", referencia: { tipo: "diccionario", id: "dic-002" } },
  { categoria: "poblacion_villa", direccion: "villa esperanza block 3 dpto 21", referencia: { tipo: "diccionario", id: "dic-014" } },
  { categoria: "poblacion_villa", direccion: "la pedro, pasaje las rosas casa 8", referencia: { tipo: "diccionario", id: "dic-004" }, nota: "nombre informal 'la pedro'" },
  { categoria: "poblacion_villa", direccion: "pob el salar sitio 14", referencia: { tipo: "diccionario", id: "dic-008" } },
  { categoria: "poblacion_villa", direccion: "villa portal de la frontera casa 33", referencia: { tipo: "diccionario", id: "dic-011" } },
  { categoria: "poblacion_villa", direccion: "lomas del carmen pasaje 2 casa 9", referencia: { tipo: "diccionario", id: "dic-r191" } },
  { categoria: "poblacion_villa", direccion: "población amanecer, pasaje 12, casa 5", referencia: { tipo: "diccionario", id: "dic-003" } },
  { categoria: "poblacion_villa", direccion: "pob. las quilas casa 44", referencia: { tipo: "diccionario", id: "dic-005" } },
  { categoria: "poblacion_villa", direccion: "pueblo nuevo, pasaje los robles 8", referencia: { tipo: "diccionario", id: "dic-006" } },
  { categoria: "poblacion_villa", direccion: "villa altos de labranza, casa 17", referencia: { tipo: "diccionario", id: "dic-012" } },
  { categoria: "poblacion_villa", direccion: "villa el bosque pje 2 casa 6", referencia: { tipo: "diccionario", id: "dic-013" } },
  { categoria: "poblacion_villa", direccion: "brisas de labranza casa 21", referencia: { tipo: "diccionario", id: "dic-r370" } },
  { categoria: "poblacion_villa", direccion: "villa padre hurtado block 5 dpto 12", referencia: { tipo: "diccionario", id: "dic-016" } },
  { categoria: "poblacion_villa", direccion: "villa santa maria de labranza pasaje 4 casa 2", referencia: { tipo: "diccionario", id: "dic-r250" }, nota: "nombre abreviado (oficial: Villa Hacienda Santa María de Labranza)" },
  { categoria: "poblacion_villa", direccion: "pob. sta. rosita pasaje 9", referencia: { tipo: "diccionario", id: "dic-001" }, nota: "variante NO en diccionario (diminutivo)" },
  { categoria: "poblacion_villa", direccion: "villa alerse casa 3", referencia: { tipo: "diccionario", id: "dic-009" }, nota: "tipeo NO en diccionario" },
  { categoria: "poblacion_villa", direccion: "pob lanín norte, casa 31", referencia: { tipo: "diccionario", id: "dic-002" }, nota: "sufijo 'norte' NO en diccionario" },
  { categoria: "poblacion_villa", direccion: "villa la esperanza 2, pasaje 1 casa 10", referencia: { tipo: "diccionario", id: "dic-014" }, nota: "variante numerada NO en diccionario" },
  { categoria: "poblacion_villa", direccion: "las quilitas, pasaje 3", referencia: { tipo: "diccionario", id: "dic-005" }, nota: "diminutivo NO en diccionario" },
  { categoria: "poblacion_villa", direccion: "el portal casa 12", referencia: { tipo: "diccionario", id: "dic-011" }, nota: "alias corto en diccionario" },
  { categoria: "poblacion_villa", direccion: "sector lomas del carmen pasaje 5", referencia: { tipo: "diccionario", id: "dic-r191" } },
  { categoria: "poblacion_villa", direccion: "villa los tres aromos pasaje 6 casa 4", referencia: { tipo: "diccionario", id: "dic-r249" } },
  { categoria: "poblacion_villa", direccion: "poblacion pedro de valdivia, block 2 dpto 31", referencia: { tipo: "diccionario", id: "dic-004" } },
];

// Rurales y por referencia, sobre lugares reales de la comuna (escuelas y postas rurales de OSM, comunidades INE).
// Puntos manuales verificados con point-in-polygon contra la capa real de UV (MIDESOF/BIDAT 2026).
const ruralReferencia: DefinicionCaso[] = [
  { categoria: "rural_referencia", direccion: "camino a boyeco km 5, frente a la escuela", referencia: { tipo: "diccionario", id: "dic-041" }, nota: "la escuela ancla la UV" },
  { categoria: "rural_referencia", direccion: "comunidad juan quelen, al lado de la sede", referencia: { tipo: "diccionario", id: "dic-r059" } },
  { categoria: "rural_referencia", direccion: "frente al consultorio santa rosa", referencia: { tipo: "diccionario", id: "dic-022" } },
  { categoria: "rural_referencia", direccion: "sector conoco, al lado de la posta", referencia: { tipo: "diccionario", id: "dic-046" } },
  { categoria: "rural_referencia", direccion: "escuela tromen alto, camino a tromen", referencia: { tipo: "diccionario", id: "dic-044" } },
  { categoria: "rural_referencia", direccion: "comunidad manuel curilef lote 4", referencia: { tipo: "diccionario", id: "dic-r039" } },
  { categoria: "rural_referencia", direccion: "comunidad hueche huenulaf, parcela 9", referencia: { tipo: "diccionario", id: "dic-r014" } },
  { categoria: "rural_referencia", direccion: "al lado de la escuela tromen bajo", referencia: { tipo: "diccionario", id: "dic-045" } },
  { categoria: "rural_referencia", direccion: "frente a la posta de collimallin", referencia: { tipo: "diccionario", id: "dic-048" } },
  { categoria: "rural_referencia", direccion: "camino a mollulco, cerca de la escuela", referencia: { tipo: "diccionario", id: "dic-047" } },
  { categoria: "rural_referencia", direccion: "sector monte verde, detrás de la escuela", referencia: { tipo: "diccionario", id: "dic-049" } },
  { categoria: "rural_referencia", direccion: "sector botrolhue, frente a la escuela", referencia: { tipo: "diccionario", id: "dic-042" } },
  { categoria: "rural_referencia", direccion: "frente al cesfam labranza", referencia: { tipo: "diccionario", id: "dic-043" } },
  { categoria: "rural_referencia", direccion: "frente a la feria pinto", referencia: { tipo: "diccionario", id: "dic-030" } },
  { categoria: "rural_referencia", direccion: "cerca del liceo pueblo nuevo", referencia: { tipo: "diccionario", id: "dic-021" } },
  { categoria: "rural_referencia", direccion: "camino boyeco km 7 parcela 3", referencia: { tipo: "manual", latitud: -38.6596, longitud: -72.7105 }, nota: "km fijado a mano (uv-34); el camino abarca >1 UV" },
  { categoria: "rural_referencia", direccion: "frente a la escuelita de boyeco", referencia: { tipo: "diccionario", id: "dic-041" }, nota: "diminutivo NO en diccionario" },
  { categoria: "rural_referencia", direccion: "posta konoko, camino a conoco", referencia: { tipo: "diccionario", id: "dic-046" }, nota: "tipeo NO en diccionario" },
  { categoria: "rural_referencia", direccion: "comunidad curilej, camino a tromen", referencia: { tipo: "diccionario", id: "dic-r039" }, nota: "tipeo NO en diccionario" },
  { categoria: "rural_referencia", direccion: "sector tromen alto, al lado del canal", referencia: { tipo: "diccionario", id: "dic-044" }, nota: "referencia vaga" },
  { categoria: "rural_referencia", direccion: "escuela trañi trañi, camino a labranza", referencia: { tipo: "diccionario", id: "dic-050" } },
  { categoria: "rural_referencia", direccion: "al lado del consultorio", referencia: { tipo: "manual", latitud: -38.72653, longitud: -72.61088 }, nota: "referencia vaga (CESFAM Villa Alegre, uv-21): debe ir a revisión" },
  { categoria: "rural_referencia", direccion: "parcela 22 camino viejo a boyeco", referencia: { tipo: "manual", latitud: -38.664, longitud: -72.7 }, nota: "camino NO en diccionario (uv-34)" },
  { categoria: "rural_referencia", direccion: "frente a la escuela de boyeco, sitio 2", referencia: { tipo: "diccionario", id: "dic-041" } },
  { categoria: "rural_referencia", direccion: "frente a la plaza anibal pinto", referencia: { tipo: "diccionario", id: "dic-031" } },
];

export const DEFINICION: DefinicionCaso[] = [...urbanasLimpias, ...urbanasErrores, ...poblacionVilla, ...ruralReferencia];
