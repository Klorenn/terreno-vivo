// Operaciones puras sobre la lista de registros procesados (el store las persiste).

import { normalizarTexto } from "./normalizar";
import type { RegistroProcesado } from "./tipos";

const pendiente = (r: RegistroProcesado) => r.confianza === "baja" && !r.corregido_manualmente;

/**
 * Agrega un registro al inicio. Si ya existe por id, lo reemplaza en su lugar. Si hay un
 * pendiente (baja, sin corrección manual) con la misma dirección normalizada, lo reemplaza
 * en vez de duplicarlo.
 */
export function insertarRegistro(actuales: RegistroProcesado[], registro: RegistroProcesado): RegistroProcesado[] {
  if (actuales.some((r) => r.id === registro.id)) {
    return actuales.map((r) => (r.id === registro.id ? registro : r));
  }
  const direccion = normalizarTexto(registro.direccion_original);
  const restantes = actuales.filter((r) => !(pendiente(r) && normalizarTexto(r.direccion_original) === direccion));
  return [registro, ...restantes];
}
