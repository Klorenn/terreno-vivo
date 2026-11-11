// POST /api/interpretar { texto } → dirección estructurada (modelo si hay clave, si no heurístico).
// La clave nunca llega al cliente: la interpretación corre en el servidor.

import { interpretarDireccion } from "@/servicios/interpretacion";

export async function POST(req: Request): Promise<Response> {
  let texto = "";
  try {
    const cuerpo = (await req.json()) as { texto?: unknown };
    texto = typeof cuerpo.texto === "string" ? cuerpo.texto.trim() : "";
  } catch {
    return Response.json({ error: "Cuerpo inválido" }, { status: 400 });
  }
  if (!texto) return Response.json({ error: "Falta el campo texto" }, { status: 400 });
  return Response.json(await interpretarDireccion(texto));
}
