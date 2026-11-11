// Métricas del plan de medición (sección 8.2): acierto, derivación y error silencioso.

import type { Confianza } from "./tipos";

export type Categoria = "urbana_limpia" | "urbana_errores" | "poblacion_villa" | "rural_referencia";

export const CATEGORIAS: Categoria[] = ["urbana_limpia", "urbana_errores", "poblacion_villa", "rural_referencia"];

export interface CasoPrueba {
  id: string;
  categoria: Categoria;
  uv_esperada: string;
}

export interface Evaluacion extends CasoPrueba {
  /** UV asignada por el método; null si no asignó. */
  uv_asignada: string | null;
  /** true si el método no asignó (sistema: confianza baja; genérico: sin resultado). */
  derivado: boolean;
  /** Confianza del sistema; null para el geocodificador genérico. */
  confianza: Confianza | null;
}

export interface Metricas {
  n: number;
  /** % de casos asignados a la UV correcta, sobre todos los casos. */
  acierto: number;
  /** % de casos enviados a revisión (o sin resultado en el genérico). */
  derivacion: number;
  /** % asignados a una UV incorrecta con confianza alta o media (genérico: cualquier asignación incorrecta). */
  error_silencioso: number;
}

export interface ResumenMetricas {
  total: Metricas;
  por_categoria: Record<Categoria, Metricas>;
}

export function evaluarSistema(
  caso: CasoPrueba,
  resultado: { uv_id: string | null; confianza: Confianza },
): Evaluacion {
  const asignado = resultado.confianza !== "baja" && resultado.uv_id !== null;
  return {
    ...caso,
    uv_asignada: asignado ? resultado.uv_id : null,
    derivado: !asignado,
    confianza: resultado.confianza,
  };
}

export function evaluarGenerico(caso: CasoPrueba, uvEncontrada: string | null): Evaluacion {
  return { ...caso, uv_asignada: uvEncontrada, derivado: uvEncontrada === null, confianza: null };
}

function porcentaje(parte: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((parte / total) * 10000) / 100;
}

function metricasDe(evaluaciones: Evaluacion[]): Metricas {
  const n = evaluaciones.length;
  let aciertos = 0;
  let derivados = 0;
  let silenciosos = 0;
  for (const e of evaluaciones) {
    if (e.derivado || e.uv_asignada === null) {
      derivados += 1;
      continue;
    }
    if (e.uv_asignada === e.uv_esperada) {
      aciertos += 1;
    } else if (e.confianza === null || e.confianza === "alta" || e.confianza === "media") {
      silenciosos += 1;
    }
  }
  return {
    n,
    acierto: porcentaje(aciertos, n),
    derivacion: porcentaje(derivados, n),
    error_silencioso: porcentaje(silenciosos, n),
  };
}

export function calcularMetricas(evaluaciones: Evaluacion[]): ResumenMetricas {
  const por_categoria = Object.fromEntries(
    CATEGORIAS.map((c) => [c, metricasDe(evaluaciones.filter((e) => e.categoria === c))]),
  ) as Record<Categoria, Metricas>;
  return { total: metricasDe(evaluaciones), por_categoria };
}
