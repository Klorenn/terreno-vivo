// Genera benchmark/set-100.csv a partir de definicion-set.ts: resuelve la coordenada de referencia
// (nominatim cacheado / diccionario / manual) y calcula la UV esperada contra la capa real de UV (MIDESOF/BIDAT 2026).
// Uso: pnpm benchmark:generar

import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { capaMacrosectores, capaUV, diccionarioSeed } from "@/data";
import { cruzarTerritorio } from "@/domain/territorio";
import { crearGeocodificador } from "@/servicios/geocodificacion";
import { cacheEnArchivo } from "./cache-archivo";
import { DEFINICION } from "./definicion-set";

const RUTA_SET = path.join(__dirname, "set-100.csv");

async function main() {
  const geocodificar = crearGeocodificador({ acotar: true, cache: cacheEnArchivo() });
  const filas: Record<string, string | number>[] = [];
  const problemas: string[] = [];
  const porCategoria: Record<string, number> = {};

  for (const [i, caso] of DEFINICION.entries()) {
    const id = `c${String(i + 1).padStart(3, "0")}`;
    let lat: number | null = null;
    let lon: number | null = null;
    let fuente: string = caso.referencia.tipo;
    if (caso.referencia.tipo === "diccionario") {
      const idRef = caso.referencia.id;
      const entrada = diccionarioSeed.find((e) => e.id === idRef);
      if (!entrada) {
        problemas.push(`${id}: entrada ${idRef} no existe`);
        continue;
      }
      lat = entrada.latitud;
      lon = entrada.longitud;
    } else if (caso.referencia.tipo === "manual") {
      lat = caso.referencia.latitud;
      lon = caso.referencia.longitud;
    } else {
      const geo = await geocodificar(caso.referencia.consulta);
      if (geo.latitud === null || geo.longitud === null) {
        problemas.push(`${id}: Nominatim no encontró "${caso.referencia.consulta}"`);
        continue;
      }
      lat = geo.latitud;
      lon = geo.longitud;
      fuente = `nominatim (${geo.tipo_precision})`;
      process.stdout.write(`  ${id} ${caso.referencia.consulta} → ${geo.tipo_precision}\n`);
    }
    const territorio = cruzarTerritorio(lon, lat, capaUV, capaMacrosectores);
    if (!territorio) {
      problemas.push(`${id}: el punto de referencia (${lat}, ${lon}) cae fuera de la capa de UV`);
      continue;
    }
    porCategoria[caso.categoria] = (porCategoria[caso.categoria] ?? 0) + 1;
    filas.push({
      id,
      categoria: caso.categoria,
      direccion: caso.direccion,
      uv_esperada: territorio.uv_id,
      lat_ref: lat,
      lon_ref: lon,
      fuente_verificacion: fuente,
      nota: caso.nota ?? "",
    });
  }

  fs.writeFileSync(RUTA_SET, Papa.unparse(filas) + "\n");
  console.log(`\nEscrito ${RUTA_SET}: ${filas.length} casos`, porCategoria);
  if (problemas.length > 0) {
    console.log("\nProblemas:");
    for (const p of problemas) console.log(" -", p);
    process.exitCode = 1;
  }
}

void main();
