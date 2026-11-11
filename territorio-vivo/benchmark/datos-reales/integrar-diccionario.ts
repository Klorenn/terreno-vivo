// Integra el diccionario territorial con datos reales (E5).
//
// 1. Seed curado: las entradas del seed original que tienen un lugar real verificable en Temuco,
//    reubicadas en la coordenada de OpenStreetMap (consultada en Nominatim el 10-nov-2026), más hitos
//    reales nuevos para el set rural. Las entradas ficticias o fuera de la comuna se retiran (ver
//    docs/datos.md, sección "Seed simulado: qué pasó con cada entrada").
// 2. unidad_vecinal del seed: punto dentro de polígono contra la capa real (src/data/uv.json).
// 3. Fusión del diccionario candidato (INE Censo 2024 + OSM, generado por diccionario.py):
//    solo tipos poblacion, villa, comunidad y camino; nombre de ≥ 2 palabras o ≥ 6 letras; sin
//    duplicados por nombre normalizado ni por elemento OSM contra el seed; se mantiene la
//    unidad_vecinal calculada por diccionario.py (null si el lugar cruza más de una UV).
//
// Uso: pnpm tsx benchmark/datos-reales/integrar-diccionario.ts
// Escribe src/data/diccionario.json. Es determinista: correrlo dos veces da el mismo archivo.

import fs from "node:fs";
import path from "node:path";
import { capaMacrosectores, capaUV } from "@/data";
import { normalizarTexto } from "@/domain/normalizar";
import { cruzarTerritorio } from "@/domain/territorio";
import type { EntradaDiccionario, TipoEntrada } from "@/domain/tipos";

const HOY = "2026-11-10";
const RAIZ = path.join(__dirname, "..", "..");
const RUTA_SALIDA = path.join(RAIZ, "src", "data", "diccionario.json");
const RUTA_CANDIDATO = path.join(__dirname, "diccionario-candidato.json");
const RUTA_ORIGEN = path.join(__dirname, "diccionario-candidato-origen.csv");

interface EntradaSeed {
  id: string;
  nombre_oficial: string;
  alias: string[];
  tipo: TipoEntrada;
  latitud: number;
  longitud: number;
  /** Elemento OSM del que sale la coordenada. */
  osm: string;
}

