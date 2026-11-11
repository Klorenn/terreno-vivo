// GET /api/geocodificar?q=... → { latitud, longitud, tipo_precision } (acotado a la comuna).

import { crearGeocodificador } from "@/servicios/geocodificacion";

const geocodificar = crearGeocodificador({ acotar: true });

export async function GET(req: Request): Promise<Response> {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return Response.json({ error: "Falta el parámetro q" }, { status: 400 });
  return Response.json(await geocodificar(q));
}
