import { describe, expect, it } from "vitest";
import type { FeatureCollection, Polygon } from "geojson";
import { cruzarTerritorio } from "./territorio";
import type { PropiedadesMacrosector, PropiedadesUV } from "./tipos";

const uv: FeatureCollection<Polygon, PropiedadesUV> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: "uv-1", nombre: "UV 1 Norte", macrosector: "ms-a", poblacion: 1000 },
      geometry: {
        type: "Polygon",
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      },
    },
    {
      type: "Feature",
      properties: { id: "uv-2", nombre: "UV 2 Sur", macrosector: "ms-b", poblacion: 2000 },
      geometry: {
        type: "Polygon",
        coordinates: [[[1, 0], [2, 0], [2, 1], [1, 1], [1, 0]]],
      },
    },
  ],
};

const macro: FeatureCollection<Polygon, PropiedadesMacrosector> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: "ms-a", nombre: "Macrosector A" },
      geometry: {
        type: "Polygon",
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      },
    },
    {
      type: "Feature",
      properties: { id: "ms-b", nombre: "Macrosector B" },
      geometry: {
        type: "Polygon",
        coordinates: [[[1, 0], [2, 0], [2, 1], [1, 1], [1, 0]]],
      },
    },
  ],
};

describe("cruzarTerritorio", () => {
  it("punto dentro devuelve UV y macrosector", () => {
    expect(cruzarTerritorio(0.5, 0.5, uv, macro)).toEqual({
      uv_id: "uv-1",
      uv_nombre: "UV 1 Norte",
      macrosector: "Macrosector A",
    });
    expect(cruzarTerritorio(1.5, 0.5, uv, macro)?.uv_id).toBe("uv-2");
  });

  it("punto fuera de toda UV devuelve null", () => {
    expect(cruzarTerritorio(5, 5, uv, macro)).toBeNull();
  });

  it("si la UV existe pero el macrosector no cubre el punto, usa el de la propiedad de la UV", () => {
    const macroVacio: FeatureCollection<Polygon, PropiedadesMacrosector> = {
      type: "FeatureCollection",
      features: [],
    };
    expect(cruzarTerritorio(0.5, 0.5, uv, macroVacio)?.macrosector).toBe("ms-a");
  });
});
