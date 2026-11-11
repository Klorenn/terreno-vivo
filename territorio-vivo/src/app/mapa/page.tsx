"use client";

import { useMemo, useState } from "react";
import { COLOR_SIN_DATO, ESCALA_TERRITORIAL } from "@/components/colores";
import { formatearNombreUV } from "@/components/formato";
import MapaCliente from "@/components/MapaCliente";
import { Encabezado, LeyendaMapa, Pagina, Tarjeta, Vacio } from "@/components/ui";
import { capaUV } from "@/data";
import { useResultados } from "@/store/resultados";

function colorPorValor(valor: number, maximo: number): string {
  if (maximo <= 0 || valor <= 0) return COLOR_SIN_DATO;
  const indice = Math.min(ESCALA_TERRITORIAL.length - 1, Math.floor((valor / maximo) * ESCALA_TERRITORIAL.length));
  return ESCALA_TERRITORIAL[indice];
}

const CLASE_CAMPO = "h-9 rounded-[10px] border border-tv-borde bg-tv-superficie px-2.5 text-sm focus:border-tv-araucaria focus:outline-none";

export default function PaginaMapa() {
  const registros = useResultados();
  const [tipo, setTipo] = useState("todos");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const tipos = useMemo(() => Array.from(new Set(registros.map((r) => r.tipo_prestacion))).sort(), [registros]);

  const filtrados = registros.filter(
    (r) =>
      r.uv_id &&
      (tipo === "todos" || r.tipo_prestacion === tipo) &&
      (!desde || (r.fecha && r.fecha >= desde)) &&
      (!hasta || (r.fecha && r.fecha <= hasta)),
  );

  const conteo = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of filtrados) if (r.uv_id) c[r.uv_id] = (c[r.uv_id] ?? 0) + 1;
    return c;
  }, [filtrados]);
  const maximo = Math.max(0, ...Object.values(conteo));
  const detalle = useMemo(
    () =>
      Object.fromEntries(
        capaUV.features.map((f) => {
          const n = conteo[f.properties.id] ?? 0;
          return [f.properties.id, `${n} ${n === 1 ? "prestación" : "prestaciones"}`];
        }),
      ),
    [conteo],
  );
  const colores = Object.fromEntries(capaUV.features.map((f) => [f.properties.id, colorPorValor(conteo[f.properties.id] ?? 0, maximo)]));

  return (
    <Pagina className="space-y-5">
      <Encabezado
        titulo="Mapa territorial"
        descripcion="Unidades vecinales coloreadas por cantidad de prestaciones asignadas. Solo agregado por UV, nunca por punto."
      />

      <div className="flex flex-wrap items-end gap-3 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-[12px] text-tv-tinta-suave">Tipo de prestación</span>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={CLASE_CAMPO}>
            <option value="todos">Todos</option>
            {tipos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[12px] text-tv-tinta-suave">Desde</span>
          <input type="date" lang="es-CL" aria-label="Desde (dd-mm-aaaa)" value={desde} onChange={(e) => setDesde(e.target.value)} className={CLASE_CAMPO} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[12px] text-tv-tinta-suave">Hasta</span>
          <input type="date" lang="es-CL" aria-label="Hasta (dd-mm-aaaa)" value={hasta} onChange={(e) => setHasta(e.target.value)} className={CLASE_CAMPO} />
        </label>
        <span className="self-end pb-2.5 text-tv-tinta-suave md:ml-auto">
          <span className="tabular font-semibold text-tv-tinta">{filtrados.length}</span> prestaciones asignadas
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="relative h-[55dvh] self-start overflow-hidden rounded-xl border border-tv-borde md:h-[min(70dvh,620px)]">
          <MapaCliente
            coloresUV={colores}
            alto="100%"
            encuadrarTodo="urbanas"
            paddingEncuadre={{ top: 24, right: 24, bottom: 110, left: 24 }}
            detalleUV={detalle}
          />
          <LeyendaMapa
            escala={ESCALA_TERRITORIAL}
            minimo="0"
            maximo={String(maximo)}
            titulo="Prestaciones asignadas"
            sinDato="Sin prestaciones"
          />
        </div>
        <Tarjeta titulo="Prestaciones por UV" className="self-start lg:max-h-[min(70dvh,620px)] lg:overflow-y-auto">
          {registros.length === 0 ? (
            <Vacio>Procese un lote para ver el mapa.</Vacio>
          ) : (
            <ul className="-my-1 text-sm">
              {capaUV.features
                .map((f) => ({ nombre: formatearNombreUV(f.properties.nombre), id: f.properties.id, n: conteo[f.properties.id] ?? 0 }))
                .sort((a, b) => b.n - a.n)
                .map((fila) => (
                  <li key={fila.id} className="flex items-center gap-2.5 border-b border-tv-borde/70 py-1.5 last:border-b-0">
                    <span className="inline-block h-3 w-3 shrink-0 rounded-[3px]" style={{ background: colores[fila.id] }} />
                    <span className="flex-1 truncate">{fila.nombre}</span>
                    <strong className="tabular">{fila.n}</strong>
                  </li>
                ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </Pagina>
  );
}
