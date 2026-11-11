import { describe, expect, it } from "vitest";
import { calcularMetricas, evaluarGenerico, evaluarSistema, type Evaluacion } from "./metricas";

const ev = (parcial: Partial<Evaluacion>): Evaluacion => ({
  id: "x",
  categoria: "urbana_limpia",
  uv_esperada: "uv-1",
  uv_asignada: null,
  derivado: false,
  confianza: null,
  ...parcial,
});

describe("evaluarSistema", () => {
  it("baja → derivado, sin UV asignada", () => {
    const e = evaluarSistema({ id: "a", categoria: "rural_referencia", uv_esperada: "uv-1" }, { uv_id: null, confianza: "baja" });
    expect(e.derivado).toBe(true);
    expect(e.uv_asignada).toBeNull();
  });
  it("alta con UV → asignado", () => {
    const e = evaluarSistema({ id: "a", categoria: "urbana_limpia", uv_esperada: "uv-1" }, { uv_id: "uv-1", confianza: "alta" });
    expect(e.derivado).toBe(false);
    expect(e.uv_asignada).toBe("uv-1");
    expect(e.confianza).toBe("alta");
  });
});

describe("evaluarGenerico", () => {
  it("sin resultado → derivado (no hay dónde asignar)", () => {
    const e = evaluarGenerico({ id: "a", categoria: "urbana_limpia", uv_esperada: "uv-1" }, null);
    expect(e.derivado).toBe(true);
    expect(e.confianza).toBeNull();
  });
  it("con resultado → asigna siempre, aunque esté mal", () => {
    const e = evaluarGenerico({ id: "a", categoria: "urbana_limpia", uv_esperada: "uv-1" }, "uv-9");
    expect(e.derivado).toBe(false);
    expect(e.uv_asignada).toBe("uv-9");
  });
});

describe("calcularMetricas (sección 8.2)", () => {
  const evaluaciones: Evaluacion[] = [
    // urbana_limpia: 2 correctas alta, 1 incorrecta media (error silencioso), 1 derivada
    ev({ id: "1", uv_asignada: "uv-1", confianza: "alta" }),
    ev({ id: "2", uv_asignada: "uv-1", confianza: "alta" }),
    ev({ id: "3", uv_asignada: "uv-2", confianza: "media" }),
    ev({ id: "4", derivado: true, confianza: "baja" }),
    // rural_referencia: 1 correcta, 1 derivada
    ev({ id: "5", categoria: "rural_referencia", uv_asignada: "uv-1", confianza: "alta" }),
    ev({ id: "6", categoria: "rural_referencia", derivado: true, confianza: "baja" }),
  ];

  it("total: acierto 3/6, derivación 2/6, error silencioso 1/6", () => {
    const m = calcularMetricas(evaluaciones);
    expect(m.total.n).toBe(6);
    expect(m.total.acierto).toBeCloseTo(50);
    expect(m.total.derivacion).toBeCloseTo(33.33, 1);
    expect(m.total.error_silencioso).toBeCloseTo(16.67, 1);
  });

  it("por categoría", () => {
    const m = calcularMetricas(evaluaciones);
    expect(m.por_categoria.urbana_limpia).toEqual({ n: 4, acierto: 50, derivacion: 25, error_silencioso: 25 });
    expect(m.por_categoria.rural_referencia).toEqual({ n: 2, acierto: 50, derivacion: 50, error_silencioso: 0 });
  });

  it("el genérico (confianza null) cuenta error silencioso en toda asignación incorrecta", () => {
    const m = calcularMetricas([
      ev({ id: "1", uv_asignada: "uv-9", confianza: null }),
      ev({ id: "2", uv_asignada: "uv-1", confianza: null }),
      ev({ id: "3", derivado: true, confianza: null }),
    ]);
    expect(m.total).toEqual({ n: 3, acierto: 33.33, derivacion: 33.33, error_silencioso: 33.33 });
  });

  it("asignación incorrecta con confianza baja no es error silencioso (no debería ocurrir, pero no se cuenta)", () => {
    const m = calcularMetricas([ev({ id: "1", uv_asignada: "uv-9", confianza: "baja" })]);
    expect(m.total.error_silencioso).toBe(0);
    expect(m.total.acierto).toBe(0);
  });

  it("lista vacía devuelve ceros sin dividir por cero", () => {
    expect(calcularMetricas([]).total).toEqual({ n: 0, acierto: 0, derivacion: 0, error_silencioso: 0 });
  });
});