// Seed curado. Ids dic-0xx se conservan para no romper referencias; los hitos nuevos parten en dic-041.
export const SEED_REAL: EntradaSeed[] = [
  { id: "dic-001", nombre_oficial: "Población Santa Rosa", alias: ["santa rosa", "pob santa rosa", "la santa rosa", "sta rosa"], tipo: "poblacion", latitud: -38.73946, longitud: -72.57574, osm: "node/7884379122" },
  { id: "dic-002", nombre_oficial: "San José de Lanín", alias: ["san jose de lanin", "lanin", "pob lanin", "la lanin"], tipo: "poblacion", latitud: -38.72037, longitud: -72.60799, osm: "node/8613528514" },
  { id: "dic-003", nombre_oficial: "Población Amanecer", alias: ["amanecer", "pob amanecer", "el amanecer"], tipo: "poblacion", latitud: -38.75633, longitud: -72.62414, osm: "node/7884379121" },
  { id: "dic-004", nombre_oficial: "Población Pedro de Valdivia", alias: ["pedro de valdivia", "pob pedro de valdivia", "la pedro"], tipo: "poblacion", latitud: -38.72215, longitud: -72.61714, osm: "node/7884379124" },
  { id: "dic-005", nombre_oficial: "Población Las Quilas", alias: ["las quilas", "pob las quilas"], tipo: "poblacion", latitud: -38.74894, longitud: -72.60696, osm: "node/8557960071" },
  { id: "dic-006", nombre_oficial: "Población Pueblo Nuevo", alias: ["pueblo nuevo", "pob pueblo nuevo"], tipo: "poblacion", latitud: -38.70505, longitud: -72.55619, osm: "way/1086816919" },
  { id: "dic-008", nombre_oficial: "Villa El Salar", alias: ["el salar", "salar", "pob el salar", "villa el salar"], tipo: "villa", latitud: -38.71367, longitud: -72.6279, osm: "node/8611359902" },
  { id: "dic-009", nombre_oficial: "Villa Los Alerces", alias: ["los alerces", "villa alerces", "villa los alerces"], tipo: "villa", latitud: -38.76373, longitud: -72.6903, osm: "node/6101466129" },
  { id: "dic-011", nombre_oficial: "Villa Portal de la Frontera", alias: ["portal de la frontera", "el portal", "villa portal"], tipo: "villa", latitud: -38.74805, longitud: -72.64652, osm: "node/7951771703" },
  { id: "dic-012", nombre_oficial: "Villa Altos de Labranza", alias: ["altos de labranza", "los altos", "villa altos"], tipo: "villa", latitud: -38.7613, longitud: -72.77557, osm: "node/8595583073" },
  { id: "dic-013", nombre_oficial: "Villa El Bosque", alias: ["el bosque", "villa el bosque"], tipo: "villa", latitud: -38.7591, longitud: -72.74635, osm: "node/8607994708" },
  { id: "dic-014", nombre_oficial: "Villa La Esperanza", alias: ["esperanza", "villa esperanza", "la esperanza"], tipo: "villa", latitud: -38.70365, longitud: -72.64652, osm: "node/6101466145" },
  { id: "dic-016", nombre_oficial: "Villa Padre Hurtado", alias: ["padre hurtado", "villa hurtado"], tipo: "villa", latitud: -38.7171, longitud: -72.62882, osm: "node/5375682493" },
  { id: "dic-018", nombre_oficial: "Escuela Santa Rosa", alias: ["escuela santa rosa", "colegio santa rosa", "la escuela de santa rosa"], tipo: "hito", latitud: -38.73485, longitud: -72.57081, osm: "node/11439965118" },
  { id: "dic-021", nombre_oficial: "Liceo Politécnico Pueblo Nuevo", alias: ["liceo pueblo nuevo", "liceo politecnico pueblo nuevo", "el liceo"], tipo: "hito", latitud: -38.71811, longitud: -72.56497, osm: "way/394378336" },
  { id: "dic-022", nombre_oficial: "CESFAM Santa Rosa", alias: ["consultorio santa rosa", "cesfam santa rosa", "el consultorio"], tipo: "hito", latitud: -38.73442, longitud: -72.57214, osm: "node/11176586923" },
  { id: "dic-023", nombre_oficial: "CESFAM Amanecer", alias: ["consultorio amanecer", "cesfam amanecer"], tipo: "hito", latitud: -38.75647, longitud: -72.62335, osm: "way/913199221" },
  { id: "dic-024", nombre_oficial: "CESFAM Pedro de Valdivia", alias: ["consultorio pedro de valdivia", "cesfam pedro de valdivia"], tipo: "hito", latitud: -38.71355, longitud: -72.62012, osm: "way/915832016" },
  { id: "dic-030", nombre_oficial: "Feria Pinto", alias: ["feria pinto", "la feria"], tipo: "hito", latitud: -38.73529, longitud: -72.57983, osm: "way/909292450" },
  { id: "dic-031", nombre_oficial: "Plaza Aníbal Pinto", alias: ["plaza pinto", "plaza anibal pinto", "la plaza de armas"], tipo: "hito", latitud: -38.73998, longitud: -72.59006, osm: "way/377379558" },
  { id: "dic-037", nombre_oficial: "Sector Botrolhue", alias: ["botrolhue", "sector botrolhue"], tipo: "sector", latitud: -38.74506, longitud: -72.68326, osm: "INE Censo 2024 entidad Botrolhue" },
  // Hitos reales nuevos (OSM vía Nominatim, 10-nov-2026).
  { id: "dic-041", nombre_oficial: "Escuela Boyeco", alias: ["escuela boyeco", "escuela de boyeco", "colegio boyeco"], tipo: "hito", latitud: -38.65964, longitud: -72.71298, osm: "way/385453806" },
  { id: "dic-042", nombre_oficial: "Escuela Botrolhue", alias: ["escuela botrolhue", "escuela de botrolhue"], tipo: "hito", latitud: -38.76285, longitud: -72.6905, osm: "way/1140894584" },
  { id: "dic-043", nombre_oficial: "CESFAM Labranza", alias: ["cesfam labranza", "consultorio labranza", "consultorio de labranza"], tipo: "hito", latitud: -38.76284, longitud: -72.75325, osm: "way/366850909" },
  { id: "dic-044", nombre_oficial: "Escuela Tromén Alto G-518", alias: ["escuela tromen alto", "escuela de tromen alto"], tipo: "hito", latitud: -38.69024, longitud: -72.73346, osm: "node/11939796896" },
  { id: "dic-045", nombre_oficial: "Escuela Tromén Bajo", alias: ["escuela tromen bajo", "escuela de tromen bajo"], tipo: "hito", latitud: -38.68973, longitud: -72.7657, osm: "node/11443650261" },
  { id: "dic-046", nombre_oficial: "Posta de Salud Rural Conoco", alias: ["posta conoco", "posta de conoco", "posta rural conoco"], tipo: "hito", latitud: -38.62345, longitud: -72.74159, osm: "node/11506513851" },
  { id: "dic-047", nombre_oficial: "Escuela Mollulco", alias: ["escuela mollulco", "escuela de mollulco"], tipo: "hito", latitud: -38.71266, longitud: -72.75527, osm: "node/11939755832" },
  { id: "dic-048", nombre_oficial: "Posta de Salud Rural Collimallín", alias: ["posta collimallin", "posta de collimallin", "posta rural collimallin"], tipo: "hito", latitud: -38.60605, longitud: -72.69721, osm: "node/11978130520" },
  { id: "dic-049", nombre_oficial: "Escuela Reducción Monte Verde", alias: ["escuela monte verde", "escuela de monte verde", "escuela reduccion monte verde"], tipo: "hito", latitud: -38.6954, longitud: -72.59042, osm: "way/1545727474" },
  { id: "dic-050", nombre_oficial: "Escuela Intercultural Trañi Trañi", alias: ["escuela trañi trañi", "escuela de trañi trañi", "escuela trani trani"], tipo: "hito", latitud: -38.74107, longitud: -72.71385, osm: "node/5690773721" },
  { id: "dic-051", nombre_oficial: "Escuela Municipal Labranza", alias: ["escuela labranza", "escuela de labranza", "escuela municipal labranza"], tipo: "hito", latitud: -38.76466, longitud: -72.75305, osm: "way/1147389965" },
  { id: "dic-052", nombre_oficial: "Plaza Heriberto Neira", alias: ["plaza heriberto neira", "plaza de labranza", "plaza labranza"], tipo: "hito", latitud: -38.76679, longitud: -72.75333, osm: "way/89906004" },
  { id: "dic-053", nombre_oficial: "CESFAM Villa Alegre", alias: ["cesfam villa alegre", "consultorio villa alegre"], tipo: "hito", latitud: -38.72653, longitud: -72.61088, osm: "way/928881121" },
  { id: "dic-054", nombre_oficial: "Mercado Municipal de Temuco", alias: ["mercado municipal", "el mercado", "mercado de temuco"], tipo: "hito", latitud: -38.73717, longitud: -72.58775, osm: "way/75214640" },
  { id: "dic-055", nombre_oficial: "Hospital Hernán Henríquez Aravena", alias: ["hospital regional", "hospital hernan henriquez", "hospital hernan henriquez aravena"], tipo: "hito", latitud: -38.73616, longitud: -72.59899, osm: "way/251075037" },
  { id: "dic-056", nombre_oficial: "Estadio Germán Becker", alias: ["estadio german becker", "estadio municipal"], tipo: "hito", latitud: -38.74272, longitud: -72.6197, osm: "way/90885604" },
];

