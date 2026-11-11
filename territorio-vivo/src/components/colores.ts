// Tokens de color compartidos entre la UI y las capas del mapa (ver docs/diseno.md).
import type { Confianza } from "@/domain/tipos";

export const COLOR_CONFIANZA: Record<Confianza, string> = {
  alta: "#1F8A4C",
  media: "#C8780A",
  baja: "#C2362B",
};

export const COLOR_ARAUCARIA = "#1F6F4A";
export const COLOR_TINTA = "#14211B";
export const COLOR_TINTA_SUAVE = "#5B6B62";
export const COLOR_SIN_DATO = "#E6ECE7";
/** Azul del río Cautín (--tv-cautin): tinte territorial neutro. */
export const COLOR_CAUTIN = "#2460A8";

/** Escala secuencial del mapa territorial (cantidad de prestaciones), claro → intenso. */
export const ESCALA_TERRITORIAL = ["#DCE9F7", "#A9C6EA", "#6E9AD3", "#3B6FB6", "#1F4A88"];

/** Escala del mapa de brechas: menor cobertura = más intenso. */
export const ESCALA_BRECHA = ["#FBE3D3", "#F5B98F", "#EC8A52", "#D85A2B", "#A3321A"];
