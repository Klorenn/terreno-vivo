// Carga tipada de las capas y del diccionario. Datos reales de fuentes abiertas (detalle en docs/datos.md):
// - uv.json: 36 unidades vecinales de Temuco. Límites: capa de UV del Registro Social de Hogares
//   (MIDESOF / BIDAT, junio 2026, CC BY 4.0), de carácter referencial. Población: Censo 2024 (INE).
// - macrosectores.json: 11 macrosectores (10 urbanos + Rural) según la Tabla 1 del PLADECO Temuco
//   2020-2024, formados uniendo sus UV.
// - diccionario.json: hitos y lugares de OpenStreetMap (© colaboradores de OSM, ODbL) y entidades
//   rurales del Censo 2024 (INE). Lo regenera benchmark/datos-reales/integrar-diccionario.ts.

import type { FeatureCollection, Polygon } from "geojson";
import type { EntradaDiccionario, PropiedadesMacrosector, PropiedadesUV } from "@/domain/tipos";
import uvJson from "./uv.json";
import macroJson from "./macrosectores.json";
import diccionarioJson from "./diccionario.json";

// Todas las geometrías actuales son Polygon. Si una regeneración produce MultiPolygon, el cruce
// territorial (src/domain/territorio.ts) ya lo acepta; habría que ampliar este tipo.
export const capaUV = uvJson as unknown as FeatureCollection<Polygon, PropiedadesUV>;
export const capaMacrosectores = macroJson as unknown as FeatureCollection<Polygon, PropiedadesMacrosector>;
export const diccionarioSeed = diccionarioJson as EntradaDiccionario[];

/** Caja de la comuna de Temuco (límite INE 2024) [oeste, sur, este, norte]. Acota la geocodificación. */
export const CAJA_COMUNA: [number, number, number, number] = [-72.8235, -38.7824, -72.4695, -38.5493];
export const CENTRO_TEMUCO: [number, number] = [-72.5904, -38.7359];

type Bbox = [number, number, number, number];

/** Caja [minLon, minLat, maxLon, maxLat] de los polígonos entregados. */
function bboxDe(features: ReadonlyArray<{ geometry: Polygon }>): Bbox {
  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;
  for (const f of features) {
    for (const anillo of f.geometry.coordinates) {
      for (const [lon, lat] of anillo) {
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    }
  }
  return [minLon, minLat, maxLon, maxLat];
}

/** Caja [minLon, minLat, maxLon, maxLat] de todas las UV. */
export const BBOX_COMUNA: Bbox = bboxDe(capaUV.features);

const MACROSECTORES_FUERA_DEL_NUCLEO = ["Rural", "Labranza", "Botrolhue"];
const uvUrbanas = capaUV.features.filter(
  (f) => !MACROSECTORES_FUERA_DEL_NUCLEO.some((m) => String(f.properties.macrosector).includes(m)),
);
/** Caja del núcleo urbano de Temuco (sin Rural, Labranza ni Botrolhue, que quedan a 10 km o más); si quedan menos de 5 UV, la de todas. */
export const BBOX_URBANO: Bbox = uvUrbanas.length >= 5 ? bboxDe(uvUrbanas) : BBOX_COMUNA;
