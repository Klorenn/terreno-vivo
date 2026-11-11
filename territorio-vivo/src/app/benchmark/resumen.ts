// Cifras de cabecera del benchmark, para enlazarlas desde otras pantallas sin repetir números a mano.
import resultados from "../../../benchmark/resultados.json";

/** Porcentaje de acierto de Territorio Vivo en el benchmark. */
export const ACIERTO_SISTEMA: number = resultados.metricas.sistema.total.acierto;
/** Porcentaje de acierto del geocodificador genérico en el mismo set. */
export const ACIERTO_GENERICO: number = resultados.metricas.generico.total.acierto;
