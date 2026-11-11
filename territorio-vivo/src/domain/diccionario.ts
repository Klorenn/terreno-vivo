// Búsqueda en el diccionario territorial.

import { normalizarTexto } from "./normalizar";
import type { DireccionEstructurada, EntradaDiccionario } from "./tipos";

export interface ResultadoBusqueda {
  /** true cuando alguna expresión coincidió exactamente con un alias o nombre oficial. */
  exacto: boolean;
  /**
   * true cuando la coincidencia vino de la calle o del texto original contra una corrección
   * de funcionario: esa misma dirección ya fue revisada a mano.
   */
  aprendido: boolean;
  candidatos: EntradaDiccionario[];
}

const CONECTORES = [
  "frente al", "frente a", "al lado del", "al lado de", "cerca del", "cerca de", "detras del", "detras de",
  "junto al", "junto a", "a la vuelta del", "a la vuelta de", "pasando por", "pasando", "antes del", "antes de",
  "despues del", "despues de", "a un costado del", "a un costado de", "entre",
];
const ARTICULOS = ["la", "el", "los", "las", "un", "una"];

/** Quita el conector inicial ("frente a", "al lado del"…) y artículos sueltos de una referencia normalizada. */
export function quitarConector(referencia: string): string {
  let r = referencia;
  for (const c of CONECTORES) {
    if (r === c) return "";
    if (r.startsWith(c + " ")) {
      r = r.slice(c.length + 1);
      break;
    }
  }
  const tokens = r.split(" ");
  while (tokens.length > 1 && ARTICULOS.includes(tokens[0])) tokens.shift();
  return tokens.join(" ").trim();
}

/** Nombre del camino sin el kilómetro ("camino a tromen kilometro 4" → "camino a tromen"). */
export function caminoSinKm(caminoYKm: string): string {
  return caminoYKm.replace(/\s*\b(kilometro|km)\b\s*\d+([.,]\d+)?\s*$/, "").trim();
}

/** Palabras que solas no identifican un lugar: "detrás de la sede" no debe generar el alias "sede". */
const GENERICOS = new Set([
  "sede", "escuela", "consultorio", "posta", "iglesia", "cancha", "plaza", "casa", "parcela",
  "camino", "calle", "pasaje", "villa", "poblacion", "sector",
]);

function esGenerica(expresion: string): boolean {
  const tokens = expresion.split(" ");
  return tokens.length === 1 && GENERICOS.has(tokens[0]);
}

function utiles(expresiones: string[]): string[] {
  const vistas = new Set<string>();
  return expresiones.filter((v) => {
    if (v.length === 0 || esGenerica(v) || vistas.has(v)) return false;
    vistas.add(v);
    return true;
  });
}

/** Expresiones de lugares nombrados: población, comunidad, camino y referencia. */
function expresionesDeLugar(d: DireccionEstructurada): string[] {
  const expresiones: string[] = [normalizarTexto(d.poblacion_o_villa), normalizarTexto(d.comunidad)];
  const camino = caminoSinKm(normalizarTexto(d.camino_y_km));
  if (camino) {
    expresiones.push(camino);
    const sinPrefijo = camino.replace(/^camino\s+(?:a |al |de )?/, "");
    if (sinPrefijo && sinPrefijo !== camino) expresiones.push(sinPrefijo);
  }
  expresiones.push(quitarConector(normalizarTexto(d.referencia)));
  return utiles(expresiones);
}

