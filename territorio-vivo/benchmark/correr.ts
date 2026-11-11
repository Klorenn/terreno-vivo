// Benchmark E9: sistema completo vs geocodificador genérico sobre set-100.csv (sección 8).
// Uso: pnpm benchmark   (con ANTHROPIC_API_KEY usa el modelo; si no, heurístico)

import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { capaMacrosectores, capaUV, diccionarioSeed } from "@/data";
import { calcularMetricas, CATEGORIAS, evaluarGenerico, evaluarSistema, type Categoria, type Evaluacion, type Metricas } from "@/domain/metricas";
import { cruzarTerritorio } from "@/domain/territorio";
import type { RegistroProcesado } from "@/domain/tipos";
import { procesarRegistroCon } from "@/pipeline/procesar";
import { crearGeocodificador } from "@/servicios/geocodificacion";
import { hayModeloDisponible, interpretarDireccion } from "@/servicios/interpretacion";
import { cacheEnArchivo } from "./cache-archivo";

interface FilaSet {
  id: string;
  categoria: Categoria;
  direccion: string;
  uv_esperada: string;
  lat_ref: string;
  lon_ref: string;
  fuente_verificacion: string;
  nota: string;
}

interface ResultadoCaso {
  id: string;
  categoria: Categoria;
  direccion: string;
  uv_esperada: string;
  sistema: { uv_id: string | null; confianza: RegistroProcesado["confianza"]; motivo: string; tipo_precision: string; fuente: string };
  generico: { uv_id: string | null; nombre_encontrado: string | null };
}

const RUTA_SET = path.join(__dirname, "set-100.csv");
const RUTA_INFORME = path.join(__dirname, "informe.md");
const RUTA_RESULTADOS = path.join(__dirname, "resultados.json");

const nombreUV = (id: string | null) => (id ? (capaUV.features.find((f) => f.properties.id === id)?.properties.nombre ?? id) : "—");

function filaMetricas(etiqueta: string, s: Metricas, g: Metricas): string {
  return `| ${etiqueta} | ${s.n} | ${s.acierto}% | ${g.acierto}% | ${s.derivacion}% | ${g.derivacion}% | ${s.error_silencioso}% | ${g.error_silencioso}% |`;
}

