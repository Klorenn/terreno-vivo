"use client";

import { useRef, useState } from "react";
import { COLOR_ARAUCARIA } from "@/components/colores";
import { formatearNombreUV } from "@/components/formato";
import MapaCliente from "@/components/MapaCliente";
import { Aviso, CLASES_BOTON, COLOR_CONFIANZA, DetalleRegistro, Encabezado, Pagina, Tarjeta, Vacio } from "@/components/ui";
import { capaUV } from "@/data";
import { expresionesDeBusqueda } from "@/domain/diccionario";
import { normalizarTexto } from "@/domain/normalizar";
import { centroideAproximado, uvPorId } from "@/domain/territorio";
import type { RegistroProcesado } from "@/domain/tipos";
import { agregarAlias, borrarCorrecciones, descargarDiccionario, useCorrecciones } from "@/store/diccionario-ui";
import { actualizarRegistro, useResultados } from "@/store/resultados";

export default function PaginaRevision() {
  const registros = useResultados();
  const correcciones = useCorrecciones().length;
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [uvElegida, setUvElegida] = useState<string | null>(null);
  const [guardarAlias, setGuardarAlias] = useState(true);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const contenedorMapa = useRef<HTMLDivElement>(null);

  function confirmarBorrado() {
    const texto = correcciones === 1 ? "la corrección guardada" : `las ${correcciones} correcciones guardadas`;
    if (window.confirm(`¿Borrar ${texto}? No se puede deshacer.`)) borrarCorrecciones();
  }

  const pendientes = registros.filter((r) => r.confianza === "baja" && !r.corregido_manualmente);
  const actual = pendientes.find((r) => r.id === seleccionado) ?? pendientes[0] ?? null;

  const expresionSugerida = actual ? (expresionesDeBusqueda(actual.estructurada)[0] ?? actual.direccion_original) : "";
  // Si la expresión es solo la dirección normalizada, se muestra tal como la escribió el vecino.
  const expresionVisible =
    actual && normalizarTexto(expresionSugerida) === normalizarTexto(actual.direccion_original)
      ? actual.direccion_original
      : expresionSugerida;

  function confirmar() {
    if (!actual || !uvElegida) return;
    const feature = uvPorId(uvElegida, capaUV);
    if (!feature) return;
    const [lon, lat] = centroideAproximado(feature);
    const corregido: RegistroProcesado = {
      ...actual,
      uv_id: feature.properties.id,
      uv_nombre: feature.properties.nombre,
      macrosector: feature.properties.macrosector,
      coordenadas: actual.coordenadas ?? { latitud: lat, longitud: lon },
      confianza: "alta",
      motivo: "Asignada manualmente por un funcionario",
      corregido_manualmente: true,
    };
    if (guardarAlias && expresionSugerida) {
      agregarAlias({
        expresion: expresionSugerida,
        uv_id: feature.properties.id,
        uv_nombre: feature.properties.nombre,
        latitud: actual.coordenadas?.latitud ?? lat,
        longitud: actual.coordenadas?.longitud ?? lon,
      });
      setMensaje(`Guardado. La próxima vez que aparezca «${expresionVisible}» se asignará a ${formatearNombreUV(feature.properties.nombre)}.`);
    } else {
      setMensaje(`Registro asignado a ${formatearNombreUV(feature.properties.nombre)}.`);
    }
    actualizarRegistro(corregido);
    setSeleccionado(null);
    setUvElegida(null);
  }

  const puntos = actual?.coordenadas
    ? [{ id: actual.id, longitud: actual.coordenadas.longitud, latitud: actual.coordenadas.latitud, color: COLOR_CONFIANZA.baja }]
    : [];

  const nombreUvElegida = uvElegida ? uvPorId(uvElegida, capaUV)?.properties.nombre : null;
  const nombreElegida = nombreUvElegida ? formatearNombreUV(nombreUvElegida) : null;

  return (
    <Pagina className="space-y-5">
      <Encabezado
        titulo="Bandeja de revisión"
        descripcion="Elija un registro, toque la UV correcta en el mapa y confirme. Si marca «Recordar», la próxima vez se ubicará sola."
        acciones={
          <>
            <span className="text-sm text-tv-tinta-suave">
              <span className="tabular font-semibold text-tv-tinta">{correcciones}</span>{" "}
              {correcciones === 1 ? "corrección guardada" : "correcciones guardadas"}
            </span>
            <button type="button" onClick={descargarDiccionario} className={`${CLASES_BOTON.secundario} h-9 px-3`}>
              Descargar lugares aprendidos
            </button>
          </>
        }
      />

      {mensaje && <Aviso tipo="exito">{mensaje}</Aviso>}

      {pendientes.length === 0 ? (
        <Tarjeta>
          <Vacio>No hay registros pendientes de revisión. Procese un lote primero.</Vacio>
          {correcciones > 0 && (
            <div className="border-t border-tv-borde pt-3 text-center">
              <button type="button" onClick={confirmarBorrado} className="text-[13px] text-tv-baja hover:underline">
                Borrar correcciones
              </button>
            </div>
          )}
        </Tarjeta>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <Tarjeta titulo={`Pendientes (${pendientes.length})`} className="self-start lg:max-h-[calc(100dvh-12rem)] lg:overflow-y-auto">
            <ul className="-m-2 space-y-0.5">
              {pendientes.map((r) => {
                const activo = actual?.id === r.id;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      aria-current={activo ? "true" : undefined}
                      onClick={() => {
                        setSeleccionado(r.id);
                        setUvElegida(null);
                        setMensaje(null);
                        if (window.innerWidth < 1024) {
                          contenedorMapa.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                      className={`w-full rounded-lg border-l-2 px-3 py-2 text-left text-sm transition-colors ${
                        activo ? "border-tv-araucaria bg-tv-araucaria/10" : "border-transparent hover:bg-tv-fondo"
                      }`}
                    >
                      <span className="block font-medium">{r.direccion_original}</span>
                      <span className="mt-1 inline-block rounded bg-tv-fondo px-1.5 py-0.5 text-[11px] text-tv-tinta-suave">
                        {r.motivo.toLowerCase().includes("parcial") ? "Parcial" : "Sin ubicar"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {correcciones > 0 && (
              <div className="mt-3 border-t border-tv-borde pt-3">
                <button type="button" onClick={confirmarBorrado} className="text-[13px] text-tv-baja hover:underline">
                  Borrar correcciones
                </button>
              </div>
            )}
          </Tarjeta>

          {actual && (
            <div className="space-y-4">
              <div ref={contenedorMapa} className="scroll-mt-28 md:scroll-mt-12">
                <Tarjeta titulo="Elija la UV en el mapa" className="overflow-hidden">
                  <div className="-mx-4 -mt-4">
                    <MapaCliente
                      alto="400px"
                      puntos={puntos}
                      uvResaltada={uvElegida}
                      coloresUV={uvElegida ? { [uvElegida]: COLOR_ARAUCARIA } : {}}
                      onClickUV={(id) => setUvElegida(id)}
                      encuadrarTodo="urbanas"
                      paddingEncuadre={24}
                      etiquetasDesde={10}
                      centrarEn={actual.coordenadas ? [actual.coordenadas.longitud, actual.coordenadas.latitud] : null}
                    />
                  </div>
                  <div className="mt-4 flex flex-col gap-3 text-sm md:flex-row md:flex-wrap md:items-center">
                    <span>
                      UV elegida:{" "}
                      <strong className={nombreElegida ? "text-tv-araucaria" : ""}>{nombreElegida ?? "ninguna (haga clic en el mapa)"}</strong>
                    </span>
                    <label className="flex items-center gap-2 md:ml-auto">
                      <input
                        type="checkbox"
                        checked={guardarAlias}
                        onChange={(e) => setGuardarAlias(e.target.checked)}
                        className="h-4 w-4 accent-tv-araucaria"
                      />
                      <span>Recordar «{expresionVisible}»</span>
                    </label>
                    <button type="button" onClick={confirmar} disabled={!uvElegida} className={`${CLASES_BOTON.primario} w-full md:w-auto`}>
                      Confirmar UV
                    </button>
                  </div>
                </Tarjeta>
              </div>
              <Tarjeta titulo="Registro">
                <DetalleRegistro r={actual} compacto />
              </Tarjeta>
            </div>
          )}
        </div>
      )}
    </Pagina>
  );
}
