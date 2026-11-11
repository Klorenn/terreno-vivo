// Tipos del dominio. Sin React, sin fetch.

/** Dirección estructurada: campos exactos de la sección 6.2 del SOW. */
export interface DireccionEstructurada {
  texto_original: string;
  calle: string;
  numero: string;
  poblacion_o_villa: string;
  comunidad: string;
  camino_y_km: string;
  referencia: string;
  es_rural: boolean;
  observaciones: string;
}

export type TipoEntrada =
  | "poblacion"
  | "villa"
  | "comunidad"
  | "hito"
  | "camino"
  | "sector";

export type FuenteEntrada = "equipo" | "funcionario" | "municipio";

/** Entrada del diccionario territorial: sección 6.3 del SOW. */
export interface EntradaDiccionario {
  id: string;
  nombre_oficial: string;
  alias: string[];
  tipo: TipoEntrada;
  latitud: number;
  longitud: number;
  /** Id de UV si el lugar cae completo dentro de una. null si abarca más de una. */
  unidad_vecinal: string | null;
  fuente: FuenteEntrada;
  fecha_actualizacion: string;
}

export type Confianza = "alta" | "media" | "baja";

export type TipoPrecision = "numero" | "calle" | "diccionario" | "ninguna";

export type FuenteInterpretacion = "llm" | "heuristico";

export interface Coordenadas {
  latitud: number;
  longitud: number;
}

export interface ResultadoTerritorial {
  uv_id: string;
  uv_nombre: string;
  macrosector: string;
}

export interface RegistroProcesado {
  id: string;
  direccion_original: string;
  estructurada: DireccionEstructurada;
  coordenadas: Coordenadas | null;
  tipo_precision: TipoPrecision;
  uv_id: string | null;
  uv_nombre: string | null;
  macrosector: string | null;
  confianza: Confianza;
  motivo: string;
  fuente_interpretacion: FuenteInterpretacion;
  tipo_prestacion: string;
  fecha: string;
  /** true cuando un funcionario asignó la UV a mano en la bandeja de revisión. */
  corregido_manualmente?: boolean;
}

/** Propiedades esperadas en cada feature de uv.geojson. */
export interface PropiedadesUV {
  id: string;
  nombre: string;
  macrosector: string;
  poblacion: number;
}

export interface PropiedadesMacrosector {
  id: string;
  nombre: string;
}
