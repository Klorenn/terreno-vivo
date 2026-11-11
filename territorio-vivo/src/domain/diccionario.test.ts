import { describe, expect, it } from "vitest";
import { buscarEnDiccionario, correccionesValidas, expresionesDeBusqueda } from "./diccionario";
import type { DireccionEstructurada, EntradaDiccionario } from "./tipos";

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

const entradas: EntradaDiccionario[] = [
  {
    id: "d1",
    nombre_oficial: "Población Santa Rosa",
    alias: ["santa rosa", "pob santa rosa", "la santa rosa"],
    tipo: "poblacion",
    latitud: -38.74,
    longitud: -72.59,
    unidad_vecinal: "uv-3",
    fuente: "equipo",
    fecha_actualizacion: "2026-11-10",
  },
  {
    id: "d2",
    nombre_oficial: "Villa Los Alerces",
    alias: ["los alerces", "villa alerces"],
    tipo: "villa",
    latitud: -38.72,
    longitud: -72.61,
    unidad_vecinal: null,
    fuente: "equipo",
    fecha_actualizacion: "2026-11-10",
  },
  {
    id: "d3",
    nombre_oficial: "Escuela Santa Rosa de Lima",
    alias: ["escuela santa rosa"],
    tipo: "hito",
    latitud: -38.741,
    longitud: -72.591,
    unidad_vecinal: "uv-3",
    fuente: "equipo",
    fecha_actualizacion: "2026-11-10",
  },
];

describe("expresionesDeBusqueda", () => {
  it("quita el conector y artículos al inicio de la referencia", () => {
    expect(expresionesDeBusqueda({ ...base, referencia: "frente a la posta de cajon" })).toEqual(["posta de cajon"]);
    expect(expresionesDeBusqueda({ ...base, referencia: "al lado del consultorio" })).toEqual([]);
    expect(expresionesDeBusqueda({ ...base, referencia: "detrás de la sede vecinal" })).toEqual(["sede vecinal"]);
    expect(expresionesDeBusqueda({ ...base, referencia: "a la vuelta de los bomberos" })).toEqual(["bomberos"]);
    expect(expresionesDeBusqueda({ ...base, referencia: "pasando el puente" })).toEqual(["puente"]);
  });

  it("separa el camino del kilómetro y agrega el nombre sin prefijo", () => {
    expect(expresionesDeBusqueda({ ...base, camino_y_km: "camino a tromen kilometro 4" })).toEqual(["camino a tromen", "tromen"]);
    expect(expresionesDeBusqueda({ ...base, camino_y_km: "camino el carmen km 3" })).toEqual(["camino el carmen", "el carmen"]);
  });

  it("ordena población, comunidad, camino, referencia y descarta vacíos", () => {
    expect(
      expresionesDeBusqueda({
        ...base,
        poblacion_o_villa: "Santa Rosa",
        referencia: "frente a la escuela",
      }),
    ).toEqual(["santa rosa"]);
  });
});

describe("buscarEnDiccionario", () => {
  it("match exacto por alias normalizado (insensible a tildes y mayúsculas)", () => {
    const r = buscarEnDiccionario(
      { ...base, poblacion_o_villa: "Pob. Sta. Rosa" },
      entradas,
    );
    expect(r.exacto).toBe(true);
    expect(r.candidatos.map((c) => c.id)).toEqual(["d1"]);
  });

  it("match exacto también contra nombre_oficial", () => {
    const r = buscarEnDiccionario(
      { ...base, poblacion_o_villa: "villa los alerces" },
      entradas,
    );
    expect(r.exacto).toBe(true);
    expect(r.candidatos[0].id).toBe("d2");
  });

  it("si no hay exacto, devuelve candidatos por contención", () => {
    const r = buscarEnDiccionario(
      { ...base, referencia: "frente a la escuela santa rosa de lima vieja" },
      entradas,
    );
    expect(r.exacto).toBe(false);
    expect(r.candidatos.map((c) => c.id)).toContain("d3");
  });

  it("devuelve lista vacía si nada coincide", () => {
    const r = buscarEnDiccionario(
      { ...base, poblacion_o_villa: "villa inexistente" },
      entradas,
    );
    expect(r.exacto).toBe(false);
    expect(r.candidatos).toEqual([]);
  });

  it("referencia con conector da match exacto con el alias del hito", () => {
    const r = buscarEnDiccionario({ ...base, referencia: "frente a la posta de cajon" }, [
      ...entradas,
      { id: "d4", nombre_oficial: "Posta Rural Cajón", alias: ["posta de cajon", "la posta"], tipo: "hito", latitud: -38.79, longitud: -72.52, unidad_vecinal: "uv-9", fuente: "equipo", fecha_actualizacion: "2026-11-10" },
    ]);
    expect(r.exacto).toBe(true);
    expect(r.candidatos[0].id).toBe("d4");
  });

  it("camino con km da match exacto con la entrada del camino, con y sin km", () => {
    const camino = { id: "d5", nombre_oficial: "Camino a Tromén", alias: ["camino a tromen", "camino tromen"], tipo: "camino" as const, latitud: -38.78, longitud: -72.66, unidad_vecinal: "uv-7", fuente: "equipo" as const, fecha_actualizacion: "2026-11-10" };
    expect(buscarEnDiccionario({ ...base, camino_y_km: "camino a tromen kilometro 4" }, [camino]).exacto).toBe(true);
    expect(buscarEnDiccionario({ ...base, camino_y_km: "camino a tromen" }, [camino]).exacto).toBe(true);
  });

  it("prioriza el match exacto aunque otra entrada contenga el texto", () => {
    const r = buscarEnDiccionario(
      { ...base, poblacion_o_villa: "santa rosa" },
      entradas,
    );
    expect(r.exacto).toBe(true);
    expect(r.candidatos.map((c) => c.id)).toEqual(["d1"]);
  });
});

