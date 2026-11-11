// Formato de textos de presentación (no altera los datos guardados).

/** "UV 4 5 Sur" → "UV 4-5 Sur": las capas reales traen UV compuestas con un espacio entre números. */
export function formatearNombreUV(nombre: string): string {
  return nombre.replace(/^UV (\d+) (\d+)\b/, "UV $1-$2");
}