/** Calle sin número ni departamento/oficina/casa/block ("avenida alemania 0450 depto 3" → "avenida alemania"). */
function calleSinNumero(calle: string): string {
  return normalizarTexto(calle)
    .replace(/\b(?:departamento|oficina|casa|block|piso|numero)\s+\S+/g, " ")
    .replace(/\bsin numero\b/g, " ")
    .replace(/(?:\s+\d+[a-z]?)+\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Texto original normalizado, sin la comuna al final. */
function textoOriginalNormalizado(texto: string): string {
  return normalizarTexto(texto)
    .replace(/\b(?:comuna de )?temuco\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Expresiones de aprendizaje: el texto original (lo más específico) y la calle limpia.
 * Solo coinciden con correcciones de funcionario, para que una dirección corregida
 * en la bandeja se reconozca la próxima vez.
 */
function expresionesDeAprendizaje(d: DireccionEstructurada): string[] {
  return utiles([textoOriginalNormalizado(d.texto_original), calleSinNumero(d.calle)]);
}

/**
 * Expresiones a buscar, en orden de especificidad. Normalizadas, sin conectores ni km, sin vacíos
 * ni genéricos sueltos. Primero los lugares nombrados; al final, con menor prioridad, el texto
 * original y la calle. La bandeja de revisión guarda la primera como alias.
 */
export function expresionesDeBusqueda(d: DireccionEstructurada): string[] {
  return utiles([...expresionesDeLugar(d), ...expresionesDeAprendizaje(d)]);
}

function nombresDe(entrada: EntradaDiccionario): string[] {
  return [entrada.nombre_oficial, ...entrada.alias].map(normalizarTexto);
}

/** Quita el prefijo de tipo para comparar "villa los alerces" con "los alerces". */
function sinPrefijoTipo(texto: string): string {
  return texto.replace(/^(poblacion|villa|sector|comunidad|escuela|consultorio|camino)\s+/, "");
}

export function buscarEnDiccionario(
  estructurada: DireccionEstructurada,
  entradas: EntradaDiccionario[],
): ResultadoBusqueda {
  const expresiones = expresionesDeLugar(estructurada);

  // Primero coincidencia literal (alias o nombre oficial); luego sin prefijo de tipo
  // ("villa los alerces" ≈ "los alerces"). Una coincidencia literal gana sobre una por prefijo.
  for (const comparar of [
    (nombres: string[], expresion: string) => nombres.includes(expresion),
    (nombres: string[], expresion: string) =>
      nombres.map(sinPrefijoTipo).includes(sinPrefijoTipo(expresion)),
  ]) {
    for (const expresion of expresiones) {
      const exactos = entradas.filter((entrada) => comparar(nombresDe(entrada), expresion));
      if (exactos.length > 0) return { exacto: true, aprendido: false, candidatos: exactos };
    }
  }

  // Calle y texto original: solo coincidencia literal con correcciones de funcionario.
  // Contra el seed serían demasiado amplias (una avenida cruza varias UV).
  const correcciones = entradas.filter((e) => e.fuente === "funcionario");
  for (const expresion of expresionesDeAprendizaje(estructurada)) {
    const exactos = correcciones.filter((entrada) => nombresDe(entrada).includes(expresion));
    if (exactos.length > 0) return { exacto: true, aprendido: true, candidatos: exactos };
  }

  const parciales: EntradaDiccionario[] = [];
  for (const expresion of expresiones) {
    for (const entrada of entradas) {
      const coincide = nombresDe(entrada).some(
        (nombre) => nombre.length >= 4 && (expresion.includes(nombre) || nombre.includes(expresion)),
      );
      if (coincide && !parciales.includes(entrada)) parciales.push(entrada);
    }
  }
  return { exacto: false, aprendido: false, candidatos: parciales };
}

/**
 * Correcciones cuya UV existe en la capa actual. Las de una capa anterior (ids que ya no existen)
 * o sin UV se descartan. Si no hay nada que descartar devuelve el mismo arreglo.
 */
export function correccionesValidas(correcciones: EntradaDiccionario[], uvValidas: ReadonlySet<string>): EntradaDiccionario[] {
  const validas = correcciones.filter((e) => e.unidad_vecinal !== null && uvValidas.has(e.unidad_vecinal));
  return validas.length === correcciones.length ? correcciones : validas;
}
