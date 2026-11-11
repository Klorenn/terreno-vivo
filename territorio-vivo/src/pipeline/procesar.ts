// Orquesta los pasos 1 a 6 de la sección 6.1 para un registro o un lote.
// El núcleo (`procesarRegistroCon`) es puro con dependencias inyectadas: el navegador inyecta
// fetch a /api, el benchmark en Node inyecta los servicios directamente.

import { capaMacrosectores, capaUV } from "@/data";
import { calcularConfianza } from "@/domain/confianza";
import { buscarEnDiccionario } from "@/domain/diccionario";
import { cruzarTerritorio } from "@/domain/territorio";
import type { Coordenadas, EntradaDiccionario, RegistroProcesado, TipoPrecision } from "@/domain/tipos";
import type { Geocodificar, ResultadoGeo } from "@/servicios/geocodificacion";
import type { Interpretar, ResultadoInterpretacion } from "@/servicios/interpretacion";

export interface RegistroEntrada {
  direccion: string;
  tipo_prestacion?: string;
  fecha?: string;
}

export interface Dependencias {
  interpretar: Interpretar;
  geocodificar: Geocodificar;
}

let contador = 0;
function nuevoId(): string {
  contador += 1;
  return `reg-${Date.now().toString(36)}-${contador}`;
}

export async function procesarRegistroCon(
  deps: Dependencias,
  entrada: RegistroEntrada,
  diccionario: EntradaDiccionario[],
): Promise<RegistroProcesado> {
  // Paso 2: interpretación
  const { estructurada, fuente } = await deps.interpretar(entrada.direccion);

  // Paso 3: diccionario
  const busqueda = buscarEnDiccionario(estructurada, diccionario);

  // Paso 4: geolocalización
  let coordenadas: Coordenadas | null = null;
  let tipo_precision: TipoPrecision = "ninguna";
  let geocodificacion_descartada: "calle" | undefined;

  // Match exacto en diccionario con UV única: señal fuerte que gana sobre una calle sin número.
  const uvsExactas = new Set(busqueda.candidatos.map((c) => c.unidad_vecinal));
  const diccionarioFuerte = busqueda.exacto && uvsExactas.size === 1 && !uvsExactas.has(null);

  // Una corrección de funcionario para esta misma dirección es la señal más fuerte: no se geocodifica.
  if (estructurada.calle.length > 0 && !busqueda.aprendido) {
    const consulta = [estructurada.calle, estructurada.numero].filter(Boolean).join(" ");
    const geo = await deps.geocodificar(consulta);
    if (geo.latitud !== null && geo.longitud !== null && geo.tipo_precision !== "ninguna") {
      coordenadas = { latitud: geo.latitud, longitud: geo.longitud };
      // Si pedimos número pero Nominatim solo resolvió la calle, la precisión es "calle".
      tipo_precision = estructurada.numero && geo.tipo_precision === "numero" ? "numero" : "calle";
      if (tipo_precision === "calle" && diccionarioFuerte) {
        coordenadas = null;
        tipo_precision = "ninguna";
        geocodificacion_descartada = "calle";
      }
    }
  }
  if (!coordenadas && busqueda.candidatos.length > 0) {
    const elegido = busqueda.candidatos[0];
    coordenadas = { latitud: elegido.latitud, longitud: elegido.longitud };
    tipo_precision = "diccionario";
  }

  // Paso 5: cruce territorial
  const territorio = coordenadas
    ? cruzarTerritorio(coordenadas.longitud, coordenadas.latitud, capaUV, capaMacrosectores)
    : null;

  // Paso 6: confianza
  const confianza = calcularConfianza({
    estructurada,
    tipo_precision,
    territorio,
    diccionario: {
      exacto: busqueda.exacto,
      aprendido: busqueda.aprendido,
      candidatos: busqueda.candidatos.map((c) => ({ id: c.id, unidad_vecinal: c.unidad_vecinal })),
    },
    geocodificacion_descartada,
  });

  const asignado = confianza.asignar && territorio;
  return {
    id: nuevoId(),
    direccion_original: entrada.direccion,
    estructurada,
    coordenadas,
    tipo_precision,
    uv_id: asignado ? territorio.uv_id : null,
    uv_nombre: asignado ? territorio.uv_nombre : null,
    macrosector: asignado ? territorio.macrosector : null,
    confianza: confianza.confianza,
    motivo: confianza.motivo,
    fuente_interpretacion: fuente,
    tipo_prestacion: entrada.tipo_prestacion?.trim() || "Sin tipo",
    fecha: entrada.fecha?.trim() || "",
  };
}

export async function procesarLoteCon(
  deps: Dependencias,
  entradas: RegistroEntrada[],
  diccionario: EntradaDiccionario[],
  onProgreso?: (hechos: number, total: number, ultimo: RegistroProcesado) => void,
): Promise<RegistroProcesado[]> {
  const resultados: RegistroProcesado[] = [];
  for (const entrada of entradas) {
    const registro = await procesarRegistroCon(deps, entrada, diccionario);
    resultados.push(registro);
    onProgreso?.(resultados.length, entradas.length, registro);
  }
  return resultados;
}

// ---- Dependencias del navegador: llaman a las routes de /api ----

const depsNavegador: Dependencias = {
  async interpretar(texto) {
    const res = await fetch("/api/interpretar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto }),
    });
    if (!res.ok) throw new Error(`interpretar: ${res.status}`);
    return (await res.json()) as ResultadoInterpretacion;
  },
  async geocodificar(consulta) {
    const res = await fetch(`/api/geocodificar?q=${encodeURIComponent(consulta)}`);
    if (!res.ok) return { latitud: null, longitud: null, tipo_precision: "ninguna" };
    return (await res.json()) as ResultadoGeo;
  },
};

export function procesarRegistro(entrada: RegistroEntrada, diccionario: EntradaDiccionario[]): Promise<RegistroProcesado> {
  return procesarRegistroCon(depsNavegador, entrada, diccionario);
}

export function procesarLote(
  entradas: RegistroEntrada[],
  diccionario: EntradaDiccionario[],
  onProgreso?: (hechos: number, total: number, ultimo: RegistroProcesado) => void,
): Promise<RegistroProcesado[]> {
  return procesarLoteCon(depsNavegador, entradas, diccionario, onProgreso);
}
