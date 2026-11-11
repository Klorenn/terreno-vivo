// Cruce territorial: punto dentro de polígono contra UV y macrosector.

import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import type { PropiedadesMacrosector, PropiedadesUV, ResultadoTerritorial } from "./tipos";

type Capa<P> = FeatureCollection<Polygon | MultiPolygon, P>;

function buscarFeature<P>(lon: number, lat: number, capa: Capa<P>): Feature<Polygon | MultiPolygon, P> | null {
  const p = point([lon, lat]);
  for (const feature of capa.features) {
    if (booleanPointInPolygon(p, feature as Feature<Polygon | MultiPolygon>)) return feature;
  }
  return null;
}

export function cruzarTerritorio(
  longitud: number,
  latitud: number,
  capaUV: Capa<PropiedadesUV>,
  capaMacro: Capa<PropiedadesMacrosector>,
): ResultadoTerritorial | null {
  const uv = buscarFeature(longitud, latitud, capaUV);
  if (!uv) return null;
  const macro = buscarFeature(longitud, latitud, capaMacro);
  return {
    uv_id: uv.properties.id,
    uv_nombre: uv.properties.nombre,
    macrosector: macro?.properties.nombre ?? uv.properties.macrosector,
  };
}

/** Busca una UV por id en la capa. */
export function uvPorId(id: string, capaUV: Capa<PropiedadesUV>): Feature<Polygon | MultiPolygon, PropiedadesUV> | null {
  return capaUV.features.find((f) => f.properties.id === id) ?? null;
}

/** Centroide aproximado (promedio de vértices del anillo exterior). Suficiente para un punto representativo. */
export function centroideAproximado(feature: Feature<Polygon | MultiPolygon, unknown>): [number, number] {
  const anillo =
    feature.geometry.type === "Polygon"
      ? feature.geometry.coordinates[0]
      : feature.geometry.coordinates[0][0];
  const n = anillo.length - 1;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < n; i++) {
    sx += anillo[i][0];
    sy += anillo[i][1];
  }
  return [sx / n, sy / n];
}
