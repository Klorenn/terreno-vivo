// Interpretación de direcciones: modelo de lenguaje si hay ANTHROPIC_API_KEY, si no parser heurístico.
// Reutilizable desde la route /api/interpretar y desde scripts Node (benchmark).

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { interpretarHeuristico } from "@/domain/heuristico";
import type { DireccionEstructurada, FuenteInterpretacion } from "@/domain/tipos";

export interface ResultadoInterpretacion {
  estructurada: DireccionEstructurada;
  fuente: FuenteInterpretacion;
}

export type Interpretar = (texto: string) => Promise<ResultadoInterpretacion>;

const EsquemaDireccion = z.object({
  calle: z.string(),
  numero: z.string(),
  poblacion_o_villa: z.string(),
  comunidad: z.string(),
  camino_y_km: z.string(),
  referencia: z.string(),
  es_rural: z.boolean(),
  observaciones: z.string(),
});

const SYSTEM = `Eres un asistente que estructura direcciones escritas a mano por vecinos de la comuna de Temuco, Chile.
Devuelves SIEMPRE el mismo formato con estos campos: calle, numero, poblacion_o_villa, comunidad, camino_y_km, referencia, es_rural, observaciones.

Reglas estrictas:
- No inventes datos que no estén en el texto. Si un campo no se puede determinar, déjalo como cadena vacía.
- Expande abreviaturas chilenas: av/avda → Avenida, pje → Pasaje, pob → Población, sta → Santa, dpto → Departamento, km → kilómetro, s/n → sin número.
- Corrige errores de tipeo evidentes en nombres de calles conocidas de Temuco (por ejemplo "alemnia" → "Alemania"), y anótalo en observaciones.
- calle: nombre de la vía con su tipo (Avenida, Calle, Pasaje). numero: solo el número de la vivienda o edificio, sin "casa", "N°" ni departamento.
- poblacion_o_villa: nombre de la población, villa o sector urbano, sin la palabra "población" o "villa".
- comunidad: nombre de la comunidad rural, si se menciona.
- camino_y_km: el camino rural y el kilómetro, por ejemplo "Camino a Cajón kilómetro 5".
- referencia: hitos o indicaciones relativas ("frente a la escuela", "al lado del consultorio").
- es_rural: true si hay camino con kilómetro, comunidad, parcela, fundo o sector rural.
- observaciones: qué corregiste o expandiste, o qué quedó ambiguo. Breve.`;

export function hayModeloDisponible(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function interpretarConModelo(texto: string): Promise<DireccionEstructurada> {
  const client = new Anthropic();
  const respuesta = await client.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 2048,
    system: SYSTEM,
    messages: [{ role: "user", content: `Dirección: ${texto}` }],
    output_config: { effort: "low", format: zodOutputFormat(EsquemaDireccion) },
  });
  if (respuesta.stop_reason === "refusal" || !respuesta.parsed_output) {
    throw new Error("El modelo no devolvió una dirección estructurada");
  }
  return { texto_original: texto, ...respuesta.parsed_output };
}

/** Modelo si hay clave; ante falta de clave o error, heurístico. */
export const interpretarDireccion: Interpretar = async (texto) => {
  if (hayModeloDisponible()) {
    try {
      return { estructurada: await interpretarConModelo(texto), fuente: "llm" };
    } catch (error) {
      console.error("[interpretar] fallo del modelo, usando heurístico:", error);
    }
  }
  return { estructurada: interpretarHeuristico(texto), fuente: "heuristico" };
};