async function main() {
  const inicio = Date.now();
  const set = Papa.parse<FilaSet>(fs.readFileSync(RUTA_SET, "utf8"), { header: true, skipEmptyLines: true }).data;
  if (set.length === 0) throw new Error(`Set vacío: ${RUTA_SET}. Corré pnpm benchmark:generar.`);

  const cache = cacheEnArchivo();
  const deps = {
    interpretar: interpretarDireccion,
    geocodificar: crearGeocodificador({ acotar: true, cache }),
  };
  // Geocodificador genérico: la dirección tal cual + ", Temuco, Chile", sin acotar ni interpretar.
  const geocodificarGenerico = crearGeocodificador({ acotar: false, sufijo: ", Temuco, Chile", cache });

  const fuenteInterpretacion = hayModeloDisponible() ? "modelo de lenguaje (claude-opus-5-5)" : "parser heurístico (sin ANTHROPIC_API_KEY)";
  console.log(`Set: ${set.length} casos · interpretación: ${fuenteInterpretacion} · cache Nominatim: ${cache.tamano()} entradas\n`);

  const resultados: ResultadoCaso[] = [];
  const evSistema: Evaluacion[] = [];
  const evGenerico: Evaluacion[] = [];

  for (const fila of set) {
    const caso = { id: fila.id, categoria: fila.categoria, uv_esperada: fila.uv_esperada };

    const registro = await procesarRegistroCon(deps, { direccion: fila.direccion }, diccionarioSeed);
    evSistema.push(evaluarSistema(caso, registro));

    const geo = await geocodificarGenerico(fila.direccion);
    const territorioGen =
      geo.latitud !== null && geo.longitud !== null ? cruzarTerritorio(geo.longitud, geo.latitud, capaUV, capaMacrosectores) : null;
    const uvGenerico = territorioGen?.uv_id ?? null;
    evGenerico.push(evaluarGenerico(caso, uvGenerico));

    resultados.push({
      ...caso,
      direccion: fila.direccion,
      sistema: {
        uv_id: registro.confianza === "baja" ? null : registro.uv_id,
        confianza: registro.confianza,
        motivo: registro.motivo,
        tipo_precision: registro.tipo_precision,
        fuente: registro.fuente_interpretacion,
      },
      generico: { uv_id: uvGenerico, nombre_encontrado: geo.nombre_encontrado ?? null },
    });
    const okS = registro.confianza !== "baja" && registro.uv_id === fila.uv_esperada ? "✓" : registro.confianza === "baja" ? "→rev" : "✗";
    const okG = uvGenerico === fila.uv_esperada ? "✓" : uvGenerico === null ? "∅" : "✗";
    process.stdout.write(`${fila.id} [${fila.categoria}] sistema ${okS} (${registro.confianza}) · genérico ${okG}\n`);
  }

  const mSistema = calcularMetricas(evSistema);
  const mGenerico = calcularMetricas(evGenerico);
  const segundos = Math.round((Date.now() - inicio) / 1000);
  const duracion = Date.now() - inicio < 2000 ? "<1 s (con caché de Nominatim)" : `${segundos} s`;
  const fecha = new Date().toISOString().slice(0, 10);

  const fallos = resultados.filter((r) => r.sistema.uv_id !== r.uv_esperada);
  const lineas: string[] = [
    "# Informe de benchmark (E9)",
    "",
    `Fecha: ${fecha} · Casos: ${set.length} · Duración: ${duracion} · Interpretación: ${fuenteInterpretacion}`,
    "",
    "Capa de UV **real referencial** (MIDESOF/BIDAT 2026, 36 UV), pendiente de validar con el municipio: la UV esperada se calculó con point-in-polygon sobre esa capa (ver benchmark/README.md). Las cifras se informan tal como salieron.",
    "",
    "Métricas (sección 8.2): acierto = % asignados a la UV correcta sobre todos los casos; derivación = % enviados a revisión (genérico: sin resultado); error silencioso = % asignados a UV incorrecta con confianza alta o media (genérico: cualquier asignación incorrecta).",
    "",
    "| Categoría | n | Acierto sistema | Acierto genérico | Derivación sistema | Derivación genérico | Error silencioso sistema | Error silencioso genérico |",
    "|---|---|---|---|---|---|---|---|",
    filaMetricas("**Total**", mSistema.total, mGenerico.total),
    ...CATEGORIAS.map((c) => filaMetricas(c, mSistema.por_categoria[c], mGenerico.por_categoria[c])),
    "",
    "## Lectura",
    "",
    ...CATEGORIAS.filter((c) => mSistema.por_categoria[c].acierto <= mGenerico.por_categoria[c].acierto).map(
      (c) => `- En **${c}** el sistema no supera al genérico en acierto (${mSistema.por_categoria[c].acierto}% vs ${mGenerico.por_categoria[c].acierto}%).`,
    ),
    `- Error silencioso total: sistema ${mSistema.total.error_silencioso}% vs genérico ${mGenerico.total.error_silencioso}%.`,
    "",
    `## Fallos del sistema (${fallos.length})`,
    "",
    "| id | Categoría | Dirección | Esperada | Sistema | Confianza | Motivo | Genérico |",
    "|---|---|---|---|---|---|---|---|",
    ...fallos.map(
      (r) =>
        `| ${r.id} | ${r.categoria} | ${r.direccion} | ${nombreUV(r.uv_esperada)} | ${nombreUV(r.sistema.uv_id)} | ${r.sistema.confianza} | ${r.sistema.motivo} | ${nombreUV(r.generico.uv_id)} |`,
    ),
    "",
  ];
  fs.writeFileSync(RUTA_INFORME, lineas.join("\n"));
  fs.writeFileSync(
    RUTA_RESULTADOS,
    JSON.stringify({ fecha, duracion_s: segundos, interpretacion: fuenteInterpretacion, metricas: { sistema: mSistema, generico: mGenerico }, casos: resultados }, null, 1),
  );

  console.log(`\n${lineas.slice(8, 8 + 2 + 1 + CATEGORIAS.length).join("\n")}`);
  console.log(`\nDuración ${duracion} · informe: ${RUTA_INFORME}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
