// Geocodificación con Nominatim (OpenStreetMap). Límite público: 1 consulta por segundo.
// Cola secuencial compartida + cache inyectable (memoria en la route, archivo en el benchmark).

import { CAJA_COMUNA } from "@/data";
import type { TipoPrecision } from "@/domain/tipos";

export interface ResultadoGeo {
  latitud: number | null;
  longitud: number | null;
  tipo_precision: TipoPrecision;
  nombre_encontrado?: string;
  /** Campos crudos de Nominatim, para auditar la clasificación de precisión. */
  crudo?: { category?: string; type?: string; addresstype?: string; house_number?: string; road?: string };
}

export type Geocodificar = (consulta: string) => Promise<ResultadoGeo>;

export interface CacheGeo {
  obtener: (clave: string) => ResultadoGeo | undefined;
  guardar: (clave: string, valor: ResultadoGeo) => void;
}

export interface OpcionesGeocodificador {
  cache?: CacheGeo;
  /** true: acota a la caja de la comuna y agrega ", Temuco". false: consulta genérica tal cual. */
  acotar?: boolean;
  /** Texto que se agrega al final de la consulta. Por defecto ", Temuco" si acota. */
  sufijo?: string;
}

export interface ResultadoNominatim {
  lat: string;
  lon: string;
  addresstype?: string;
  type?: string;
  /** jsonv2 entrega `category`; el formato json clásico entrega `class`. */
  category?: string;
  class?: string;
  display_name?: string;
  address?: { house_number?: string; road?: string };
}

const ZONAS_GRANDES = new Set(["city", "town", "village", "suburb", "neighbourhood", "quarter", "administrative", "county", "state", "country"]);
const CATEGORIAS_SOBRE_VIA = new Set(["amenity", "shop", "tourism", "office", "building", "leisure", "healthcare"]);

export const SIN_RESULTADO: ResultadoGeo = { latitud: null, longitud: null, tipo_precision: "ninguna" };

let ultimaConsulta = 0;
let cola: Promise<unknown> = Promise.resolve();

function dormir(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Encola para respetar 1 req/s entre llamadas a Nominatim (cola global del proceso). */
export function conThrottle<T>(fn: () => Promise<T>): Promise<T> {
  const tarea = cola.then(async () => {
    const espera = 1100 - (Date.now() - ultimaConsulta);
    if (espera > 0) await dormir(espera);
    ultimaConsulta = Date.now();
    return fn();
  });
  cola = tarea.catch(() => undefined);
  return tarea;
}

export function precisionDe(r: ResultadoNominatim): TipoPrecision {
  const categoria = r.category ?? r.class ?? "";
  const tipo = r.type ?? "";
  const addresstype = r.addresstype ?? "";
  if (ZONAS_GRANDES.has(addresstype) || ZONAS_GRANDES.has(tipo)) return "ninguna";
  // Número de casa: addresstype house/building, address.house_number, o place/house (jsonv2 pone addresstype "place").
  if (r.address?.house_number || addresstype === "house" || addresstype === "building" || categoria === "building") return "numero";
  if (categoria === "place" && (tipo === "house" || tipo === "houses")) return "numero";
  // Vía.
  if (categoria === "highway" || addresstype === "road" || addresstype === "street" || tipo === "road" || tipo === "street") return "calle";
  // Lugar (amenity, shop…) anclado a una vía: ubicación válida a nivel de calle.
  if (CATEGORIAS_SOBRE_VIA.has(categoria) && r.address?.road) return "calle";
  return "ninguna";
}

async function consultarNominatim(q: string, acotar: boolean, sufijo: string): Promise<ResultadoGeo> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("countrycodes", "cl");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");
  if (acotar) {
    const [oeste, sur, este, norte] = CAJA_COMUNA;
    url.searchParams.set("viewbox", `${oeste},${norte},${este},${sur}`);
    url.searchParams.set("bounded", "1");
  }
  url.searchParams.set("q", `${q}${sufijo}`);

  const res = await fetch(url, {
    headers: { "User-Agent": "territorio-vivo-prototipo", "Accept-Language": "es" },
  });
  if (!res.ok) throw new Error(`Nominatim respondió ${res.status}`);
  const datos = (await res.json()) as ResultadoNominatim[];
  if (datos.length === 0) return SIN_RESULTADO;
  const mejor = datos[0];
  return {
    latitud: Number(mejor.lat),
    longitud: Number(mejor.lon),
    tipo_precision: precisionDe(mejor),
    nombre_encontrado: mejor.display_name,
    crudo: {
      category: mejor.category ?? mejor.class,
      type: mejor.type,
      addresstype: mejor.addresstype,
      house_number: mejor.address?.house_number,
      road: mejor.address?.road,
    },
  };
}

export function cacheEnMemoria(): CacheGeo {
  const mapa = new Map<string, ResultadoGeo>();
  return { obtener: (k) => mapa.get(k), guardar: (k, v) => void mapa.set(k, v) };
}

/** Crea un geocodificador con cache y modo (acotado a la comuna o genérico). */
export function crearGeocodificador(opciones: OpcionesGeocodificador = {}): Geocodificar {
  const cache = opciones.cache ?? cacheEnMemoria();
  const acotar = opciones.acotar ?? true;
  const sufijo = opciones.sufijo ?? (acotar ? ", Temuco" : "");
  return async (consulta) => {
    const q = consulta.trim();
    if (!q) return SIN_RESULTADO;
    const clave = `${acotar ? "acotado" : "generico"}|${q.toLowerCase()}${sufijo.toLowerCase()}`;
    const enCache = cache.obtener(clave);
    if (enCache) return enCache;
    try {
      const resultado = await conThrottle(() => consultarNominatim(q, acotar, sufijo));
      cache.guardar(clave, resultado);
      return resultado;
    } catch (error) {
      console.error("[geocodificar] error:", error);
      return SIN_RESULTADO;
    }
  };
}
