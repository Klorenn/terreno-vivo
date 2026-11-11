"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { COLOR_CONFIANZA } from "@/components/colores";
import { formatearNombreUV } from "@/components/formato";
import { Aviso, CLASES_BOTON, Chip, ConfianzaBadge, Encabezado, Kpi, Pagina, Tarjeta } from "@/components/ui";
import type { Confianza, RegistroProcesado } from "@/domain/tipos";
import { descargarTexto, leerPlanilla, resultadosACsv } from "@/pipeline/planilla";
import { procesarLote, type RegistroEntrada } from "@/pipeline/procesar";
import { obtenerDiccionario } from "@/store/diccionario";
import { guardarResultados, useResultados } from "@/store/resultados";

type Filtro = "todas" | Confianza;

/** Se lanza desde el callback de progreso para cortar `procesarLote` sin modificar el pipeline. */
class LoteCancelado extends Error {}

/** Segundos estimados por registro antes de tener una medición (el geocodificador admite 1 consulta por segundo). */
const SEGUNDOS_POR_REGISTRO = 1;

function textoFaltante(segundos: number): string {
  if (segundos < 60) return "faltan menos de 1 min";
  return `faltan ~${Math.round(segundos / 60)} min`;
}

export default function PaginaLote() {
  const [entradas, setEntradas] = useState<RegistroEntrada[]>([]);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [progreso, setProgreso] = useState<[number, number] | null>(null);
  const guardados = useResultados();
  const [parciales, setParciales] = useState<RegistroProcesado[] | null>(null);
  const resultados = parciales ?? guardados;
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [faltante, setFaltante] = useState<string>("");
  const cancelado = useRef(false);
  const enCurso = useRef<RegistroProcesado[] | null>(null);

  // Si se sale de la pantalla a mitad de un lote, se corta y se guardan los registros ya procesados.
  useEffect(
    () => () => {
      if (enCurso.current) {
        cancelado.current = true;
        guardarResultados(enCurso.current);
      }
    },
    [],
  );

  async function cargarArchivo(archivo: File | null) {
    if (!archivo) return;
    setError(null);
    try {
      const filas = await leerPlanilla(archivo);
      if (filas.length === 0) throw new Error("La planilla no tiene una columna 'direccion' con datos.");
      setEntradas(filas);
      setNombreArchivo(archivo.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo leer la planilla");
    }
  }

  async function cargarEjemplo(nombre: string) {
    const res = await fetch(`/${nombre}`);
    const blob = await res.blob();
    await cargarArchivo(new File([blob], nombre, { type: "text/csv" }));
  }

  async function procesar() {
    if (entradas.length === 0) return;
    const total = entradas.length;
    setProgreso([0, total]);
    setError(null);
    setAviso(null);
    setFaltante(textoFaltante(total * SEGUNDOS_POR_REGISTRO));
    cancelado.current = false;
    const acumulados: RegistroProcesado[] = [];
    enCurso.current = acumulados;
    const inicio = performance.now();
    try {
      const todos = await procesarLote(entradas, obtenerDiccionario(), (hechos, totalLote, ultimo) => {
        acumulados.push(ultimo);
        setProgreso([hechos, totalLote]);
        setParciales([...acumulados]);
        const porRegistro = (performance.now() - inicio) / 1000 / hechos;
        setFaltante(textoFaltante((totalLote - hechos) * porRegistro));
        if (cancelado.current && hechos < totalLote) throw new LoteCancelado();
      });
      guardarResultados(todos);
      setParciales(null);
    } catch (e) {
      if (e instanceof LoteCancelado) {
        guardarResultados(acumulados);
        setParciales(null);
        setAviso(`Proceso cancelado. Se guardaron ${acumulados.length} de ${total} registros.`);
      } else {
        setError(e instanceof Error ? e.message : "Error al procesar el lote");
      }
    } finally {
      enCurso.current = null;
      setProgreso(null);
    }
  }

  const resumen = useMemo(() => {
    const c = { alta: 0, media: 0, baja: 0 };
    for (const r of resultados) c[r.confianza] += 1;
    return c;
  }, [resultados]);

  const visibles = filtro === "todas" ? resultados : resultados.filter((r) => r.confianza === filtro);
  const procesando = progreso !== null;
  const pasoActivo = procesando ? 2 : resultados.length ? 3 : entradas.length ? 2 : 1;

  return (
    <Pagina className="space-y-5">
      <Encabezado
        titulo="Resultados por lote"
        descripcion={
          <>
            Suba un archivo CSV o Excel con la columna <code className="rounded bg-tv-fondo px-1">direccion</code> (opcionales:{" "}
            <code className="rounded bg-tv-fondo px-1">tipo_prestacion</code>, <code className="rounded bg-tv-fondo px-1">fecha</code>). Solo
            se procesan dirección, tipo y fecha; no cargue datos personales.
          </>
        }
      />

      <Tarjeta>
        <ol className="mb-4 grid grid-cols-3 gap-2 text-[12px] text-tv-tinta-suave md:flex md:gap-6 md:text-[13px]">
          <li className={pasoActivo === 1 ? "font-semibold text-tv-tinta" : ""}>
            1. <span className="sm:hidden">Elegir</span>
            <span className="hidden sm:inline">Elegir archivo</span>
          </li>
          <li className={pasoActivo === 2 ? "font-semibold text-tv-tinta" : ""}>
            2. <span className="sm:hidden">Procesar</span>
            <span className="hidden sm:inline">Procesar planilla</span>
          </li>
          <li className={pasoActivo === 3 ? "font-semibold text-tv-tinta" : ""}>
            3. <span className="sm:hidden">Revisar</span>
            <span className="hidden sm:inline">Revisar y descargar</span>
          </li>
        </ol>
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
          <label className={`${CLASES_BOTON.secundario} cursor-pointer`}>
            Elegir archivo
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => void cargarArchivo(e.target.files?.[0] ?? null)}
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-tv-tinta-suave">Usar ejemplo:</span>
            <Chip activo={nombreArchivo === "ejemplo-prestaciones.csv"} onClick={() => void cargarEjemplo("ejemplo-prestaciones.csv")}>
              30 registros
            </Chip>
            <Chip activo={nombreArchivo === "ejemplo-prestaciones-300.csv"} onClick={() => void cargarEjemplo("ejemplo-prestaciones-300.csv")}>
              300 registros
            </Chip>
          </div>
          {!(resultados.length > 0 && entradas.length === 0) && (
            <button
              type="button"
              onClick={() => void procesar()}
              disabled={entradas.length === 0 || procesando}
              className={`${resultados.length > 0 && !procesando ? CLASES_BOTON.secundario : CLASES_BOTON.primario} md:ml-auto`}
            >
              {procesando
                ? `Procesando ${progreso[0]} de ${progreso[1]}…`
                : resultados.length > 0
                  ? "Volver a procesar"
                  : "Procesar planilla"}
            </button>
          )}
          {procesando && (
            <button
              type="button"
              onClick={() => {
                cancelado.current = true;
              }}
              className={CLASES_BOTON.secundario}
            >
              Cancelar
            </button>
          )}
          <p className="basis-full text-[12px] text-tv-tinta-suave">
            Aproximadamente 1 registro por segundo: la planilla de 300 tarda unos 5 minutos.
          </p>
        </div>
        {nombreArchivo && (
          <p className="mt-2 text-[13px] text-tv-tinta-suave">
            {nombreArchivo} · <span className="tabular">{entradas.length}</span> registros
          </p>
        )}
        {procesando && (
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={progreso[1]}
            aria-valuenow={progreso[0]}
            className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-tv-fondo"
          >
            <div className="h-full bg-tv-araucaria transition-[width]" style={{ width: `${(progreso[0] / progreso[1]) * 100}%` }} />
          </div>
        )}
        {procesando && (
          <p role="status" className="tabular mt-2 text-[13px] text-tv-tinta-suave">
            Procesando {progreso[0]} de {progreso[1]} · {faltante}
          </p>
        )}
        {aviso && (
          <div className="mt-3">
            <Aviso tipo="info">{aviso}</Aviso>
          </div>
        )}
        {error && (
          <div className="mt-3">
            <Aviso tipo="error">{error}</Aviso>
          </div>
        )}
      </Tarjeta>

      {resultados.length > 0 && (
        <Tarjeta className={`overflow-hidden transition-opacity ${procesando ? "opacity-60" : ""}`}>
          <div aria-busy={procesando}>
            <div
              role="tablist"
              aria-label="Filtrar por confianza"
              className="-mx-4 -mt-4 mb-4 grid grid-cols-4 divide-x divide-tv-borde border-b border-tv-borde md:flex"
            >
              <Kpi etiqueta="Total" valor={resultados.length} activo={filtro === "todas"} onClick={() => setFiltro("todas")} />
              <Kpi etiqueta="Asignados" valor={resumen.alta} color={COLOR_CONFIANZA.alta} activo={filtro === "alta"} onClick={() => setFiltro("alta")} />
              <Kpi
                etiqueta="Aproximados"
                valor={resumen.media}
                color={COLOR_CONFIANZA.media}
                activo={filtro === "media"}
                onClick={() => setFiltro("media")}
              />
              <Kpi etiqueta="Revisión" valor={resumen.baja} color={COLOR_CONFIANZA.baja} activo={filtro === "baja"} onClick={() => setFiltro("baja")} />
            </div>

            <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
              <Link href="/revision" className={`${CLASES_BOTON.sutil} w-full md:w-auto`}>
                Ir a la bandeja de revisión
              </Link>
              <button
                type="button"
                onClick={() => descargarTexto("territorio-vivo-resultados.csv", resultadosACsv(resultados))}
                disabled={procesando}
                className={`${CLASES_BOTON.primario} w-full md:w-auto`}
              >
                Descargar CSV
              </button>
            </div>

            <ul className="-mx-4 -mb-4 divide-y divide-tv-borde border-t border-tv-borde md:hidden">
              {visibles.map((r) => (
                <li key={r.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 text-sm font-medium">{r.direccion_original}</p>
                    <ConfianzaBadge nivel={r.confianza} />
                  </div>
                  <p className="mt-0.5 text-[13px] text-tv-tinta-suave">
                    {r.uv_nombre ? formatearNombreUV(r.uv_nombre) : "Sin UV"} · {r.macrosector ?? "Sin macrosector"}
                  </p>
                  <p className="mt-1 text-[12px] leading-4 text-tv-tinta-suave">{r.motivo}</p>
                </li>
              ))}
            </ul>

            <div className="-mx-4 -mb-4 hidden max-h-[60vh] overflow-auto md:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="sticky top-0 bg-tv-superficie text-[12px] text-tv-tinta-suave shadow-[inset_0_-1px_0_var(--color-tv-borde)]">
                  <tr>
                    <th className="py-2 pl-4 pr-3 font-medium">Dirección original</th>
                    <th className="py-2 pr-3 font-medium">Cómo se leyó</th>
                    <th className="py-2 pr-3 font-medium">UV</th>
                    <th className="py-2 pr-3 font-medium">Macrosector</th>
                    <th className="py-2 pr-3 font-medium">Confianza</th>
                    <th className="py-2 pr-4 font-medium">Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((r) => (
                    <tr key={r.id} className="border-t border-tv-borde/70 align-top hover:bg-tv-fondo/60">
                      <td className="py-2.5 pl-4 pr-3 font-medium">{r.direccion_original}</td>
                      <td className="py-2.5 pr-3 text-tv-tinta-suave">{resumirEstructurada(r)}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">{r.uv_nombre ? formatearNombreUV(r.uv_nombre) : "—"}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">{r.macrosector ?? "—"}</td>
                      <td className="py-2.5 pr-3">
                        <ConfianzaBadge nivel={r.confianza} />
                      </td>
                      <td className="py-2.5 pr-4 text-[12px] leading-4 text-tv-tinta-suave">{r.motivo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Tarjeta>
      )}
    </Pagina>
  );
}

function resumirEstructurada(r: RegistroProcesado): string {
  const e = r.estructurada;
  return [
    [e.calle, e.numero].filter(Boolean).join(" "),
    e.poblacion_o_villa && `pob. ${e.poblacion_o_villa}`,
    e.comunidad && `com. ${e.comunidad}`,
    e.camino_y_km,
    e.referencia && `ref: ${e.referencia}`,
  ]
    .filter(Boolean)
    .join(", ");
}
