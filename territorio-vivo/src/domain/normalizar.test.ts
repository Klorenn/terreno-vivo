import { describe, expect, it } from "vitest";
import { normalizarTexto, quitarTildes } from "./normalizar";

describe("quitarTildes", () => {
  it("elimina tildes y diéresis conservando la ñ", () => {
    expect(quitarTildes("Ñuñoa Pérez Agüero")).toBe("Ñuñoa Perez Aguero");
  });
});

describe("normalizarTexto", () => {
  it("pasa a minúsculas, quita tildes y colapsa espacios", () => {
    expect(normalizarTexto("  Avenida   ALEMANIA  ")).toBe("avenida alemania");
  });

  it("expande abreviaturas comunes de direcciones chilenas", () => {
    expect(normalizarTexto("av alemania 0450 dpto 3")).toBe(
      "avenida alemania 0450 departamento 3",
    );
    expect(normalizarTexto("avda. alemania")).toBe("avenida alemania");
    expect(normalizarTexto("pje los aromos 123 pob sta rosa")).toBe(
      "pasaje los aromos 123 poblacion santa rosa",
    );
    expect(normalizarTexto("Pobl. Lanín")).toBe("poblacion lanin");
    expect(normalizarTexto("camino a labranza km. 5")).toBe(
      "camino a labranza kilometro 5",
    );
    expect(normalizarTexto("Sto. Domingo s/n")).toBe("santo domingo sin numero");
  });

  it("no expande palabras que solo contienen la abreviatura", () => {
    expect(normalizarTexto("avellanos")).toBe("avellanos");
    expect(normalizarTexto("pobre")).toBe("pobre");
  });

  it("quita puntuación suelta pero conserva números", () => {
    expect(normalizarTexto("Calle Prat, N° 1234.")).toBe("calle prat numero 1234");
  });
});
