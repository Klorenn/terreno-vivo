// Niveles de confianza: reglas exactas de la sección 6.4 del SOW.
// Principio: es preferible derivar a revisión que asignar mal.

import type { Confianza, DireccionEstructurada, ResultadoTerritorial, TipoPrecision } from "./tipos";

export interface CandidatoConfianza {
  id: string;
  unidad_vecinal: string | null;
}

export interface EntradaConfianza {
  estructurada: DireccionEstructurada;
  tipo_precision: TipoPrecision;
  /** Resultado del cruce punto-en-polígono. null = fuera de la comuna o sin coordenadas. */
  territorio: ResultadoTerritorial | null;
  /** aprendido: la coincidencia es una corrección previa de funcionario para esta misma dirección. */
  diccionario: { exacto: boolean; aprendido?: boolean; candidatos: CandidatoConfianza[] };
  /**
   * Precisión que entregó la geocodificación cuando el pipeline la descartó a favor del
   * diccionario (match exacto con UV única gana sobre una calle sin número).
   */
  geocodificacion_descartada?: "calle";
}

export interface ResultadoConfianza {
  confianza: Confianza;
  asignar: boolean;
  motivo: string;
}

const baja = (motivo: string): ResultadoConfianza => ({ confianza: "baja", asignar: false, motivo });
const media = (motivo: string): ResultadoConfianza => ({ confianza: "media", asignar: true, motivo });
const alta = (motivo: string): ResultadoConfianza => ({ confianza: "alta", asignar: true, motivo });

export function calcularConfianza(e: EntradaConfianza): ResultadoConfianza {
  const { estructurada, tipo_precision, territorio, diccionario } = e;
  const tieneCalle = estructurada.calle.length > 0;
  const tieneNumero = estructurada.numero.length > 0;
  const tieneCoordenadas = tipo_precision !== "ninguna";
  const lugarNombrado =
    estructurada.poblacion_o_villa.length > 0 || estructurada.comunidad.length > 0 || estructurada.camino_y_km.length > 0;

  // Sin coordenadas: nada que asignar.
  if (!tieneCoordenadas) {
    if (diccionario.candidatos.length > 0 && !diccionario.exacto) {
      return baja("Solo coincidencia parcial en el diccionario; requiere confirmación");
    }
    if (tieneCalle) return baja("No se encontró la calle en el mapa; requiere revisión");
    if (lugarNombrado) return baja("El lugar nombrado no está en el diccionario; requiere revisión");
    return baja("No se pudo ubicar: solo referencias vagas o datos insuficientes");
  }

  // Con coordenadas pero fuera de toda UV.
  if (!territorio) {
    return baja("El punto queda fuera de la comuna o de las unidades vecinales conocidas");
  }

  // UV de los lugares nombrados que coincidieron exacto (no cuentan las correcciones por texto o calle).
  const uvsLugar =
    diccionario.exacto && !diccionario.aprendido
      ? diccionario.candidatos.map((c) => c.unidad_vecinal).filter((uv): uv is string => uv !== null)
      : [];

  // Contradicción: la calle (con o sin número resuelto) cae en una UV distinta a la del lugar nombrado.
  if ((tipo_precision === "numero" || tipo_precision === "calle") && uvsLugar.length > 0 && !uvsLugar.includes(territorio.uv_id)) {
    return baja(
      `Resultado contradictorio: la calle cae en ${territorio.uv_nombre} pero el lugar nombrado pertenece a otra UV`,
    );
  }

  if (tipo_precision === "numero" && tieneCalle && tieneNumero) {
    return alta("Calle y número geocodificados dentro de la comuna");
  }

  if (tipo_precision === "calle" || (tieneCalle && !tieneNumero && tipo_precision !== "diccionario")) {
    // Calle sin número + lugar nombrado que el diccionario no conoce: la calle puede estar en otro barrio.
    if (lugarNombrado && !diccionario.exacto) {
      return baja("Calle sin número y lugar nombrado desconocido: posible ubicación errónea");
    }
    // Población, villa o comunidad del diccionario que confirma la misma UV: señal suficiente.
    const lugarPoblado = estructurada.poblacion_o_villa.length > 0 || estructurada.comunidad.length > 0;
    if (lugarPoblado && uvsLugar.includes(territorio.uv_id)) {
      return media("Calle sin número resuelto; el lugar nombrado confirma la unidad vecinal");
    }
    // Pasajes ("pasaje 3", "pasaje las rosas") se repiten en muchas villas: el mapa devuelve
    // cualquiera de ellos. Sin un lugar que lo confirme, a revisión.
    if (/^(?:pasaje|callejon)\b/.test(estructurada.calle)) {
      if (tieneNumero) {
        return baja("Pasaje con número no encontrado en el mapa y sin lugar que lo confirme; requiere revisión");
      }
      return baja(
        "Pasaje sin número resuelto ni lugar que lo confirme: hay pasajes con el mismo nombre en varias unidades vecinales; requiere revisión",
      );
    }
    // Se pidió calle y número, pero el mapa solo resolvió la calle.
    if (tieneNumero) {
      return media("Número no encontrado en el mapa; ubicación a nivel de calle");
    }
    return media("Solo calle sin número: ubicación aproximada");
  }

  if (tipo_precision === "diccionario") {
    if (!diccionario.exacto) {
      return baja("Coincidencia parcial en el diccionario; requiere confirmación");
    }
    const uvs = new Set(diccionario.candidatos.map((c) => c.unidad_vecinal));
    if (diccionario.aprendido && uvs.size === 1 && !uvs.has(null)) {
      return alta("Dirección corregida antes por un funcionario");
    }
    if (uvs.has(null)) {
      return baja("El lugar abarca más de una unidad vecinal; requiere revisión");
    }
    if (uvs.size > 1) {
      return baja("Varias entradas del diccionario coinciden con unidades vecinales distintas");
    }
    if (e.geocodificacion_descartada === "calle") {
      return alta("Coincidencia exacta en el diccionario con UV única; se priorizó el lugar nombrado sobre la calle sin número");
    }
    return alta("Coincidencia exacta en el diccionario con unidad vecinal única");
  }

  return baja("No se pudo determinar la confianza; se deriva a revisión");
}
