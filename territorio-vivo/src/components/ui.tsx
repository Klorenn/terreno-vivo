"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { Confianza, RegistroProcesado, TipoPrecision } from "@/domain/tipos";
import { COLOR_CONFIANZA } from "./colores";
import { formatearNombreUV } from "./formato";

export { COLOR_CONFIANZA } from "./colores";

/* ---------- Navegación ---------- */

type Icono = "inicio" | "lote" | "revision" | "mapa" | "brechas" | "benchmark" | "documentacion";

const ENLACES: ReadonlyArray<{
  href: "/" | "/lote" | "/revision" | "/mapa" | "/brechas" | "/benchmark" | "/documentacion";
  etiqueta: string;
  corta: string;
  icono: Icono;
  /** Solo en el riel de escritorio; la barra móvil conserva 5 pestañas. */
  soloEscritorio?: boolean;
}> = [
  { href: "/", etiqueta: "Inicio", corta: "Inicio", icono: "inicio" },
  { href: "/lote", etiqueta: "Resultados por lote", corta: "Lote", icono: "lote" },
  { href: "/revision", etiqueta: "Bandeja de revisión", corta: "Revisión", icono: "revision" },
  { href: "/mapa", etiqueta: "Mapa territorial", corta: "Mapa", icono: "mapa" },
  { href: "/brechas", etiqueta: "Mapa de brechas", corta: "Brechas", icono: "brechas" },
  { href: "/benchmark", etiqueta: "Resultados medidos", corta: "Resultados", icono: "benchmark", soloEscritorio: true },
  { href: "/documentacion", etiqueta: "Documentación", corta: "Ayuda", icono: "documentacion", soloEscritorio: true },
];

/** Cuentas oficiales listadas en temuco.cl (directorios facebook-, instagram- y twitter-municipales). */
const REDES_MUNICIPIO = [
  { nombre: "Sitio web de la Municipalidad de Temuco", href: "https://www.temuco.cl/", icono: "web" },
  { nombre: "Facebook de la Municipalidad de Temuco", href: "https://www.facebook.com/municipiotemuco", icono: "facebook" },
  { nombre: "Instagram de la Municipalidad de Temuco", href: "https://instagram.com/munitemuco", icono: "instagram" },
  { nombre: "X de la Municipalidad de Temuco", href: "https://twitter.com/municipiotemuco", icono: "x" },
  { nombre: "YouTube de la Municipalidad de Temuco", href: "https://www.youtube.com/temucowebvideos", icono: "youtube" },
] as const;

function IconoRed({ nombre }: { nombre: (typeof REDES_MUNICIPIO)[number]["icono"] }) {
  const trazos: Record<(typeof REDES_MUNICIPIO)[number]["icono"], ReactNode> = {
    web: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </>
    ),
    facebook: <path d="M14 8h2.5V4.5H14A3.5 3.5 0 0 0 10.5 8v2.5H8V14h2.5v6H14v-6h2.5l.5-3.5h-3V8.5c0-.3.2-.5.5-.5Z" />,
    instagram: (
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
        <circle cx="12" cy="12" r="3.8" />
        <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
      </>
    ),
    x: <path d="M4 4l16 16M20 4L4 20" />,
    youtube: (
      <>
        <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
        <path d="M10 9.5v5l4.5-2.5L10 9.5Z" fill="currentColor" stroke="none" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {trazos[nombre]}
    </svg>
  );
}

