"use client";

// Mapa reutilizable con maplibre-gl: base OSM atenuada, capa de UV coloreable, puntos y click en UV.
// Importar siempre con dynamic(..., { ssr: false }) vía ./MapaCliente.

import {
  Map as MapaLibre,
  NavigationControl,
  Popup,
  setWorkerUrl,
  type PaddingOptions,
  type ExpressionSpecification,
  type GeoJSONSource,
  type MapGeoJSONFeature,
  type MapMouseEvent,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import type { Feature, FeatureCollection, Point, Polygon } from "geojson";
import { BBOX_COMUNA, BBOX_URBANO, CENTRO_TEMUCO, capaMacrosectores, capaUV } from "@/data";
import { centroideAproximado } from "@/domain/territorio";
import { COLOR_ARAUCARIA, COLOR_SIN_DATO, COLOR_TINTA, COLOR_TINTA_SUAVE } from "./colores";
import { formatearNombreUV } from "./formato";

export interface PuntoMapa {
  id: string;
  longitud: number;
  latitud: number;
  color?: string;
  etiqueta?: string;
}

export interface PropsMapa {
  puntos?: PuntoMapa[];
  /** Color de relleno por id de UV. Las UV sin color usan gris claro. */
  coloresUV?: Record<string, string>;
  /** Id de UV a resaltar con borde grueso. */
  uvResaltada?: string | null;
  onClickUV?: (uvId: string, lngLat: [number, number]) => void;
  /** Centrar y acercar a este punto cuando cambia (si no se encuadra una UV). */
  centrarEn?: [number, number] | null;
  /** Opacidad del relleno de las UV (0 a 1). */
  opacidadRelleno?: number;
  /** Si es true, al cambiar `uvResaltada` el mapa se encuadra a su polígono (fitBounds). */
  encuadrarResaltada?: boolean;
  /** Margen izquierdo del encuadre en desktop (≥ 768 px), p. ej. para dejar libre una ficha flotante. 0 = usar `paddingEncuadre`. */
  margenIzquierdoEncuadre?: number;
  /** Margen (px) al encuadrar: un número para los cuatro lados o un objeto por lado. */
  paddingEncuadre?: number | PaddingOptions;
  /** Zoom desde el que se muestran los nombres de UV. */
  etiquetasDesde?: number;
  /** Texto adicional del tooltip por id de UV (p. ej. "12 prestaciones"). */
  detalleUV?: Record<string, string>;
  /**
   * Si no hay UV resaltada, al cargar encuadra las UV: "todas", o "urbanas" (sin el macrosector rural;
   * si quedan menos de 5, todas). `true` equivale a "todas".
   */
  encuadrarTodo?: boolean | "todas" | "urbanas";
  /** Alto CSS del contenedor. "100%" para llenar un padre con alto definido. */
  alto?: string;
  className?: string;
}

const ESTILO: StyleSpecification = {
  version: 8,
  sources: {
    base: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap",
    },
  },
  // Base OSM muy atenuada (los tiles de CARTO exigen API key) para que los polígonos y los nombres de UV manden (docs/diseno.md).
  layers: [
    {
      id: "base",
      type: "raster",
      source: "base",
      paint: {
        "raster-saturation": -0.85,
        "raster-brightness-min": 0.15,
        "raster-contrast": -0.15,
        "raster-opacity": ["interpolate", ["linear"], ["zoom"], 11, 0.85, 15, 0.6],
      },
    },
  ],
};

const OPACIDAD_RELLENO = 0.45;

type Caja = [[number, number], [number, number]];

/** Caja [[oeste, sur], [este, norte]] que contiene los polígonos entregados, o null si no hay coordenadas. */
function cajaDe(features: ReadonlyArray<Feature<Polygon>>): Caja | null {
  let oeste = Infinity;
  let sur = Infinity;
  let este = -Infinity;
  let norte = -Infinity;
  for (const f of features) {
    for (const anillo of f.geometry.coordinates) {
      for (const [lon, lat] of anillo) {
        oeste = Math.min(oeste, lon);
        este = Math.max(este, lon);
        sur = Math.min(sur, lat);
        norte = Math.max(norte, lat);
      }
    }
  }
  if (!Number.isFinite(oeste)) return null;
  return [
    [oeste, sur],
    [este, norte],
  ];
}

