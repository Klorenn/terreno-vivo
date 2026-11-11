// Cache de Nominatim persistida en benchmark/cache-nominatim.json (clave: consulta).

import fs from "node:fs";
import path from "node:path";
import type { CacheGeo, ResultadoGeo } from "@/servicios/geocodificacion";

export const RUTA_CACHE = path.join(__dirname, "cache-nominatim.json");

export function cacheEnArchivo(ruta = RUTA_CACHE): CacheGeo & { tamano: () => number } {
  let datos: Record<string, ResultadoGeo> = {};
  try {
    datos = JSON.parse(fs.readFileSync(ruta, "utf8")) as Record<string, ResultadoGeo>;
  } catch {
    datos = {};
  }
  return {
    obtener: (clave) => datos[clave],
    guardar: (clave, valor) => {
      datos[clave] = valor;
      fs.writeFileSync(ruta, JSON.stringify(datos, null, 1));
    },
    tamano: () => Object.keys(datos).length,
  };
}