function IconoNav({ nombre }: { nombre: Icono }) {
  const trazos: Record<Icono, ReactNode> = {
    inicio: (
      <>
        <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z" />
        <circle cx="12" cy="11" r="2.2" />
      </>
    ),
    lote: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 10h18M3 15h18M9 4v16" />
      </>
    ),
    revision: (
      <>
        <path d="M4 13V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7" />
        <path d="M4 13h4l1.5 3h5L16 13h4v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5Z" />
      </>
    ),
    mapa: (
      <>
        <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6Z" />
        <path d="M9 4v14M15 6v14" />
      </>
    ),
    brechas: (
      <>
        <path d="M4 20h16" />
        <path d="M6 16v-5M11 16V8M16 16v-3M21 16V4" />
      </>
    ),
    benchmark: (
      <>
        <path d="M4 5h16M4 12h10M4 19h13" />
        <path d="M20 10l-2 2 2 2M20 17l-2 2 2 2" />
      </>
    ),
    documentacion: (
      <>
        <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v14H6.5A1.5 1.5 0 0 0 5 18.5v-14Z" />
        <path d="M5 18.5A1.5 1.5 0 0 0 6.5 20H19v-3" />
        <path d="M10.3 7.6a1.8 1.8 0 1 1 2.5 1.7c-.5.2-.8.6-.8 1.1v.3M12 13h.01" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {trazos[nombre]}
    </svg>
  );
}

function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <Image
        src="/logo-municipalidad-temuco.png"
        alt="Logo de la Municipalidad de Temuco"
        width={44}
        height={29}
        sizes="44px"
        priority
        className="shrink-0"
        style={{ width: 44, height: "auto" }}
      />
      <span className={compacta ? "hidden lg:block" : "block"}>
        <span className="block text-[15px] font-bold leading-tight tracking-tight">Territorio Vivo</span>
        <span className="block text-[11px] leading-tight text-tv-tinta-suave">Proyecto para la Municipalidad de Temuco</span>
      </span>
    </Link>
  );
}

