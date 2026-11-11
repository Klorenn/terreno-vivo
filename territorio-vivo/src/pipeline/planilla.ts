// Lectura de planillas CSV / Excel y exportación de resultados a CSV.

import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { RegistroProcesado } from "@/domain/tipos";
import type { RegistroEntrada } from "./procesar";

type FilaCruda = Record<string, unknown>;

function normalizarEncabezado(clave: string): string {
  return clave
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
}

function aEntradas(filas: FilaCruda[]): RegistroEntrada[] {
  const entradas: RegistroEntrada[] = [];
  for (const fila of filas) {
    const normalizada: Record<string, string> = {};
    for (const [clave, valor] of Object.entries(fila)) {
      normalizada[normalizarEncabezado(clave)] = valor == null ? "" : String(valor);
    }
    const direccion = normalizada.direccion ?? normalizada.domicilio ?? "";
    if (!direccion.trim()) continue;
    entradas.push({
      direccion: direccion.trim(),
      tipo_prestacion: normalizada.tipo_prestacion ?? normalizada.prestacion ?? normalizada.tipo ?? "",
      fecha: normalizada.fecha ?? "",
    });
  }
  return entradas;
}

export async function leerPlanilla(archivo: File): Promise<RegistroEntrada[]> {
  const nombre = archivo.name.toLowerCase();
  if (nombre.endsWith(".xlsx") || nombre.endsWith(".xls")) {
    const buffer = await archivo.arrayBuffer();
    const libro = XLSX.read(buffer, { type: "array" });
    const hoja = libro.Sheets[libro.SheetNames[0]];
    const filas = XLSX.utils.sheet_to_json<FilaCruda>(hoja, { defval: "" });
    return aEntradas(filas);
  }
  const texto = await archivo.text();
  const resultado = Papa.parse<FilaCruda>(texto, { header: true, skipEmptyLines: true });
  return aEntradas(resultado.data);
}

export function resultadosACsv(registros: RegistroProcesado[]): string {
  const filas = registros.map((r) => ({
    direccion_original: r.direccion_original,
    calle: r.estructurada.calle,
    numero: r.estructurada.numero,
    poblacion_o_villa: r.estructurada.poblacion_o_villa,
    comunidad: r.estructurada.comunidad,
    camino_y_km: r.estructurada.camino_y_km,
    referencia: r.estructurada.referencia,
    es_rural: r.estructurada.es_rural ? "si" : "no",
    unidad_vecinal: r.uv_nombre ?? "",
    macrosector: r.macrosector ?? "",
    confianza: r.confianza,
    motivo: r.motivo,
    latitud: r.coordenadas?.latitud ?? "",
    longitud: r.coordenadas?.longitud ?? "",
    tipo_precision: r.tipo_precision,
    fuente_interpretacion: r.fuente_interpretacion,
    corregido_manualmente: r.corregido_manualmente ? "si" : "no",
    tipo_prestacion: r.tipo_prestacion,
    fecha: r.fecha,
  }));
  return Papa.unparse(filas);
}

export function descargarTexto(nombre: string, contenido: string, tipo = "text/csv;charset=utf-8"): void {
  const blob = new Blob(["﻿", contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}
