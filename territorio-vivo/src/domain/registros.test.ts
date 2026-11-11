import { describe, expect, it } from "vitest";
import { insertarRegistro } from "./registros";
import type { RegistroProcesado } from "./tipos";

function registro(id: string, direccion: string, extra: Partial<RegistroProcesado> = {}): RegistroProcesado {
  return {
    id,
    direccion_original: direccion,
    estructurada: {
      texto_original: direccion, calle: "", numero: "", poblacion_o_villa: "", comunidad: "",
      camino_y_km: "", referencia: "", es_rural: false, observaciones: "",
    },
    coordenadas: null,
    tipo_precision: "ninguna",
    uv_id: null,
    uv_nombre: null,
    macrosector: null,
    confianza: "baja",
    motivo: "x",
    fuente_interpretacion: "heuristico",
    tipo_prestacion: "Sin tipo",
    fecha: "",
    ...extra,
  };
}

describe("insertarRegistro", () => {
  it("agrega al inicio un registro nuevo", () => {
    const r = insertarRegistro([registro("a", "prat 215")], registro("b", "bulnes 480"));
    expect(r.map((x) => x.id)).toEqual(["b", "a"]);
  });

  it("reemplaza por id si ya existe", () => {
    const r = insertarRegistro([registro("a", "prat 215")], registro("a", "prat 215", { confianza: "alta" }));
    expect(r).toHaveLength(1);
    expect(r[0].confianza).toBe("alta");
  });

  it("reemplaza un pendiente con la misma dirección normalizada en vez de duplicarlo", () => {
    const actuales = [registro("x", "otra 1"), registro("a", "Av. Alemnia 0450, dpto 3")];
    const r = insertarRegistro(actuales, registro("b", "av alemnia 0450 dpto 3"));
    expect(r.map((x) => x.id)).toEqual(["b", "x"]);
  });

  it("no reemplaza registros ya resueltos o corregidos a mano con la misma dirección", () => {
    const actuales = [
      registro("a", "prat 215", { confianza: "media" }),
      registro("c", "prat 215", { corregido_manualmente: true }),
    ];
    const r = insertarRegistro(actuales, registro("b", "Prat 215"));
    expect(r.map((x) => x.id)).toEqual(["b", "a", "c"]);
  });
});
