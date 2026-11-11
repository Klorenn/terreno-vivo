// Helpers de UI sobre el store del diccionario (descarga). Reexporta el store.

import { descargarTexto } from "@/pipeline/planilla";
import { exportarDiccionario } from "./diccionario";

export { agregarAlias, borrarCorrecciones, obtenerCorrecciones, obtenerDiccionario, useCorrecciones } from "./diccionario";

export function descargarDiccionario(): void {
  descargarTexto("territorio-vivo-diccionario.json", exportarDiccionario(), "application/json");
}
