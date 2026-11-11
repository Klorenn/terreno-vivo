import { describe, expect, it } from "vitest";
import { corregirCalle, distanciaEdicion } from "./calles";

describe("distanciaEdicion", () => {
  it("cuenta inserciones, borrados, sustituciones y transposiciones", () => {
    expect(distanciaEdicion("alemnia", "alemania")).toBe(1);
    expect(distanciaEdicion("prta", "prat")).toBe(1);
    expect(distanciaEdicion("igual", "igual")).toBe(0);
    expect(distanciaEdicion("", "abc")).toBe(3);
  });
});

describe("corregirCalle", () => {
  it.each([
    ["alemnia", "alemania"],
    ["balmaseda", "balmaceda"],
    ["hoschtetter", "hochstetter"],
    ["vicuna mackena", "vicuña mackenna"],
    ["andres vello", "andres bello"],
    ["javiera carera", "javiera carrera"],
    ["aldunte", "aldunate"],
    ["labransa", "labranza"],
  ])("corrige el tipeo '%s' → '%s'", (entrada, esperado) => {
    expect(corregirCalle(entrada)).toEqual({ calle: esperado, corregida: true });
  });

  it("conserva el tipo de vía expandido por el normalizador", () => {
    expect(corregirCalle("avenida alemnia")).toEqual({ calle: "avenida alemania", corregida: true });
    expect(corregirCalle("pasaje balmaseda")).toEqual({ calle: "pasaje balmaceda", corregida: true });
  });

  it("no corrige una calle que no está en la lista ('los aromos')", () => {
    expect(corregirCalle("pasaje los aromos")).toEqual({ calle: "pasaje los aromos", corregida: false });
  });

  it("no cambia un nombre corto que ya es válido ('prat')", () => {
    expect(corregirCalle("prat")).toEqual({ calle: "prat", corregida: false });
  });

  it("no inventa nada sobre texto vacío", () => {
    expect(corregirCalle("")).toEqual({ calle: "", corregida: false });
    expect(corregirCalle("   ")).toEqual({ calle: "", corregida: false });
  });

  it("no toca pasajes numerados ni nombres ya correctos", () => {
    expect(corregirCalle("pasaje 3")).toEqual({ calle: "pasaje 3", corregida: false });
    expect(corregirCalle("avenida alemania")).toEqual({ calle: "avenida alemania", corregida: false });
  });
});
