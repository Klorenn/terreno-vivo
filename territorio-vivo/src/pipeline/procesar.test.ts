import { describe, expect, it } from "vitest";
import { capaUV, diccionarioSeed } from "@/data";
import { expresionesDeBusqueda } from "@/domain/diccionario";
import { interpretarHeuristico } from "@/domain/heuristico";
import { centroideAproximado, uvPorId } from "@/domain/territorio";
import type { EntradaDiccionario } from "@/domain/tipos";
import { procesarRegistroCon, type Dependencias } from "./procesar";

// Sin API key: interpretación heurística y un geocodificador que no encuentra la dirección.
const sinApiKey = (geo: Awaited<ReturnType<Dependencias["geocodificar"]>>): Dependencias => ({
  interpretar: async (texto) => ({ estructurada: interpretarHeuristico(texto), fuente: "heuristico" }),
  geocodificar: async () => geo,
});
const sinGeocodificar = sinApiKey({ latitud: null, longitud: null, tipo_precision: "ninguna" });

/** Replica la entrada que crea agregarAlias (src/store/diccionario.ts) al confirmar en la bandeja. */
function entradaDeBandeja(expresion: string, uvId: string): EntradaDiccionario {
  const feature = uvPorId(uvId, capaUV);
  if (!feature) throw new Error(`UV ${uvId} no existe`);
  const [lon, lat] = centroideAproximado(feature);
  return {
    id: "corr-test",
    nombre_oficial: `Alias de ${feature.properties.nombre}`,
    alias: [expresion.trim()],
    tipo: "sector",
    latitud: lat,
    longitud: lon,
    unidad_vecinal: uvId,
    fuente: "funcionario",
    fecha_actualizacion: "2026-11-10",
  };
}

describe("ciclo corrección → reproceso (B1)", () => {
  it("una dirección de calle corregida en la bandeja se reutiliza la segunda vez con confianza alta", async () => {
    const direccion = "av alemnia 0450 dpto 3";

    const primera = await procesarRegistroCon(sinGeocodificar, { direccion }, []);
    expect(primera.confianza).toBe("baja");

    // Lo que hace la bandeja de revisión: alias = primera expresión de búsqueda.
    const alias = expresionesDeBusqueda(primera.estructurada)[0] ?? primera.direccion_original;
    const diccionario = [entradaDeBandeja(alias, "uv-05")];

    const segunda = await procesarRegistroCon(sinGeocodificar, { direccion }, diccionario);
    expect(segunda.uv_id).toBe("uv-05");
    expect(segunda.confianza).toBe("alta");
  });

  it("la corrección del funcionario gana aunque el mapa ubique la dirección en otra UV", async () => {
    const direccion = "av alemnia 0450 dpto 3";
    const primera = await procesarRegistroCon(sinGeocodificar, { direccion }, []);
    const alias = expresionesDeBusqueda(primera.estructurada)[0];
    const otra = uvPorId("uv-01", capaUV);
    if (!otra) throw new Error("falta uv-01");
    const [lon, lat] = centroideAproximado(otra);
    const deps = sinApiKey({ latitud: lat, longitud: lon, tipo_precision: "numero" });

    const segunda = await procesarRegistroCon(deps, { direccion }, [entradaDeBandeja(alias, "uv-05")]);
    expect(segunda.uv_id).toBe("uv-05");
    expect(segunda.confianza).toBe("alta");
  });

  it("I3: dirección con número resuelta solo a nivel calle explica que no se encontró el número", async () => {
    const feature = uvPorId("uv-05", capaUV);
    if (!feature) throw new Error("falta uv-05");
    const [lon, lat] = centroideAproximado(feature);
    const deps = sinApiKey({ latitud: lat, longitud: lon, tipo_precision: "calle" });
    const r = await procesarRegistroCon(deps, { direccion: "Calle Prat 215, Temuco" }, []);
    expect(r.confianza).toBe("media");
    expect(r.motivo).toBe("Número no encontrado en el mapa; ubicación a nivel de calle");
  });

  it("pasaje con número resuelto solo a nivel calle y sin lugar que lo confirme va a revisión", async () => {
    const feature = uvPorId("uv-05", capaUV);
    if (!feature) throw new Error("falta uv-05");
    const [lon, lat] = centroideAproximado(feature);
    const deps = sinApiKey({ latitud: lat, longitud: lon, tipo_precision: "calle" });
    const r = await procesarRegistroCon(deps, { direccion: "pasaje las rosas casa 8" }, []);
    expect(r.confianza).toBe("baja");
    expect(r.uv_id).toBeNull();
  });

  it("I4: calle completa sin geocodificar → no se encontró la calle", async () => {
    const r = await procesarRegistroCon(sinGeocodificar, { direccion: "Calle Prat 215, Temuco" }, []);
    expect(r.confianza).toBe("baja");
    expect(r.motivo).toBe("No se encontró la calle en el mapa; requiere revisión");
  });
});

describe("ejemplo rural del guion", () => {
  it("'comunidad juan cayunao, camino a tromén km 4, frente a la escuela' resuelve por diccionario sin red", async () => {
    let llamadasGeo = 0;
    const deps: Dependencias = {
      interpretar: async (texto) => ({ estructurada: interpretarHeuristico(texto), fuente: "heuristico" }),
      geocodificar: async () => {
        llamadasGeo += 1;
        return { latitud: null, longitud: null, tipo_precision: "ninguna" };
      },
    };
    const r = await procesarRegistroCon(deps, { direccion: "comunidad juan cayunao, camino a tromén km 4, frente a la escuela" }, diccionarioSeed);
    expect(llamadasGeo).toBe(0);
    expect(r.tipo_precision).toBe("diccionario");
    expect(r.confianza).toBe("alta");
    expect(r.uv_id).toBe("uv-33");
  });
});