function cajaUV(id: string): Caja | null {
  const f = capaUV.features.find((x) => x.properties.id === id);
  return f ? cajaDe([f]) : null;
}

/** Límite de navegación: la comuna con un 15 % de holgura por lado. */
const LIMITES_MAPA: [number, number, number, number] = (() => {
  const [oeste, sur, este, norte] = BBOX_COMUNA;
  const dx = (este - oeste) * 0.15;
  const dy = (norte - sur) * 0.15;
  return [oeste - dx, sur - dy, este + dx, norte + dy];
})();

const NOMBRE_UV: Record<string, string> = Object.fromEntries(
  capaUV.features.map((f) => [f.properties.id, formatearNombreUV(f.properties.nombre)]),
);

/** Un punto por UV (centroide aproximado) para que cada nombre se dibuje una sola vez. */
const CENTROIDES_UV: FeatureCollection<Point, { id: string; nombre: string; poblacion: number }> = {
  type: "FeatureCollection",
  features: capaUV.features.map((f) => ({
    type: "Feature",
    properties: {
      id: f.properties.id,
      nombre: formatearNombreUV(f.properties.nombre),
      poblacion: Number.isFinite(f.properties.poblacion) ? f.properties.poblacion : 0,
    },
    geometry: { type: "Point", coordinates: centroideAproximado(f) },
  })),
};

function calcularPadding(base: number | PaddingOptions, margenIzquierdo: number): PaddingOptions {
  const lados = typeof base === "number" ? { top: base, bottom: base, left: base, right: base } : base;
  return margenIzquierdo > 0 && window.innerWidth >= 768 ? { ...lados, left: margenIzquierdo } : lados;
}

function contenidoTooltip(nombre: string, detalle?: string): HTMLElement {
  const caja = document.createElement("div");
  const titulo = document.createElement("div");
  titulo.textContent = nombre;
  caja.appendChild(titulo);
  if (detalle) {
    const linea = document.createElement("div");
    linea.textContent = detalle;
    linea.style.fontWeight = "400";
    linea.style.color = "var(--color-tv-tinta-suave)";
    caja.appendChild(linea);
  }
  return caja;
}

function expresionColores(colores: Record<string, string>): ExpressionSpecification | string {
  const pares = Object.entries(colores).filter(([, color]) => typeof color === "string" && color.length > 0);
  if (pares.length === 0) return COLOR_SIN_DATO;
  return ["match", ["get", "id"], ...pares.flat(), COLOR_SIN_DATO] as unknown as ExpressionSpecification;
}

