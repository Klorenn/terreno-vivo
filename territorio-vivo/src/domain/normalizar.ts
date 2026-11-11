// Normalización de texto de direcciones chilenas.

/** Abreviaturas frecuentes en direcciones tal como las escribe la gente. */
const ABREVIATURAS: Record<string, string> = {
  av: "avenida",
  avda: "avenida",
  avd: "avenida",
  pje: "pasaje",
  psje: "pasaje",
  pob: "poblacion",
  pobl: "poblacion",
  sta: "santa",
  sto: "santo",
  dpto: "departamento",
  depto: "departamento",
  km: "kilometro",
  kms: "kilometro",
  "n°": "numero",
  "nº": "numero",
  "s/n": "sin numero",
  cno: "camino",
  cam: "camino",
  blk: "block",
  pdte: "presidente",
  gral: "general",
  fco: "francisco",
};

/** Quita tildes y diéresis. Conserva la ñ. */
export function quitarTildes(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, (marca, indice, cadena) => {
      // U+0303 es la virgulilla de la ñ: la conservamos.
      const anterior = cadena[indice - 1];
      return marca === "̃" && (anterior === "n" || anterior === "N") ? marca : "";
    })
    .normalize("NFC");
}

/**
 * minúsculas, sin tildes, abreviaturas expandidas, sin puntuación suelta,
 * espacios colapsados.
 */
export function normalizarTexto(texto: string): string {
  const minusculas = quitarTildes(texto).toLowerCase();
  const tokens = minusculas
    // separa comas y puntos finales pero conserva "s/n" y "n°"
    .replace(/[,;]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const limpio = token.replace(/\.+$/, "");
      return ABREVIATURAS[limpio] ?? limpio;
    });
  return tokens.join(" ").replace(/\s+/g, " ").trim();
}

/** true si la normalización expandió al menos una abreviatura. */
export function tieneAbreviaturas(texto: string): boolean {
  const minusculas = quitarTildes(texto).toLowerCase();
  return minusculas
    .replace(/[,;]/g, " ")
    .split(/\s+/)
    .some((token) => ABREVIATURAS[token.replace(/\.+$/, "")] !== undefined);
}
