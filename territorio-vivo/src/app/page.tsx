"use client";

import Link from "next/link";
import { useState } from "react";
import { ACIERTO_GENERICO, ACIERTO_SISTEMA } from "@/app/benchmark/resumen";
import { COLOR_CAUTIN } from "@/components/colores";
import MapaCliente from "@/components/MapaCliente";
import { Aviso, CLASES_BOTON, COLOR_CONFIANZA, DetalleRegistro } from "@/components/ui";
import { capaUV } from "@/data";
import type { RegistroProcesado } from "@/domain/tipos";
import { procesarRegistro } from "@/pipeline/procesar";
import { obtenerDiccionario } from "@/store/diccionario";
import { agregarRegistro } from "@/store/resultados";

/** `etiqueta` es lo que muestra el chip; `valor` es la dirección que se procesa. */
const EJEMPLOS: ReadonlyArray<{ etiqueta: string; valor: string }> = [
  { etiqueta: "Avenida Alemania 0450, Temuco", valor: "Avenida Alemania 0450, Temuco" },
  { etiqueta: "pje los aromos 123 pob sta rosa", valor: "pje los aromos 123 pob sta rosa" },
  {
    etiqueta: "comunidad juan cayunao, camino a tromén km 4",
    valor: "comunidad juan cayunao, camino a tromén km 4, frente a la escuela",
  },
  { etiqueta: "al lado del consultorio", valor: "al lado del consultorio" },
];

/** Sin resultado, todas las UV llevan un tinte azul muy suave para que se lea el territorio. */
const COLORES_TODAS_UV: Record<string, string> = Object.fromEntries(capaUV.features.map((f) => [f.properties.id, COLOR_CAUTIN]));

export default function PaginaInicio() {
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<RegistroProcesado | null>(null);
  const [faltaTexto, setFaltaTexto] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function procesar(direccion: string) {
    if (!direccion.trim()) {
      setFaltaTexto(true);
      return;
    }
    setFaltaTexto(false);
    setCargando(true);
    setError(null);
    setEnviado(false);
    try {
      const r = await procesarRegistro({ direccion }, obtenerDiccionario());
      setResultado(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al procesar");
    } finally {
      setCargando(false);
    }
  }

  const puntos = resultado?.coordenadas
    ? [
        {
          id: resultado.id,
          longitud: resultado.coordenadas.longitud,
          latitud: resultado.coordenadas.latitud,
          color: COLOR_CONFIANZA[resultado.confianza],
        },
      ]
    : [];
  const colores = resultado
    ? resultado.uv_id
      ? { [resultado.uv_id]: COLOR_CONFIANZA[resultado.confianza] }
      : {}
    : COLORES_TODAS_UV;

  return (
    <div className="md:relative md:h-[calc(100dvh-var(--tv-alto-banner))]">
      {/* Mapa: hero a pantalla completa en desktop, franja superior en móvil */}
      <div className="h-[280px] md:absolute md:inset-0 md:h-auto">
        <MapaCliente
          alto="100%"
          puntos={puntos}
          coloresUV={colores}
          uvResaltada={resultado?.uv_id ?? null}
          opacidadRelleno={resultado ? 0.18 : 0.08}
          encuadrarResaltada
          margenIzquierdoEncuadre={580}
          encuadrarTodo="urbanas"
          centrarEn={resultado?.coordenadas ? [resultado.coordenadas.longitud, resultado.coordenadas.latitud] : null}
        />
      </div>

      {/* Ficha flotante */}
      <section
        aria-label="Ubicar una dirección"
        className="relative z-10 -mt-4 rounded-t-2xl border-t border-tv-borde bg-tv-superficie px-4 pb-10 pt-5 md:absolute md:left-6 md:top-6 md:mt-0 md:max-h-[calc(100%-3rem)] md:w-[520px] md:overflow-y-auto md:rounded-xl md:[scrollbar-width:thin] md:border md:p-6 md:shadow-[0_12px_40px_-12px_rgba(20,33,27,0.25)]"
      >
        <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em] md:text-[32px] md:leading-9">
          Escriba una dirección tal como la diría un vecino
        </h1>
        <p className="mt-2 text-[13px] leading-[18px] text-tv-tinta-suave md:text-sm">
          El sistema la interpreta, la ubica en el mapa y la asigna a su unidad vecinal y macrosector, indicando qué tan segura es la
          asignación.
        </p>

        <form
          className="mt-5 flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void procesar(texto);
          }}
        >
          <label htmlFor="direccion" className="sr-only">
            Dirección
          </label>
          <input
            id="direccion"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              if (faltaTexto) setFaltaTexto(false);
            }}
            placeholder="Ej.: pasaje Los Aromos 123"
            autoComplete="off"
            className="h-14 w-full rounded-[10px] border-2 border-tv-tinta bg-tv-superficie px-4 text-base placeholder:text-tv-tinta-suave focus:border-tv-araucaria focus:outline-none"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={cargando} className={`${CLASES_BOTON.primario} flex-1 md:flex-none md:px-7`}>
              {cargando ? "Ubicando…" : "Ubicar"}
            </button>
            <Link href="/lote" className={`${CLASES_BOTON.secundario} flex-1 md:flex-none`}>
              Subir planilla
            </Link>
          </div>
        </form>

        <p className="mt-4 text-[12px] text-tv-tinta-suave">O pruebe con un ejemplo:</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {EJEMPLOS.map((ej) => (
            <button
              key={ej.valor}
              type="button"
              title={ej.valor !== ej.etiqueta ? ej.valor : undefined}
              onClick={() => {
                setTexto(ej.valor);
                void procesar(ej.valor);
              }}
              className="inline-flex h-auto min-h-9 items-center rounded-2xl border border-tv-borde bg-tv-fondo px-3 py-1.5 text-left text-[13px] leading-snug text-tv-tinta transition-colors hover:border-tv-tinta"
            >
              {ej.etiqueta}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-medium text-tv-araucaria">
          <Link href="/benchmark" className="underline-offset-4 hover:underline">
            Resultados medidos ({ACIERTO_SISTEMA} % frente a {ACIERTO_GENERICO} %)
          </Link>
          <Link href="/documentacion#como-se-usa" className="hidden underline-offset-4 hover:underline md:inline">
            Cómo se usa
          </Link>
        </div>

        {faltaTexto && (
          <div className="mt-4">
            <Aviso tipo="info">Escriba una dirección o elija un ejemplo.</Aviso>
          </div>
        )}

        {error && (
          <div className="mt-4">
            <Aviso tipo="error">{error}</Aviso>
          </div>
        )}

        {resultado && (
          <div className="mt-6 border-t border-tv-borde pt-5">
            <DetalleRegistro r={resultado} />
            {resultado.confianza === "baja" && (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                {enviado ? (
                  <>
                    <Aviso tipo="exito">Enviada a la bandeja de revisión.</Aviso>
                    <Link href="/revision" className={CLASES_BOTON.sutil}>
                      Ir a revisarla
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        agregarRegistro(resultado);
                        setEnviado(true);
                      }}
                      className={CLASES_BOTON.secundario}
                    >
                      Enviar a revisión
                    </button>
                    <span className="text-[13px] text-tv-tinta-suave">Un funcionario elige la UV en el mapa y el sistema la recuerda.</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
