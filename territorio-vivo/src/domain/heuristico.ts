// Parser heurístico (sin LLM). Se usa como respaldo cuando no hay API key
// o cuando el modelo falla. Opera sobre texto normalizado.

import { corregirCalle, quitarVia } from "./calles";
import { normalizarTexto, tieneAbreviaturas } from "./normalizar";
import type { DireccionEstructurada } from "./tipos";

const VIAS = "(?:avenida|calle|pasaje|camino|ruta|callejon|diagonal)";
const CONECTORES_REFERENCIA =
  "(?:frente a|al lado de|al lado del|detras de|detras del|cerca de|cerca del|a un costado de|junto a|junto al|entre)";

function limpiar(valor: string): string {
  return valor.replace(/\s+/g, " ").trim();
}

export function interpretarHeuristico(texto: string): DireccionEstructurada {
  const observaciones: string[] = [];
  if (tieneAbreviaturas(texto)) observaciones.push("abreviaturas expandidas");

  let resto = normalizarTexto(texto)
    // quita "temuco" y "comuna de temuco" al final
    .replace(/\b(comuna de )?temuco\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const resultado: DireccionEstructurada = {
    texto_original: texto,
    calle: "",
    numero: "",
    poblacion_o_villa: "",
    comunidad: "",
    camino_y_km: "",
    referencia: "",
    es_rural: false,
    observaciones: "",
  };

  // 1. Referencia: desde un conector hasta el final o la próxima coma.
  const refMatch = resto.match(new RegExp(`\\b(${CONECTORES_REFERENCIA}\\b.*)$`));
  if (refMatch) {
    resultado.referencia = limpiar(refMatch[1]);
    resto = limpiar(resto.slice(0, refMatch.index));
  }

  // 2. Camino rural con kilómetro.
  const caminoMatch = resto.match(
    /\b(camino (?:a |al |la |las |los )?[a-zñ ]+?)\s+kilometro\s+(\d+(?:[.,]\d+)?)\b/,
  );
  if (caminoMatch) {
    resultado.camino_y_km = `${limpiar(caminoMatch[1])} kilometro ${caminoMatch[2]}`;
    resultado.es_rural = true;
    resto = limpiar(resto.replace(caminoMatch[0], " "));
  }

  // 3. Comunidad.
  const comunidadMatch = resto.match(/\bcomunidad\s+([a-zñ ]+?)(?=\s+(?:sector|camino|kilometro|lote|parcela)\b|$)/);
  if (comunidadMatch) {
    resultado.comunidad = limpiar(comunidadMatch[1]);
    resultado.es_rural = true;
    resto = limpiar(resto.replace(comunidadMatch[0], " "));
  }

  // 4. Población o villa. Lo que sigue a la palabra clave hasta una vía, "casa", "block", "departamento" o el final.
  const pobMatch = resto.match(
    new RegExp(
      `\\b(?:poblacion|villa|sector|conjunto|condominio)\\s+([a-zñ0-9 ]+?)(?=\\s+(?:${VIAS}|casa|block|departamento|numero|lote|sitio)\\b|$)`,
    ),
  );
  if (pobMatch) {
    resultado.poblacion_o_villa = limpiar(pobMatch[1]);
    if (/\bsector\b/.test(pobMatch[0]) && !resultado.poblacion_o_villa) {
      resultado.poblacion_o_villa = "";
    }
    resto = limpiar(resto.replace(pobMatch[0], " "));
  }

  // 5. Número de casa / vivienda.
  const numeroExplicito = resto.match(/\b(?:casa|numero|sitio|lote)\s+(\d+[a-z]?)\b/);
  if (numeroExplicito) {
    resultado.numero = numeroExplicito[1];
    resto = limpiar(resto.replace(numeroExplicito[0], " "));
  }

  // Elimina sufijos tipo "departamento 3", "block 4" que no son el número de la calle.
  resto = limpiar(resto.replace(/\b(?:departamento|block|piso|oficina)\s+\w+\b/g, " "));
  resto = limpiar(resto.replace(/\bsin numero\b/g, " "));

  // 6. Calle: "<via> <nombre> [<numero>]" o "<nombre> <numero>".
  const calleConVia = resto.match(
    new RegExp(`\\b(${VIAS}\\s+[a-zñ0-9 ]+?)(?:\\s+(\\d{1,5}[a-z]?))?$`),
  );
  if (calleConVia) {
    resultado.calle = limpiar(calleConVia[1]);
    if (!resultado.numero && calleConVia[2]) resultado.numero = calleConVia[2];
    resto = limpiar(resto.replace(calleConVia[0], " "));
  } else {
    const nombreYNumero = resto.match(/^([a-zñ][a-zñ ]+?)\s+(\d{1,5}[a-z]?)$/);
    if (nombreYNumero) {
      resultado.calle = limpiar(nombreYNumero[1]);
      if (!resultado.numero) resultado.numero = nombreYNumero[2];
      resto = "";
    }
  }

  // Si la "calle" es un pasaje numerado dentro de una villa ("pasaje 3"), no hay vía separada.
  if (!resultado.calle && resultado.poblacion_o_villa && /^[a-zñ ]+$/.test(resto) && resto) {
    // texto sobrante sin número: probablemente una calle sin número
    resultado.calle = resto;
    resto = "";
  }

  if (resultado.calle) {
    const { calle, corregida } = corregirCalle(resultado.calle);
    if (corregida) {
      observaciones.push(`Calle corregida: ${quitarVia(resultado.calle)} → ${quitarVia(calle)}`);
      resultado.calle = calle;
    }
  }

  if (resultado.camino_y_km || resultado.comunidad || /\b(rural|parcela|fundo|sector)\b/.test(normalizarTexto(texto))) {
    resultado.es_rural = true;
  }

  if (resto) observaciones.push(`texto no interpretado: "${resto}"`);
  resultado.observaciones = observaciones.join("; ");
  return resultado;
}