/** Entradas del seed simulado que se retiran y por qué (se documentan en docs/datos.md). */
export const RETIRADAS: Record<string, string> = {
  "dic-007": "Población Los Caciques: OSM la ubica en Padre Las Casas, fuera de la comuna",
  "dic-010": "Villa Los Aromos: sin lugar verificable en OSM ni INE",
  "dic-015": "Villa Jardín del Sur: sin lugar verificable en OSM ni INE",
  "dic-017": "Villa Los Pinos: sin lugar verificable (solo calles y un campamento con ese nombre)",
  "dic-019": "Escuela Rural Cajón: Cajón pertenece a Vilcún, fuera de la comuna",
  "dic-020": "Escuela Amanecer: no hay escuela con ese nombre en OSM",
  "dic-025": "Posta Rural Cajón: Cajón pertenece a Vilcún, fuera de la comuna",
  "dic-026": "Sede Vecinal Santa Rosa: ubicación no verificable",
  "dic-027": "Sede Vecinal Los Alerces: ubicación no verificable",
  "dic-028": "Sede Vecinal Pueblo Nuevo: ubicación no verificable",
  "dic-029": "Cancha Las Quilas: ubicación no verificable",
  "dic-032": "Camino a Cajón: lleva a Vilcún; sin geometría verificable dentro de la comuna",
  "dic-033": "Camino a Labranza: nombre informal sin vía única en OSM",
  "dic-034": "Camino El Carmen: sin vía con ese nombre en OSM",
  "dic-035": "Camino a Tromén: reemplazado por 'Camino Tromén' (OSM) del candidato",
  "dic-036": "Sector Tromén: sector amplio sin punto verificable; cubierto por hitos de Tromén Alto y Bajo",
  "dic-038": "Comunidad Rayén Mapu: ficticia",
  "dic-039": "Comunidad Lof Pewen: ficticia",
  "dic-040": "Comunidad Antü Kura: ficticia",
};

