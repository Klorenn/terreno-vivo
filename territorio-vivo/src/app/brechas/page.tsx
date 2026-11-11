"use client";

import { useMemo } from "react";
import { COLOR_SIN_DATO, ESCALA_BRECHA } from "@/components/colores";
import { formatearNombreUV } from "@/components/formato";
import MapaCliente from "@/components/MapaCliente";
import { Encabezado, LeyendaMapa, Pagina, Tarjeta, Vacio } from "@/components/ui";
import { capaUV } from "@/data";
import { useResultados } from "@/store/resultados";

const FORMATO_TASA: Intl.NumberFormatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

function formatearTasa(tasa: number): string {
  return tasa.toLocaleString("es-CL", FORMATO_TASA);
}

function colorPorTasa(tasa: number, maximo: number): string {
  if (!Number.isFinite(tasa)) return COLOR_SIN_DATO;
  if (maximo <= 0) return COLOR_SIN_DATO;
  // Invertido: menor cobertura = color más intenso (ahí está la brecha).
  const proporcion = 1 - tasa / maximo;
  const indice = Math.min(ESCALA_BRECHA.length - 1, Math.floor(proporcion * ESCALA_BRECHA.length));
  return ESCALA_BRECHA[indice];
}

export default function PaginaBrechas() {
  const registros = useResultados();

  const filas = useMemo(() => {
    const conteo: Record<string, number> = {};
    for (const r of registros) if (r.uv_id) conteo[r.uv_id] = (conteo[r.uv_id] ?? 0) + 1;
    return capaUV.features
      .map((f) => {
        const n = conteo[f.properties.id] ?? 0;
        return {
          id: f.properties.id,
          nombre: formatearNombreUV(f.properties.nombre),
          macrosector: f.properties.macrosector,
          poblacion: f.properties.poblacion,
          prestaciones: n,
          tasa: (n / f.properties.poblacion) * 1000,
        };
      })
      .sort((a, b) => a.tasa - b.tasa || b.poblacion - a.poblacion);
  }, [registros]);

  const maximo = Math.max(0, ...filas.map((f) => f.tasa));
  const detalle = Object.fromEntries(
    filas.map((f) => [
      f.id,
      `${Number.isFinite(f.tasa) ? formatearTasa(f.tasa) : "—"} por 1.000 hab. · ${f.prestaciones} ${f.prestaciones === 1 ? "prestación" : "prestaciones"}`,
    ]),
  );
  const colores = Object.fromEntries(filas.map((f) => [f.id, colorPorTasa(f.tasa, maximo)]));
  const menorCobertura = filas.slice(0, 5);
  const sinPrestaciones = filas.filter((f) => f.prestaciones === 0).length;

  return (
    <Pagina className="space-y-5">
      <Encabezado
        titulo="Mapa de brechas"
        descripcion={
          <>
            Prestaciones por cada 1.000 habitantes en cada UV. Más intenso = menor cobertura relativa. Indica dónde mirar; no reemplaza el
            criterio de los equipos municipales.
            <span className="mt-1 block font-semibold text-[#8A5300]">Población por UV: Censo 2024 (INE), asignada por manzana a la capa referencial de UV de MIDESOF (junio 2026).</span>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="relative h-[55dvh] self-start overflow-hidden rounded-xl border border-tv-borde md:h-[min(70dvh,620px)]">
          <MapaCliente coloresUV={colores} alto="100%" detalleUV={detalle} />
          <LeyendaMapa escala={ESCALA_BRECHA} minimo="mayor cobertura" maximo="menor" titulo="Brecha relativa" sinDato="Sin datos" />
        </div>
        <div className="space-y-4 self-start">
          <Tarjeta titulo="5 UV de menor cobertura">
            {registros.length === 0 ? (
              <Vacio>Procese un lote para calcular brechas.</Vacio>
            ) : (
              <>
                {sinPrestaciones > 0 && (
                  <p className="mb-2 text-[13px] text-tv-tinta-suave">{sinPrestaciones} UV sin prestaciones registradas</p>
                )}
                <ol className="-my-1 text-sm">
                  {menorCobertura.map((f, i) => (
                    <li key={f.id} className="flex items-start gap-3 border-b border-tv-borde/70 py-2 last:border-b-0">
                      <span className="tabular w-5 shrink-0 font-semibold text-tv-tinta-suave">{i + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{f.nombre}</span>
                        <span className="block text-[12px] leading-4 text-tv-tinta-suave">
                          {f.tasa === 0
                            ? f.macrosector
                            : `${f.prestaciones} ${f.prestaciones === 1 ? "prestación" : "prestaciones"} · ${f.poblacion.toLocaleString("es-CL")} hab.`}
                        </span>
                      </span>
                      {f.tasa === 0 ? (
                        <span className="shrink-0 text-right">
                          <strong className="tabular block text-base font-bold">{f.poblacion.toLocaleString("es-CL")} hab.</strong>
                          <span className="block text-[12px] leading-4 text-tv-tinta-suave">sin prestaciones</span>
                        </span>
                      ) : (
                        <span className="shrink-0 text-right">
                          <strong className="tabular block text-base">{formatearTasa(f.tasa)}</strong>
                          <span className="block text-[12px] leading-4 text-tv-tinta-suave">por 1.000 hab.</span>
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </Tarjeta>
          <Tarjeta titulo="Todas las UV" className="overflow-hidden">
            <div className="-m-4 max-h-[320px] overflow-auto">
              <table className="w-full text-[12px]">
                <thead className="sticky top-0 bg-tv-superficie text-tv-tinta-suave shadow-[inset_0_-1px_0_var(--color-tv-borde)]">
                  <tr>
                    <th className="py-1.5 pl-4 text-left font-medium">UV</th>
                    <th className="px-3 py-1.5 text-right font-medium">Prest.</th>
                    <th className="px-3 py-1.5 text-right font-medium">Hab.</th>
                    <th className="py-1.5 pr-4 text-right font-medium" title="Prestaciones por cada 1.000 habitantes">
                      Tasa
                    </th>
                  </tr>
                </thead>
                <tbody className="tabular">
                  {filas.map((f) => (
                    <tr key={f.id} className="border-t border-tv-borde/70">
                      <td className="py-1.5 pl-4">
                        <span className="flex items-start gap-1.5">
                          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: colores[f.id] }} />
                          {f.nombre}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-right">{f.prestaciones}</td>
                      <td className="px-3 py-1.5 text-right">{f.poblacion.toLocaleString("es-CL")}</td>
                      <td className="py-1.5 pr-4 text-right font-semibold">{formatearTasa(f.tasa)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Tarjeta>
        </div>
      </div>
    </Pagina>
  );
}
