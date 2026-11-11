// Corrección de tipeo en nombres de calle contra una lista de calles conocidas de Temuco.
// Solo corrige cuando hay un único candidato cercano: ante la duda, deja el texto como vino.

import callesJson from "@/data/calles.json";
import { normalizarTexto } from "./normalizar";

/** Tipos de vía que el normalizador ya expandió ("av." → "avenida"). Se conservan tal cual. */
const PREFIJO_VIA = /^(avenida|calle|pasaje|callejon|diagonal)\s+/;

/** Nombre de la calle sin el tipo de vía ("avenida alemania" → "alemania"). */
export function quitarVia(calle: string): string {
  return calle.replace(PREFIJO_VIA, "");
}

const CALLES: string[] = (callesJson as string[]).map(normalizarTexto);

/** Distancia de Damerau-Levenshtein restringida (OSA): inserción, borrado, sustitución y transposición. */
export function distanciaEdicion(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + costo);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

/** Distancia máxima aceptada según la cantidad de letras del nombre. */
function toleranciaPara(nombre: string): number {
  const letras = nombre.replace(/[^a-zñ]/g, "").length;
  if (letras >= 6) return 2;
  if (letras >= 4) return 1;
  return 0;
}

export interface CalleCorregida {
  calle: string;
  corregida: boolean;
}

/**
 * Corrige el nombre de una calle ya normalizada ("avenida alemnia" → "avenida alemania").
 * Acepta la corrección si la distancia es ≤ 2 (nombres de 6+ letras) o ≤ 1 (4-5 letras)
 * y hay un único candidato a esa distancia mínima.
 */
export function corregirCalle(calle: string): CalleCorregida {
  const limpia = calle.replace(/\s+/g, " ").trim();
  const via = limpia.match(PREFIJO_VIA)?.[0] ?? "";
  const nombre = limpia.slice(via.length);
  const tolerancia = toleranciaPara(nombre);
  if (tolerancia === 0 || /\d/.test(nombre) || CALLES.includes(nombre)) return { calle: limpia, corregida: false };

  let mejor: string | null = null;
  let mejorDistancia = Infinity;
  let empates = 0;
  for (const candidata of CALLES) {
    if (Math.abs(candidata.length - nombre.length) > tolerancia) continue;
    const distancia = distanciaEdicion(nombre, candidata);
    if (distancia < mejorDistancia) {
      mejor = candidata;
      mejorDistancia = distancia;
      empates = 1;
    } else if (distancia === mejorDistancia) {
      empates += 1;
    }
  }
  if (mejor === null || mejorDistancia > tolerancia || empates > 1) return { calle: limpia, corregida: false };
  return { calle: via + mejor, corregida: true };
}