describe("expresionesDeBusqueda — aprendizaje desde calles y texto original (B1)", () => {
  it("sin lugar nombrado, agrega el texto original normalizado y la calle sin número ni depto", () => {
    const d = { ...base, texto_original: "Av. Alemnia 0450 dpto 3, Temuco", calle: "avenida alemania", numero: "0450" };
    expect(expresionesDeBusqueda(d)).toEqual(["avenida alemnia 0450 departamento 3", "avenida alemania"]);
  });

  it("limpia número, depto, oficina y casa que vengan pegados a la calle", () => {
    const d = { ...base, calle: "Avenida Alemania 0450 depto 3" };
    expect(expresionesDeBusqueda(d)).toEqual(["avenida alemania"]);
    expect(expresionesDeBusqueda({ ...base, calle: "prat 215 oficina 4" })).toEqual(["prat"]);
    expect(expresionesDeBusqueda({ ...base, calle: "balmaceda casa 12" })).toEqual(["balmaceda"]);
  });

  it("los lugares nombrados siguen primero; calle y texto van al final", () => {
    const d = { ...base, texto_original: "pje los aromos 123 pob sta rosa", calle: "pasaje los aromos", numero: "123", poblacion_o_villa: "santa rosa" };
    expect(expresionesDeBusqueda(d)).toEqual(["santa rosa", "pasaje los aromos 123 poblacion santa rosa", "pasaje los aromos"]);
  });

  it("no repite expresiones", () => {
    const d = { ...base, texto_original: "Avenida Alemania", calle: "avenida alemania" };
    expect(expresionesDeBusqueda(d)).toEqual(["avenida alemania"]);
  });
});

describe("expresionesDeBusqueda — alias genéricos (I6)", () => {
  it("descarta una expresión de un solo token genérico", () => {
    expect(expresionesDeBusqueda({ ...base, referencia: "detrás de la sede" })).toEqual([]);
    expect(expresionesDeBusqueda({ ...base, referencia: "frente a la escuela" })).toEqual([]);
    expect(expresionesDeBusqueda({ ...base, referencia: "al lado de la plaza" })).toEqual([]);
    expect(expresionesDeBusqueda({ ...base, poblacion_o_villa: "villa" })).toEqual([]);
  });

  it("acepta el genérico acompañado de otro token", () => {
    expect(expresionesDeBusqueda({ ...base, referencia: "frente a la sede santa rosa" })).toEqual(["sede santa rosa"]);
  });
});

describe("buscarEnDiccionario — correcciones del funcionario por texto (B1)", () => {
  const correccion: EntradaDiccionario = {
    id: "corr-1",
    nombre_oficial: "Alias de UV 5 Centro",
    alias: ["avenida alemnia 0450 departamento 3"],
    tipo: "sector",
    latitud: -38.74,
    longitud: -72.6,
    unidad_vecinal: "uv-05",
    fuente: "funcionario",
    fecha_actualizacion: "2026-11-10",
  };
  const direccion = { ...base, texto_original: "av alemnia 0450 dpto 3", calle: "avenida alemania", numero: "0450" };

  it("coincide exactamente con el alias guardado desde la bandeja", () => {
    const r = buscarEnDiccionario(direccion, [correccion, ...entradas]);
    expect(r.exacto).toBe(true);
    expect(r.candidatos.map((c) => c.id)).toEqual(["corr-1"]);
    expect(r.aprendido).toBe(true);
  });

  it("calle y texto solo coinciden con correcciones del funcionario, no con el seed", () => {
    const seedConNombreDeCalle = { ...entradas[0], id: "s1", alias: ["avenida alemania"] };
    const r = buscarEnDiccionario(direccion, [seedConNombreDeCalle]);
    expect(r.exacto).toBe(false);
    expect(r.candidatos).toEqual([]);
  });

  it("un lugar nombrado no queda marcado como aprendido", () => {
    expect(buscarEnDiccionario({ ...base, poblacion_o_villa: "santa rosa" }, entradas).aprendido).toBe(false);
  });
});

describe("correccionesValidas", () => {
  const corr = (id: string, uv: string | null): EntradaDiccionario => ({ ...entradas[0], id, unidad_vecinal: uv, fuente: "funcionario" });
  const validas = new Set(["uv-01", "uv-05"]);

  it("descarta correcciones cuya UV no existe en la capa actual", () => {
    const r = correccionesValidas([corr("a", "uv-01"), corr("b", "uv-99"), corr("c", "uv-8")], validas);
    expect(r.map((e) => e.id)).toEqual(["a"]);
  });

  it("descarta correcciones sin UV (una corrección siempre asigna una UV)", () => {
    expect(correccionesValidas([corr("a", null)], validas)).toEqual([]);
  });

  it("devuelve el mismo arreglo si no hay nada que descartar (identidad estable para el store)", () => {
    const lista = [corr("a", "uv-01"), corr("b", "uv-05")];
    expect(correccionesValidas(lista, validas)).toBe(lista);
  });
});
