// Resultados del último lote, compartidos entre pantallas vía localStorage.

import { insertarRegistro } from "@/domain/registros";
import type { RegistroProcesado } from "@/domain/tipos";
import { crearAlmacen, useAlmacen } from "./almacen";

export const CLAVE_RESULTADOS = "tv:v2:resultados";

const VACIO: RegistroProcesado[] = [];
const almacen = crearAlmacen<RegistroProcesado[]>(CLAVE_RESULTADOS, VACIO);

export function leerResultados(): RegistroProcesado[] {
  return almacen.leer();
}

export function guardarResultados(registros: RegistroProcesado[]): void {
  almacen.escribir(registros);
}

/**
 * Agrega un registro individual (por ejemplo desde Inicio). Reemplaza el que tenga el mismo id
 * o un pendiente con la misma dirección, en vez de duplicarlo.
 */
export function agregarRegistro(registro: RegistroProcesado): RegistroProcesado[] {
  const registros = insertarRegistro(almacen.leer(), registro);
  almacen.escribir(registros);
  return registros;
}

export function actualizarRegistro(actualizado: RegistroProcesado): RegistroProcesado[] {
  const registros = almacen.leer().map((r) => (r.id === actualizado.id ? actualizado : r));
  almacen.escribir(registros);
  return registros;
}

export function useResultados(): RegistroProcesado[] {
  return useAlmacen(almacen, VACIO);
}
