import { describe, expect, it } from "vitest";
import { CLAVE_CORRECCIONES } from "./diccionario";
import { CLAVE_RESULTADOS } from "./resultados";

describe("claves de localStorage versionadas", () => {
  it("usan el prefijo tv:v2: para no leer datos de la capa simulada anterior", () => {
    expect(CLAVE_RESULTADOS).toBe("tv:v2:resultados");
    expect(CLAVE_CORRECCIONES).toBe("tv:v2:diccionario:correcciones");
  });
});