export default function Mapa({
  puntos = [],
  coloresUV = {},
  uvResaltada = null,
  onClickUV,
  centrarEn = null,
  opacidadRelleno = OPACIDAD_RELLENO,
  encuadrarResaltada = false,
  margenIzquierdoEncuadre = 0,
  paddingEncuadre = 40,
  encuadrarTodo = false,
  etiquetasDesde = 12.5,
  detalleUV,
  alto = "420px",
  className = "",
}: PropsMapa) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaLibre | null>(null);
  const listo = useRef(false);
  const clickRef = useRef(onClickUV);
  useEffect(() => {
    clickRef.current = onClickUV;
  }, [onClickUV]);
  const encuadrePendiente = useRef(false);
  const detalleRef = useRef(detalleUV);
  useEffect(() => {
    detalleRef.current = detalleUV;
  }, [detalleUV]);

  useEffect(() => {
    if (!contenedor.current || mapa.current) return;
    // Turbopack no resuelve la URL del worker ESM de maplibre; se sirve una copia desde public/ (script copiar-worker).
    setWorkerUrl("/maplibre-gl-worker.mjs");
    const m = new MapaLibre({
      container: contenedor.current,
      style: ESTILO,
      center: CENTRO_TEMUCO,
      zoom: 11,
      maxBounds: LIMITES_MAPA,
      attributionControl: { compact: true },
    });
    m.addControl(new NavigationControl({ showCompass: false }), "top-right");

    // Encuadre inicial: se aplica al cargar y se repite tras cada cambio de tamaño del contenedor
    // (carga diferida, grid, hoja móvil) mientras la persona no haya movido el mapa.
    const cajaInicial = encuadrarTodo === "urbanas" ? BBOX_URBANO : encuadrarTodo ? BBOX_COMUNA : null;
    // Si ya hay un punto que centrar (p. ej. el registro en revisión), manda ese punto.
    encuadrePendiente.current = Boolean(cajaInicial && !uvResaltada && !centrarEn);
    const aplicarEncuadre = () => {
      if (!encuadrePendiente.current || !cajaInicial) return;
      // Un margen grande (la ficha de Inicio) obliga a mostrar terreno fuera del límite de navegación:
      // se encuadra sin límite y luego se amplía el límite para incluir la vista resultante.
      m.setMaxBounds(null);
      m.fitBounds(cajaInicial, { padding: calcularPadding(paddingEncuadre, margenIzquierdoEncuadre), duration: 0 });
      const [[o, s], [e, n]] = m.getBounds().toArray();
      const [lo, ls, le, ln] = LIMITES_MAPA;
      m.setMaxBounds([Math.min(o, lo), Math.min(s, ls), Math.max(e, le), Math.max(n, ln)]);
    };
    const soltarEncuadre = (e: { originalEvent?: unknown }) => {
      if (e.originalEvent) encuadrePendiente.current = false;
    };
    m.on("dragstart", soltarEncuadre);
    m.on("zoomstart", soltarEncuadre);

    const tooltip = new Popup({ closeButton: false, closeOnClick: false, offset: 8, className: "tv-tooltip" });
    const sinHover = window.matchMedia("(hover: none)").matches;
    const mostrarTooltip = (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
      const id = e.features?.[0]?.properties.id;
      if (id === undefined) return;
      const clave = String(id);
      tooltip
        .setLngLat(e.lngLat)
        .setDOMContent(contenidoTooltip(NOMBRE_UV[clave] ?? clave, detalleRef.current?.[clave]))
        .addTo(m);
    };
    m.on("load", () => {
      m.addSource("uv", { type: "geojson", data: capaUV });
      m.addSource("macro", { type: "geojson", data: capaMacrosectores });
      m.addSource("uv-centroides", { type: "geojson", data: CENTROIDES_UV });
      m.addSource("puntos", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      m.addLayer({
        id: "uv-relleno",
        type: "fill",
        source: "uv",
        paint: { "fill-color": COLOR_SIN_DATO, "fill-opacity": opacidadRelleno },
      });
      m.addLayer({
        id: "uv-borde-halo",
        type: "line",
        source: "uv",
        paint: { "line-color": "#ffffff", "line-width": 2 },
      });
      m.addLayer({
        id: "uv-borde",
        type: "line",
        source: "uv",
        paint: { "line-color": COLOR_TINTA_SUAVE, "line-width": 0.8 },
      });
      m.addLayer({
        id: "macro-borde",
        type: "line",
        source: "macro",
        paint: { "line-color": COLOR_TINTA, "line-width": 1.5, "line-opacity": 0.6, "line-dasharray": [4, 3] },
      });
      m.addLayer({
        id: "uv-resaltada",
        type: "line",
        source: "uv",
        paint: { "line-color": COLOR_ARAUCARIA, "line-width": 3 },
        filter: ["==", ["get", "id"], ""],
      });
      m.addLayer({
        id: "uv-etiqueta",
        type: "symbol",
        source: "uv-centroides",
        minzoom: etiquetasDesde,
        layout: {
          "text-padding": 6,
          "text-allow-overlap": false,
          "symbol-sort-key": ["-", ["get", "poblacion"]],
          "text-variable-anchor": ["top", "bottom", "left", "right"],
          "text-radial-offset": 1.2,
          "symbol-avoid-edges": true,
          "text-field": ["get", "nombre"],
          "text-size": 12,
          "text-font": ["Open Sans Regular"],
          "text-letter-spacing": 0.01,
          "text-max-width": 8,
        },
        paint: { "text-color": COLOR_TINTA, "text-halo-color": "#ffffff", "text-halo-width": 2 },
      });
      m.addLayer({
        id: "puntos-anillo",
        type: "circle",
        source: "puntos",
        paint: { "circle-radius": 16, "circle-color": ["get", "color"], "circle-opacity": 0.25 },
      });
      m.addLayer({
        id: "puntos",
        type: "circle",
        source: "puntos",
        paint: {
          "circle-radius": 10,
          "circle-color": ["get", "color"],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 3,
        },
      });
      m.on("click", "uv-relleno", (e: MapMouseEvent & { features?: MapGeoJSONFeature[] }) => {
        const f = e.features?.[0];
        if (f && clickRef.current) clickRef.current(String(f.properties.id), [e.lngLat.lng, e.lngLat.lat]);
      });
      m.on("mouseenter", "uv-relleno", () => {
        if (clickRef.current) m.getCanvas().style.cursor = "pointer";
      });
      m.on("mouseleave", "uv-relleno", () => {
        m.getCanvas().style.cursor = "";
        tooltip.remove();
      });
      if (sinHover) {
        m.on("click", "uv-relleno", mostrarTooltip);
        m.on("click", (e) => {
          if (m.queryRenderedFeatures(e.point, { layers: ["uv-relleno"] }).length === 0) tooltip.remove();
        });
      } else {
        m.on("mousemove", "uv-relleno", mostrarTooltip);
      }
      listo.current = true;
      // aplica el estado inicial
      m.setPaintProperty("uv-relleno", "fill-color", expresionColores(coloresUV));
      m.setFilter("uv-resaltada", ["==", ["get", "id"], uvResaltada ?? ""]);
      actualizarPuntos(m, puntos);
      aplicarEncuadre();
    });
    aplicarEncuadre();
    mapa.current = m;
    // El contenedor puede cambiar de tamaño (grid, hoja móvil, carga diferida): maplibre no lo detecta solo.
    let tamano = "";
    const observador = new ResizeObserver(([entrada]) => {
      const { width, height } = entrada.contentRect;
      const nuevo = `${Math.round(width)}x${Math.round(height)}`;
      if (nuevo === tamano) return;
      tamano = nuevo;
      m.resize();
      aplicarEncuadre();
    });
    observador.observe(contenedor.current);
    return () => {
      observador.disconnect();
      tooltip.remove();
      m.remove();
      mapa.current = null;
      listo.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const m = mapa.current;
    if (!m || !listo.current) return;
    m.setPaintProperty("uv-relleno", "fill-color", expresionColores(coloresUV));
  }, [coloresUV]);

  useEffect(() => {
    const m = mapa.current;
    if (!m || !listo.current) return;
    m.setPaintProperty("uv-relleno", "fill-opacity", opacidadRelleno);
  }, [opacidadRelleno]);

  useEffect(() => {
    const m = mapa.current;
    if (!m || !listo.current) return;
    m.setFilter("uv-resaltada", ["==", ["get", "id"], uvResaltada ?? ""]);
  }, [uvResaltada]);

  useEffect(() => {
    const m = mapa.current;
    if (!m || !listo.current) return;
    actualizarPuntos(m, puntos);
  }, [puntos]);

  // Se depende de valores primitivos: `centrarEn` suele llegar como arreglo nuevo en cada render.
  const uvEncuadre = encuadrarResaltada ? uvResaltada : null;
  const centroLon = centrarEn?.[0] ?? null;
  const centroLat = centrarEn?.[1] ?? null;
  useEffect(() => {
    const m = mapa.current;
    if (!m) return;
    const caja = uvEncuadre ? cajaUV(uvEncuadre) : null;
    if (caja || (centroLon !== null && centroLat !== null)) encuadrePendiente.current = false;
    if (caja) {
      m.fitBounds(caja, { padding: calcularPadding(paddingEncuadre, margenIzquierdoEncuadre), maxZoom: 14.5, duration: 800 });
      return;
    }
    if (centroLon !== null && centroLat !== null) m.flyTo({ center: [centroLon, centroLat], zoom: 14, duration: 800 });
  }, [uvEncuadre, centroLon, centroLat, margenIzquierdoEncuadre, paddingEncuadre]);

  return <div ref={contenedor} style={{ height: alto }} className={`w-full bg-tv-sin-dato ${className}`} />;
}

function actualizarPuntos(m: MapaLibre, puntos: PuntoMapa[]) {
  const fuente = m.getSource("puntos") as GeoJSONSource | undefined;
  fuente?.setData({
    type: "FeatureCollection",
    features: puntos.map((p) => ({
      type: "Feature",
      properties: { id: p.id, color: p.color ?? COLOR_ARAUCARIA, etiqueta: p.etiqueta ?? "" },
      geometry: { type: "Point", coordinates: [p.longitud, p.latitud] },
    })),
  });
}