export function Navegacion() {
  const ruta = usePathname();
  return (
    <>
      {/* Riel lateral (desktop) */}
      <aside className="sticky top-[var(--tv-alto-banner)] hidden h-[calc(100dvh-var(--tv-alto-banner))] w-16 shrink-0 flex-col border-r border-tv-borde bg-tv-superficie md:flex lg:w-60">
        <div className="flex h-16 items-center justify-center border-b border-tv-borde px-3 lg:justify-start lg:px-4">
          <Marca compacta />
        </div>
        <nav aria-label="Secciones" className="flex flex-col gap-1 p-2">
          {ENLACES.map((e) => {
            const activo = ruta === e.href;
            return (
              <Link
                key={e.href}
                href={e.href}
                aria-current={activo ? "page" : undefined}
                title={e.etiqueta}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activo ? "bg-tv-araucaria/10 text-tv-araucaria" : "text-tv-tinta-suave hover:bg-tv-fondo hover:text-tv-tinta"
                }`}
              >
                <IconoNav nombre={e.icono} />
                <span className="hidden lg:inline">{e.etiqueta}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Barra superior (móvil) */}
      <div className="fixed inset-x-0 top-[var(--tv-alto-banner)] z-30 flex h-12 items-center border-b border-tv-borde bg-tv-superficie px-4 md:hidden">
        <Marca />
        <Link
          href="/documentacion"
          aria-label="Documentación y ayuda"
          aria-current={ruta === "/documentacion" ? "page" : undefined}
          title="Documentación y ayuda"
          className={`ml-auto flex h-9 w-9 items-center justify-center rounded-full border text-[15px] font-bold transition-colors ${
            ruta === "/documentacion"
              ? "border-tv-araucaria bg-tv-araucaria/10 text-tv-araucaria"
              : "border-tv-borde text-tv-tinta-suave hover:border-tv-tinta hover:text-tv-tinta"
          }`}
        >
          <span aria-hidden="true">?</span>
        </Link>
      </div>

      {/* Pestañas inferiores (móvil) */}
      <nav
        aria-label="Secciones"
        className="fixed inset-x-0 bottom-0 z-30 grid h-[var(--tv-alto-pestanas)] grid-cols-5 border-t border-tv-borde bg-tv-superficie pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {ENLACES.filter((e) => !e.soloEscritorio).map((e) => {
          const activo = ruta === e.href;
          return (
            <Link
              key={e.href}
              href={e.href}
              aria-current={activo ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                activo ? "text-tv-araucaria" : "text-tv-tinta-suave"
              }`}
            >
              <IconoNav nombre={e.icono} />
              {e.corta}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function Banner() {
  return (
    <div className="sticky top-0 z-40 flex h-[var(--tv-alto-banner)] items-center justify-center bg-tv-aviso px-4 text-center text-[12px] font-semibold leading-none text-tv-tinta">
      <span className="truncate sm:hidden">Prototipo · límites de UV referenciales</span>
      <span className="hidden truncate sm:inline">
        Prototipo con datos abiertos (MIDESOF, INE Censo 2024, OpenStreetMap): límites de UV referenciales, pendientes de validar con el
        municipio.
      </span>
    </div>
  );
}

export function PiePagina() {
  return (
    <footer className="border-t border-tv-borde bg-tv-superficie">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-4 py-4 text-[12px] leading-4 text-tv-tinta-suave md:flex-row md:items-center md:justify-between md:gap-6 md:px-6 lg:px-8">
        <span className="flex items-center gap-2.5">
          <Image
            src="/logo-municipalidad-temuco.png"
            alt="Logo de la Municipalidad de Temuco"
            width={30}
            height={20}
            sizes="30px"
            className="shrink-0"
            style={{ width: 30, height: "auto" }}
          />
          Proyecto para la Municipalidad de Temuco · Innova TemucoLab 2026
        </span>
        <ul aria-label="Redes de la Municipalidad de Temuco" className="flex items-center gap-1">
          {REDES_MUNICIPIO.map((r) => (
            <li key={r.href}>
              <a
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                title={r.nombre}
                aria-label={r.nombre}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-tv-tinta-suave transition-colors hover:bg-tv-fondo hover:text-tv-araucaria"
              >
                <IconoRed nombre={r.icono} />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-tv-borde/70">
        <p className="mx-auto w-full max-w-[1400px] px-4 py-2.5 text-[11px] leading-4 text-tv-tinta-suave md:px-6 lg:px-8">
          UV: MIDESOF/BIDAT 2026 (CC BY 4.0) · Población: INE Censo 2024 · Macrosectores: PLADECO Temuco 2020-2024 · Lugares y mapa base ©
          colaboradores de OpenStreetMap (ODbL) · Sin datos personales · Resultados guardados solo en este navegador ·{" "}
          <Link href="/benchmark" className="text-tv-araucaria underline-offset-2 hover:underline">
            Resultados medidos
          </Link>{" "}
          ·{" "}
          <Link href="/documentacion" className="text-tv-araucaria underline-offset-2 hover:underline">
            Documentación
          </Link>
        </p>
      </div>
    </footer>
  );
}

/* ---------- Bloques de página ---------- */

export function Pagina({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1400px] px-4 py-5 md:px-6 md:py-6 lg:px-8 ${className}`}>{children}</div>;
}

export function Encabezado({ titulo, descripcion, acciones }: { titulo: string; descripcion?: ReactNode; acciones?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="max-w-[640px]">
        <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em] md:text-[32px] md:leading-9">{titulo}</h1>
        {descripcion && <p className="mt-1.5 text-[13px] leading-[18px] text-tv-tinta-suave md:text-sm">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </div>
  );
}

export function Tarjeta({
  titulo,
  children,
  className = "",
  acciones,
}: {
  titulo?: string;
  children: ReactNode;
  className?: string;
  acciones?: ReactNode;
}) {
  return (
    <section className={`rounded-xl border border-tv-borde bg-tv-superficie ${className}`}>
      {(titulo || acciones) && (
        <header className="flex items-center justify-between gap-3 border-b border-tv-borde px-4 py-2.5">
          {titulo && <h2 className="text-[13px] font-semibold text-tv-tinta-suave">{titulo}</h2>}
          {acciones}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

/* ---------- Controles ---------- */

const BASE_BOTON =
  "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:border-transparent disabled:bg-tv-tinta/55 disabled:text-white";

export const CLASES_BOTON = {
  primario: `${BASE_BOTON} bg-tv-tinta text-white hover:bg-tv-araucaria`,
  secundario: `${BASE_BOTON} border border-tv-borde bg-tv-superficie text-tv-tinta hover:border-tv-tinta`,
  sutil: `${BASE_BOTON} h-9 px-3 text-tv-araucaria hover:bg-tv-araucaria/10`,
} as const;

export function Chip({ activo = false, children, onClick }: { activo?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={onClick ? activo : undefined}
      className={`inline-flex h-8 items-center rounded-full border px-3 text-[13px] font-medium transition-colors ${
        activo ? "border-tv-tinta bg-tv-tinta text-white" : "border-tv-borde bg-tv-superficie text-tv-tinta hover:border-tv-tinta"
      }`}
    >
      {children}
    </button>
  );
}

export function Kpi({
  etiqueta,
  valor,
  color,
  activo = false,
  onClick,
}: {
  etiqueta: string;
  valor: number;
  color?: string;
  activo?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      onClick={onClick}
      aria-selected={activo}
      className={`flex min-w-0 flex-col items-start gap-0.5 px-2.5 py-3 text-left transition-colors hover:bg-tv-fondo sm:px-4 ${
        activo ? "shadow-[inset_0_-2px_0_var(--color-tv-tinta)]" : ""
      }`}
    >
      <span className="tabular text-[28px] font-bold leading-8 tracking-tight" style={color ? { color } : undefined}>
        {valor}
      </span>
      <span className="text-[12px] text-tv-tinta-suave sm:text-[13px]">{etiqueta}</span>
    </button>
  );
}

export function Aviso({ tipo, children }: { tipo: "error" | "exito" | "info"; children: ReactNode }) {
  const clases = {
    error: "border-tv-baja/30 bg-tv-baja/5 text-tv-baja",
    exito: "border-tv-alta/30 bg-tv-alta/5 text-tv-alta",
    info: "border-tv-borde bg-tv-superficie text-tv-tinta-suave",
  }[tipo];
  return (
    <p role={tipo === "error" ? "alert" : "status"} className={`rounded-[10px] border px-3.5 py-2.5 text-sm ${clases}`}>
      {children}
    </p>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-tv-tinta-suave">{children}</p>;
}

/* ---------- Confianza ---------- */

const TEXTO_CONFIANZA: Record<Confianza, string> = { alta: "Alta", media: "Media", baja: "Baja" };
const DETALLE_CONFIANZA: Record<Confianza, string> = { alta: "asignado", media: "aproximado", baja: "requiere revisión" };

export function ConfianzaBadge({ nivel, detalle = false }: { nivel: Confianza; detalle?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-tv-borde bg-tv-superficie py-0.5 pl-2 pr-2.5 text-xs font-semibold text-tv-tinta">
      <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: COLOR_CONFIANZA[nivel] }} />
      {TEXTO_CONFIANZA[nivel]}
      {detalle && <span className="font-normal text-tv-tinta-suave">· {DETALLE_CONFIANZA[nivel]}</span>}
    </span>
  );
}

/* ---------- Leyenda de mapa ---------- */

export function LeyendaMapa({
  escala,
  minimo,
  maximo,
  titulo,
  sinDato,
}: {
  escala: string[];
  minimo: string;
  maximo: string;
  titulo: string;
  /** Texto de la fila "sin dato" (cuadrito gris). Se omite si no se entrega. */
  sinDato?: string;
}) {
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-[10px] border border-tv-borde bg-tv-superficie/95 px-3 py-2 text-[11px] text-tv-tinta-suave backdrop-blur">
      <p className="mb-1 font-semibold text-tv-tinta">{titulo}</p>
      <div className="flex h-2 w-36 overflow-hidden rounded-sm">
        {escala.map((c) => (
          <span key={c} className="flex-1" style={{ background: c }} />
        ))}
      </div>
      <div className="mt-0.5 flex justify-between">
        <span className="tabular">{minimo}</span>
        <span className="tabular">{maximo}</span>
      </div>
      {sinDato && (
        <div className="mt-1 flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-[2px] bg-tv-sin-dato ring-1 ring-tv-borde" />
          <span>{sinDato}</span>
        </div>
      )}
    </div>
  );
}

/* ---------- Detalle de un registro ---------- */

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-tv-borde/70 py-1.5 text-sm last:border-b-0">
      <dt className="shrink-0 text-tv-tinta-suave">{etiqueta}</dt>
      <dd className={`text-right ${valor ? "font-medium text-tv-tinta" : "text-tv-tinta-suave"}`}>{valor || "—"}</dd>
    </div>
  );
}

const TEXTO_PRECISION: Record<TipoPrecision, string> = {
  numero: "calle y número",
  calle: "calle (sin número)",
  diccionario: "lugar conocido",
  ninguna: "no se pudo ubicar",
};

export function DetalleRegistro({ r, compacto = false }: { r: RegistroProcesado; compacto?: boolean }) {
  const e = r.estructurada;
  const campos: Array<[string, string]> = [
    ["Calle", e.calle],
    ["Número", e.numero],
    ["Población o villa", e.poblacion_o_villa],
    ["Comunidad", e.comunidad],
    ["Camino y km", e.camino_y_km],
    ["Referencia", e.referencia],
    ["Rural", e.es_rural ? "sí" : ""],
    ["Observaciones", e.observaciones],
  ];
  const conValor = campos.filter(([, valor]) => Boolean(valor));
  const ubicado = r.tipo_precision !== "ninguna";
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[13px] text-tv-tinta-suave">Dirección original</p>
        <p className="text-[20px] font-semibold leading-7 tracking-tight md:text-[22px]">{r.direccion_original}</p>
      </div>

      {compacto ? (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <ConfianzaBadge nivel={r.confianza} />
          <span className="text-tv-tinta-suave">{r.motivo}</span>
        </div>
      ) : (
        <div className="grid gap-3 rounded-[10px] bg-tv-fondo p-3 sm:grid-cols-2">
          {r.uv_nombre && (
            <div>
              <p className="text-[12px] text-tv-tinta-suave">Unidad vecinal</p>
              <p className="text-base font-semibold leading-tight">{formatearNombreUV(r.uv_nombre)}</p>
            </div>
          )}
          {r.macrosector && (
            <div>
              <p className="text-[12px] text-tv-tinta-suave">Macrosector</p>
              <p className="text-base font-semibold leading-tight">{r.macrosector}</p>
            </div>
          )}
          <div>
            <p className="mb-1 text-[12px] text-tv-tinta-suave">Confianza</p>
            <ConfianzaBadge nivel={r.confianza} detalle />
          </div>
          {ubicado && (
            <div>
              <p className="text-[12px] text-tv-tinta-suave">Ubicado por</p>
              <p className="text-sm font-medium">{TEXTO_PRECISION[r.tipo_precision]}</p>
            </div>
          )}
          <div className="sm:col-span-2">
            <p className="text-[12px] text-tv-tinta-suave">Motivo</p>
            <p className="text-sm">{r.motivo}</p>
          </div>
        </div>
      )}

      <details>
        <summary className="cursor-pointer text-[13px] font-medium text-tv-araucaria">Ver cómo se interpretó</summary>
        <div className="mt-2">
          <p className="mb-1 text-[13px] text-tv-tinta-suave">Dirección interpretada</p>
          {conValor.length > 0 ? (
            <dl>
              {conValor.map(([etiqueta, valor]) => (
                <Campo key={etiqueta} etiqueta={etiqueta} valor={valor} />
              ))}
            </dl>
          ) : (
            <p className="text-sm text-tv-tinta-suave">No se reconocieron partes de la dirección.</p>
          )}
        </div>
      </details>

      <p className="text-[12px] text-tv-tinta-suave">
        {r.fuente_interpretacion === "llm"
          ? "Interpretado con modelo de lenguaje."
          : "Interpretado con reglas locales, sin modelo de lenguaje."}
      </p>
    </div>
  );
}