const TIPOS_FUSIONABLES = new Set<TipoEntrada>(["poblacion", "villa", "comunidad", "camino"]);
const PREFIJOS = /^(poblacion|villa|sector|comunidad|condominio|barrio|conjunto)\s+/;

const sinPrefijo = (texto: string) => normalizarTexto(texto).replace(PREFIJOS, "");
const letras = (texto: string) => (normalizarTexto(texto).match(/[a-zñ]/g) ?? []).length;

function nombreValido(nombre: string): boolean {
  return normalizarTexto(nombre).split(" ").filter(Boolean).length >= 2 || letras(nombre) >= 6;
}

function sinDuplicados(lista: string[]): string[] {
  return [...new Set(lista.map((a) => a.trim()).filter(Boolean))];
}

function uvDelPunto(longitud: number, latitud: number): string | null {
  return cruzarTerritorio(longitud, latitud, capaUV, capaMacrosectores)?.uv_id ?? null;
}

function origenPorId(): Map<string, string> {
  const filas = fs.readFileSync(RUTA_ORIGEN, "utf8").trim().split("\n").slice(1);
  const mapa = new Map<string, string>();
  for (const fila of filas) {
    const id = fila.split(",")[0];
    const origen = fila.slice(fila.lastIndexOf(",") + 1);
    mapa.set(id, origen);
  }
  return mapa;
}

function main() {
  const seed: EntradaDiccionario[] = SEED_REAL.map((e) => ({
    id: e.id,
    nombre_oficial: e.nombre_oficial,
    alias: sinDuplicados([...e.alias, normalizarTexto(e.nombre_oficial)]),
    tipo: e.tipo,
    latitud: e.latitud,
    longitud: e.longitud,
    unidad_vecinal: uvDelPunto(e.longitud, e.latitud),
    fuente: "equipo",
    fecha_actualizacion: HOY,
  }));
  const seedFuera = seed.filter((e) => e.unidad_vecinal === null).map((e) => e.id);

  const vistos = new Set<string>();
  for (const e of seed) for (const n of [e.nombre_oficial, ...e.alias]) vistos.add(sinPrefijo(n));
  const osmDelSeed = new Set(SEED_REAL.map((e) => e.osm));
  const origen = origenPorId();

  const candidato = JSON.parse(fs.readFileSync(RUTA_CANDIDATO, "utf8")) as EntradaDiccionario[];
  const descartes = { tipo: 0, nombre: 0, duplicado: 0 };
  const fusionadas: EntradaDiccionario[] = [];
  for (const c of candidato) {
    if (!TIPOS_FUSIONABLES.has(c.tipo)) { descartes.tipo++; continue; }
    if (!nombreValido(c.nombre_oficial)) { descartes.nombre++; continue; }
    const clave = sinPrefijo(c.nombre_oficial);
    const osm = (origen.get(c.id) ?? "").match(/(node|way|relation)\/\d+/)?.[0];
    if (vistos.has(clave) || (osm && osmDelSeed.has(osm))) { descartes.duplicado++; continue; }
    vistos.add(clave);
    fusionadas.push({
      ...c,
      alias: sinDuplicados([...c.alias, normalizarTexto(c.nombre_oficial)]),
      fuente: "equipo",
      fecha_actualizacion: HOY,
    });
  }

  const salida = [...seed, ...fusionadas];
  fs.writeFileSync(RUTA_SALIDA, JSON.stringify(salida, null, 2) + "\n");

  const porTipo: Record<string, number> = {};
  for (const e of salida) porTipo[e.tipo] = (porTipo[e.tipo] ?? 0) + 1;
  console.log(`Seed real: ${seed.length} (retiradas del seed simulado: ${Object.keys(RETIRADAS).length})`);
  console.log(`Seed fuera de toda UV: ${seedFuera.length ? seedFuera.join(", ") : "ninguna"}`);
  console.log(`Candidato: ${candidato.length} → fusionadas ${fusionadas.length}; descartes`, descartes);
  console.log(`Total: ${salida.length}`, porTipo);
  console.log(`Sin UV (null): ${salida.filter((e) => e.unidad_vecinal === null).length}`);
}

main();
