import { describe, expect, it } from "vitest";
import { calcularConfianza, type EntradaConfianza } from "./confianza";
import type { DireccionEstructurada } from "./tipos";

const base: DireccionEstructurada = {
  texto_original: "",
  calle: "",
  numero: "",
  poblacion_o_villa: "",
  comunidad: "",
  camino_y_km: "",
  referencia: "",
  es_rural: false,
  observaciones: "",
};

const dentro = { uv_id: "uv-1", uv_nombre: "UV 1", macrosector: "A" };

function evaluar(parcial: Partial<EntradaConfianza>) {
  return calcularConfianza({
    estructurada: base,
    tipo_precision: "ninguna",
    territorio: null,
    diccionario: { exacto: false, candidatos: [] },
    ...parcial,
  });
}

describe("calcularConfianza — reglas sección 6.4", () => {
  it("ALTA: calle y número geocodificados dentro de la comuna", () => {
    const r = evaluar({
      estructurada: { ...base, calle: "avenida alemania", numero: "450" },
      tipo_precision: "numero",
      territorio: dentro,
    });
    expect(r.confianza).toBe("alta");
    expect(r.asignar).toBe(true);
  });

  it("ALTA: coincidencia exacta en diccionario con UV única", () => {
    const r = evaluar({
      estructurada: { ...base, poblacion_o_villa: "santa rosa" },
      tipo_precision: "diccionario",
      territorio: dentro,
      diccionario: { exacto: true, candidatos: [{ id: "d1", unidad_vecinal: "uv-1" }] },
    });
    expect(r.confianza).toBe("alta");
  });

  it("MEDIA: calle con nombre propio sin número y sin lugar nombrado", () => {
    const r = evaluar({
      estructurada: { ...base, calle: "calle prat" },
      tipo_precision: "calle",
      territorio: dentro,
    });
    expect(r.confianza).toBe("media");
    expect(r.asignar).toBe(true);
  });

  it("BAJA: pasaje a nivel calle sin lugar que lo confirme (nombres repetidos en varias UV)", () => {
    for (const calle of ["pasaje 3", "pasaje las rosas", "callejon 2"]) {
      const r = evaluar({ estructurada: { ...base, calle }, tipo_precision: "calle", territorio: dentro });
      expect(r.confianza).toBe("baja");
      expect(r.asignar).toBe(false);
      expect(r.motivo).toBe("Pasaje sin número resuelto ni lugar que lo confirme: hay pasajes con el mismo nombre en varias unidades vecinales; requiere revisión");
    }
  });

  it("BAJA: pasaje CON número que el mapa no encontró y sin lugar que lo confirme → motivo con número", () => {
    const r = evaluar({ estructurada: { ...base, calle: "pasaje las rosas", numero: "8" }, tipo_precision: "calle", territorio: dentro });
    expect(r.confianza).toBe("baja");
    expect(r.motivo).toBe("Pasaje con número no encontrado en el mapa y sin lugar que lo confirme; requiere revisión");
  });

  it("MEDIA: calle sin número corroborada por población del diccionario en la misma UV", () => {
    const r = evaluar({
      estructurada: { ...base, calle: "pasaje los aromos", poblacion_o_villa: "santa rosa" },
      tipo_precision: "calle",
      territorio: dentro,
      diccionario: { exacto: true, candidatos: [{ id: "d1", unidad_vecinal: "uv-1" }, { id: "d9", unidad_vecinal: "uv-7" }] },
    });
    expect(r.confianza).toBe("media");
    expect(r.asignar).toBe(true);
  });

  it("BAJA: una referencia (hito) del diccionario no basta para corroborar un pasaje", () => {
    const r = evaluar({
      estructurada: { ...base, calle: "pasaje 4", referencia: "frente al hospital" },
      tipo_precision: "calle",
      territorio: dentro,
      diccionario: { exacto: true, candidatos: [{ id: "h1", unidad_vecinal: "uv-1" }] },
    });
    expect(r.confianza).toBe("baja");
  });

  it("BAJA: calle sin número + lugar nombrado SIN match exacto en diccionario", () => {
    const r = evaluar({
      estructurada: { ...base, calle: "los caciques pasaje", poblacion_o_villa: "los caciques" },
      tipo_precision: "calle",
      territorio: dentro,
      diccionario: { exacto: false, candidatos: [] },
    });
    expect(r.confianza).toBe("baja");
    expect(r.asignar).toBe(false);
    expect(r.motivo).toBe("Calle sin número y lugar nombrado desconocido: posible ubicación errónea");
  });

  it("BAJA también cuando el lugar nombrado es comunidad o camino sin match exacto", () => {
    expect(evaluar({ estructurada: { ...base, calle: "ruta s", comunidad: "lof pewen" }, tipo_precision: "calle", territorio: dentro }).confianza).toBe("baja");
    expect(evaluar({ estructurada: { ...base, calle: "ruta s", camino_y_km: "camino viejo km 2" }, tipo_precision: "calle", territorio: dentro }).confianza).toBe("baja");
  });

  it("MEDIA: pasaje corroborado por población del diccionario en la misma UV", () => {
    const r = evaluar({
      estructurada: { ...base, calle: "pasaje 3", poblacion_o_villa: "santa rosa" },
      tipo_precision: "calle",
      territorio: dentro,
      diccionario: { exacto: true, candidatos: [{ id: "d1", unidad_vecinal: "uv-1" }, { id: "d9", unidad_vecinal: "uv-7" }] },
    });
    expect(r.confianza).toBe("media");
  });

  it("ALTA: calle con número y lugar nombrado desconocido sigue siendo alta", () => {
    const r = evaluar({
      estructurada: { ...base, calle: "avenida alemania", numero: "450", poblacion_o_villa: "villa inexistente" },
      tipo_precision: "numero",
      territorio: dentro,
    });
    expect(r.confianza).toBe("alta");
  });

  it("BAJA: lugar del diccionario que abarca más de una UV", () => {
    const r = evaluar({
      estructurada: { ...base, camino_y_km: "camino a boyeco kilometro 5" },
      tipo_precision: "diccionario",
      territorio: dentro,
      diccionario: { exacto: true, candidatos: [{ id: "d2", unidad_vecinal: null }] },
    });
    expect(r.confianza).toBe("baja");
    expect(r.asignar).toBe(false);
    expect(r.motivo).toBe("El lugar abarca más de una unidad vecinal; requiere revisión");
  });

  it("MEDIA: match exacto en diccionario pero varios candidatos con la misma UV se tolera; con UV distintas es BAJA", () => {
    const mismaUV = evaluar({
      estructurada: { ...base, poblacion_o_villa: "santa rosa" },
      tipo_precision: "diccionario",
      territorio: dentro,
      diccionario: {
        exacto: true,
        candidatos: [
          { id: "d1", unidad_vecinal: "uv-1" },
          { id: "d3", unidad_vecinal: "uv-1" },
        ],
      },
    });
    expect(mismaUV.confianza).toBe("alta");

    const distintas = evaluar({
      estructurada: { ...base, poblacion_o_villa: "santa rosa" },
      tipo_precision: "diccionario",
      territorio: dentro,
      diccionario: {
        exacto: true,
        candidatos: [
          { id: "d1", unidad_vecinal: "uv-1" },
          { id: "d9", unidad_vecinal: "uv-7" },
        ],
      },
    });
    expect(distintas.confianza).toBe("baja");
    expect(distintas.asignar).toBe(false);
  });

  it("BAJA: solo referencias vagas sin ubicación", () => {
    const r = evaluar({
      estructurada: { ...base, referencia: "al lado del consultorio" },
    });
    expect(r.confianza).toBe("baja");
    expect(r.asignar).toBe(false);
  });

  it("BAJA: match por contención (no exacto) en el diccionario", () => {
    const r = evaluar({
      estructurada: { ...base, referencia: "frente a la escuela santa rosa" },
      tipo_precision: "diccionario",
      territorio: dentro,
      diccionario: { exacto: false, candidatos: [{ id: "d3", unidad_vecinal: "uv-1" }] },
    });
    expect(r.confianza).toBe("baja");
  });

  it("BAJA: punto fuera de la comuna aunque haya calle y número", () => {
    const r = evaluar({
      estructurada: { ...base, calle: "avenida alemania", numero: "450" },
      tipo_precision: "numero",
      territorio: null,
    });
    expect(r.confianza).toBe("baja");
    expect(r.asignar).toBe(false);
    expect(r.motivo).toMatch(/fuera/i);
  });

  it("ALTA: geocodificación solo a nivel calle contradice al diccionario exacto con UV única → gana el lugar nombrado", () => {
    const r = evaluar({
      estructurada: { ...base, calle: "pasaje los aromos", numero: "123", poblacion_o_villa: "santa rosa" },
      tipo_precision: "diccionario",
      territorio: dentro,
      diccionario: { exacto: true, candidatos: [{ id: "d1", unidad_vecinal: "uv-1" }] },
      geocodificacion_descartada: "calle",
    });
    expect(r.confianza).toBe("alta");
    expect(r.motivo).toMatch(/lugar nombrado/i);
  });

  it("BAJA: calle sin número y diccionario exacto que apunta a otra UV es contradicción", () => {
    const r = evaluar({
      estructurada: { ...base, calle: "pasaje los aromos", poblacion_o_villa: "santa rosa" },
      tipo_precision: "calle",
      territorio: dentro,
      diccionario: { exacto: true, candidatos: [{ id: "d1", unidad_vecinal: "uv-5" }] },
    });
    expect(r.confianza).toBe("baja");
    expect(r.motivo).toMatch(/contradic/i);
  });

  it("BAJA: contradicción entre geocodificación y diccionario (UV distintas)", () => {
    const r = evaluar({
      estructurada: { ...base, calle: "avenida alemania", numero: "450", poblacion_o_villa: "santa rosa" },
      tipo_precision: "numero",
      territorio: dentro,
      diccionario: { exacto: true, candidatos: [{ id: "d1", unidad_vecinal: "uv-5" }] },
    });
    expect(r.confianza).toBe("baja");
    expect(r.motivo).toMatch(/contradic/i);
  });

  it("siempre devuelve un motivo legible", () => {
    expect(evaluar({}).motivo.length).toBeGreaterThan(5);
  });

  it("I3: con número pero geocodificada solo a nivel calle → motivo de número no encontrado", () => {
    const r = evaluar({ estructurada: { ...base, calle: "prat", numero: "215" }, tipo_precision: "calle", territorio: dentro });
    expect(r.confianza).toBe("media");
    expect(r.motivo).toBe("Número no encontrado en el mapa; ubicación a nivel de calle");
  });

  it("I3: sin número y nivel calle mantiene el motivo de calle sin número", () => {
    const r = evaluar({ estructurada: { ...base, calle: "prat" }, tipo_precision: "calle", territorio: dentro });
    expect(r.motivo).toBe("Solo calle sin número: ubicación aproximada");
  });

  it("I4: calle completa que no se geocodificó → no se encontró la calle", () => {
    const r = evaluar({ estructurada: { ...base, calle: "prat", numero: "215" } });
    expect(r.confianza).toBe("baja");
    expect(r.motivo).toBe("No se encontró la calle en el mapa; requiere revisión");
    expect(evaluar({ estructurada: { ...base, calle: "prat" } }).motivo).toBe(
      "No se encontró la calle en el mapa; requiere revisión",
    );
  });

  it("I4: sin calle ni lugar nombrado mantiene el mensaje de datos insuficientes", () => {
    const r = evaluar({ estructurada: { ...base, referencia: "cerca del puente" } });
    expect(r.motivo).toBe("No se pudo ubicar: solo referencias vagas o datos insuficientes");
  });

  it("I4: lugar nombrado sin calle que el diccionario no conoce → lo dice", () => {
    const r = evaluar({ estructurada: { ...base, poblacion_o_villa: "villa inexistente" } });
    expect(r.confianza).toBe("baja");
    expect(r.motivo).toBe("El lugar nombrado no está en el diccionario; requiere revisión");
  });

  it("corrección previa del funcionario → alta con motivo explícito", () => {
    const r = evaluar({
      tipo_precision: "diccionario",
      territorio: dentro,
      diccionario: { exacto: true, aprendido: true, candidatos: [{ id: "corr-1", unidad_vecinal: "uv-1" }] },
    });
    expect(r.confianza).toBe("alta");
    expect(r.motivo).toBe("Dirección corregida antes por un funcionario");
  });
});
