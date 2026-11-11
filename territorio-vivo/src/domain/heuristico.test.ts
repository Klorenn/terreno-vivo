import { describe, expect, it } from "vitest";
import { interpretarHeuristico } from "./heuristico";

describe("interpretarHeuristico", () => {
  it("categoría 1: urbana bien escrita → calle y número", () => {
    const r = interpretarHeuristico("Avenida Alemania 0450, Temuco");
    expect(r.texto_original).toBe("Avenida Alemania 0450, Temuco");
    expect(r.calle).toBe("avenida alemania");
    expect(r.numero).toBe("0450");
    expect(r.poblacion_o_villa).toBe("");
    expect(r.es_rural).toBe(false);
  });

  it("categoría 2: urbana con errores y abreviaturas", () => {
    const r = interpretarHeuristico("av alemnia 0450 dpto 3");
    expect(r.calle).toBe("avenida alemania");
    expect(r.numero).toBe("0450");
    expect(r.observaciones).toContain("abreviaturas expandidas");
    expect(r.observaciones).toContain("Calle corregida: alemnia → alemania");
  });

  it("corrige tipeos de calles conocidas de Temuco", () => {
    expect(interpretarHeuristico("Balmaseda 1250").calle).toBe("balmaceda");
    expect(interpretarHeuristico("vicuna mackena 450, Temuco").calle).toBe("vicuña mackenna");
    expect(interpretarHeuristico("andres vello 820").calle).toBe("andres bello");
  });

  it("no corrige calles desconocidas ni registra observación", () => {
    const r = interpretarHeuristico("pje los aromos 123 pob sta rosa");
    expect(r.calle).toBe("pasaje los aromos");
    expect(r.observaciones).not.toContain("Calle corregida");
  });

  it("categoría 3: población o villa por nombre, con pasaje y casa", () => {
    const r = interpretarHeuristico("villa los alerces, pasaje 3, casa 12");
    expect(r.poblacion_o_villa).toBe("los alerces");
    expect(r.calle).toBe("pasaje 3");
    expect(r.numero).toBe("12");
    expect(r.es_rural).toBe(false);
  });

  it("categoría 3: 'pje los aromos 123 pob sta rosa' separa calle y población", () => {
    const r = interpretarHeuristico("pje los aromos 123 pob sta rosa");
    expect(r.calle).toBe("pasaje los aromos");
    expect(r.numero).toBe("123");
    expect(r.poblacion_o_villa).toBe("santa rosa");
  });

  it("categoría 4: rural con camino, km y referencia", () => {
    const r = interpretarHeuristico(
      "camino a cajón km 5, frente a la escuela",
    );
    expect(r.camino_y_km).toBe("camino a cajon kilometro 5");
    expect(r.referencia).toBe("frente a la escuela");
    expect(r.es_rural).toBe(true);
    expect(r.calle).toBe("");
    expect(r.numero).toBe("");
  });

  it("categoría 4: comunidad rural", () => {
    const r = interpretarHeuristico("comunidad rayen mapu, sector tromen");
    expect(r.comunidad).toBe("rayen mapu");
    expect(r.es_rural).toBe(true);
  });

  it("solo referencia vaga: todo vacío salvo referencia", () => {
    const r = interpretarHeuristico("al lado del consultorio");
    expect(r.calle).toBe("");
    expect(r.numero).toBe("");
    expect(r.referencia).toBe("al lado del consultorio");
  });

  it("calle sin número deja numero vacío", () => {
    const r = interpretarHeuristico("calle prat sin número");
    expect(r.calle).toBe("calle prat");
    expect(r.numero).toBe("");
  });
});
