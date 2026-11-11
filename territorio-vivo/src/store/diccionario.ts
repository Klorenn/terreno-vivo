// Diccionario territorial vivo: seed del equipo + correcciones de funcionarios en localStorage.
// Criterio de aceptación 4: una corrección guardada cambia el resultado la próxima vez
// que aparece la misma expresión.

import { capaUV, diccionarioSeed } from "@/data";
import { correccionesValidas } from "@/domain/diccionario";
import type { EntradaDiccionario } from "@/domain/tipos";
import { crearAlmacen, useAlmacen, type Almacen } from "./almacen";

export const CLAVE_CORRECCIONES = "tv:v2:diccionario:correcciones";

const VACIO: EntradaDiccionario[] = [];
const UV_VALIDAS: ReadonlySet<string> = new Set(capaUV.features.map((f) => f.properties.id));
const crudo = crearAlmacen<EntradaDiccionario[]>(CLAVE_CORRECCIONES, VACIO);

// Al leer, descarta correcciones con UV que no existe en la capa actual. Memoiza por referencia
// para que useSyncExternalStore reciba una instantánea estable.
let ultimoCrudo: EntradaDiccionario[] | undefined;
let ultimoFiltrado: EntradaDiccionario[] = VACIO;
const almacen: Almacen<EntradaDiccionario[]> = {
  ...crudo,
  leer() {
    const actual = crudo.leer();
    if (actual !== ultimoCrudo) {
      ultimoCrudo = actual;
      ultimoFiltrado = correccionesValidas(actual, UV_VALIDAS);
    }
    return ultimoFiltrado;
  },
};

/** Seed + correcciones. Las correcciones van primero para que ganen en la búsqueda. */
export function obtenerDiccionario(): EntradaDiccionario[] {
  return [...almacen.leer(), ...diccionarioSeed];
}

export function obtenerCorrecciones(): EntradaDiccionario[] {
  return almacen.leer();
}

export function useCorrecciones(): EntradaDiccionario[] {
  return useAlmacen(almacen, VACIO);
}

export interface NuevoAlias {
  expresion: string;
  uv_id: string;
  uv_nombre: string;
  latitud: number;
  longitud: number;
  tipo?: EntradaDiccionario["tipo"];
}

/**
 * Registra una expresión como alias. Si ya existe una corrección para esa UV,
 * agrega el alias; si no, crea una entrada nueva con fuente "funcionario".
 */
export function agregarAlias(nuevo: NuevoAlias): EntradaDiccionario {
  const correcciones = almacen.leer().map((e) => ({ ...e, alias: [...e.alias] }));
  const expresion = nuevo.expresion.trim();
  const hoy = new Date().toISOString().slice(0, 10);

  const existente = correcciones.find(
    (e) => e.unidad_vecinal === nuevo.uv_id && e.nombre_oficial === `Alias de ${nuevo.uv_nombre}`,
  );
  if (existente) {
    if (!existente.alias.includes(expresion)) existente.alias.push(expresion);
    existente.fecha_actualizacion = hoy;
    almacen.escribir(correcciones);
    return existente;
  }

  const entrada: EntradaDiccionario = {
    id: `corr-${Date.now().toString(36)}`,
    nombre_oficial: `Alias de ${nuevo.uv_nombre}`,
    alias: [expresion],
    tipo: nuevo.tipo ?? "sector",
    latitud: nuevo.latitud,
    longitud: nuevo.longitud,
    unidad_vecinal: nuevo.uv_id,
    fuente: "funcionario",
    fecha_actualizacion: hoy,
  };
  almacen.escribir([entrada, ...correcciones]);
  return entrada;
}

export function borrarCorrecciones(): void {
  almacen.escribir(VACIO);
}

/** JSON del diccionario completo para descargar. */
export function exportarDiccionario(): string {
  return JSON.stringify(obtenerDiccionario(), null, 2);
}
