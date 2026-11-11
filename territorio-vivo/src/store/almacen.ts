// Almacén genérico sobre localStorage con instantánea estable para useSyncExternalStore.
// Evita setState dentro de efectos y mantiene SSR sin acceso a window.

import { useSyncExternalStore } from "react";

export interface Almacen<T> {
  leer: () => T;
  escribir: (valor: T) => void;
  suscribir: (cb: () => void) => () => void;
}

export function crearAlmacen<T>(clave: string, inicial: T): Almacen<T> {
  let cache: T | undefined;
  const oyentes = new Set<() => void>();

  function leer(): T {
    if (cache !== undefined) return cache;
    if (typeof window === "undefined") return inicial;
    try {
      const crudo = window.localStorage.getItem(clave);
      cache = crudo ? (JSON.parse(crudo) as T) : inicial;
    } catch {
      cache = inicial;
    }
    return cache;
  }

  function escribir(valor: T): void {
    cache = valor;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(clave, JSON.stringify(valor));
      } catch {
        // sin almacenamiento disponible: el valor vive solo en memoria
      }
    }
    oyentes.forEach((cb) => cb());
  }

  function suscribir(cb: () => void): () => void {
    oyentes.add(cb);
    return () => oyentes.delete(cb);
  }

  return { leer, escribir, suscribir };
}

/** Hook: valor actual del almacén; en servidor devuelve `inicial`. */
export function useAlmacen<T>(almacen: Almacen<T>, inicial: T): T {
  return useSyncExternalStore(almacen.suscribir, almacen.leer, () => inicial);
}
