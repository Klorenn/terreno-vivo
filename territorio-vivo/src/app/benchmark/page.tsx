import type { Metadata } from "next";
import resultados from "../../../benchmark/resultados.json";
import { Aviso, Encabezado, Pagina, Tarjeta } from "@/components/ui";

export const metadata: Metadata = { title: "Resultados medidos · Territorio Vivo" };

interface Metrica {
  n: number;
  acierto: number;
  derivacion: number;
  error_silencioso: number;
}

interface Lado {
  total: Metrica;
  por_categoria: Record<string, Metrica>;
}

const NOMBRE_CATEGORIA: Record<string, string> = {
  urbana_limpia: "Urbana limpia",
  urbana_errores: "Urbana con errores de tipeo",
  poblacion_villa: "Población o villa",
  rural_referencia: "Rural o por referencia",
};

/** Explicación conocida cuando el sistema comete más error silencioso que el genérico en una categoría. */
const CAUSA_ERROR_MAYOR: Record<string, string> = {
  urbana_errores: "la corrección de tipeo a veces asigna a una calle equivocada",
};

type Veredicto = "mejor" | "igual" | "peor";

function comparar(sistema: number, generico: number, menorEsMejor: boolean): Veredicto {
  if (sistema === generico) return "igual";
  const gana = menorEsMejor ? sistema < generico : sistema > generico;
  return gana ? "mejor" : "peor";
}

const CLASE_VEREDICTO: Record<Veredicto, string> = {
  mejor: "bg-tv-araucaria/10 text-tv-araucaria",
  igual: "bg-tv-fondo text-tv-tinta-suave",
  peor: "bg-tv-baja/10 text-tv-baja",
};

function EtiquetaVeredicto({ nombre, veredicto, detalle }: { nombre: string; veredicto: Veredicto; detalle: string }) {
  return (
    <span className={`tabular inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${CLASE_VEREDICTO[veredicto]}`}>
      {nombre}: {veredicto}
      <span className="ml-1 font-normal opacity-80">({detalle})</span>
    </span>
  );
}

const COLOR_SISTEMA = "var(--color-tv-araucaria)";
const COLOR_GENERICO = "var(--color-tv-tinta-suave)";

/** "2026-11-11" → "11 de noviembre de 2026". Se fija la hora a mediodía UTC para no correr el día por zona horaria. */
function formatearFecha(iso: string): string {
  const fecha = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(fecha.getTime())) return iso;
  return new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(fecha);
}

function Barra({ valor, color }: { valor: number; color: string }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-tv-fondo">
      <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, valor))}%`, background: color }} />
    </div>
  );
}

function Comparacion({ titulo, sistema, generico }: { titulo: string; sistema: Metrica; generico: Metrica }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-medium">{titulo}</p>
        <p className="tabular text-[13px] text-tv-tinta-suave">{sistema.n} direcciones</p>
      </div>
      <div className="grid grid-cols-[88px_1fr_44px] items-center gap-x-3 gap-y-1.5 text-[13px]">
        <span>Territorio Vivo</span>
        <Barra valor={sistema.acierto} color={COLOR_SISTEMA} />
        <span className="tabular text-right font-semibold">{sistema.acierto}%</span>
        <span className="text-tv-tinta-suave">Genérico</span>
        <Barra valor={generico.acierto} color={COLOR_GENERICO} />
        <span className="tabular text-right text-tv-tinta-suave">{generico.acierto}%</span>
      </div>
    </div>
  );
}

export default function PaginaBenchmark() {
  const sistema = resultados.metricas.sistema as Lado;
  const generico = resultados.metricas.generico as Lado;
  const categorias = Object.keys(sistema.por_categoria);
  const fecha = formatearFecha(resultados.fecha);
  const debilidades = categorias.filter(
    (c) => sistema.por_categoria[c].error_silencioso > generico.por_categoria[c].error_silencioso,
  );
  const textoDebilidad =
    debilidades.length === 0
      ? "En ninguna categoría el sistema comete más error silencioso que el genérico."
      : `Debilidad: en ${debilidades
          .map((c) => {
            const nombre = (NOMBRE_CATEGORIA[c] ?? c).toLowerCase();
            const causa = CAUSA_ERROR_MAYOR[c];
            return `${nombre} el error silencioso es mayor que el del genérico (${sistema.por_categoria[c].error_silencioso} % frente a ${generico.por_categoria[c].error_silencioso} %)${causa ? `: ${causa}` : ""}`;
          })
          .join("; en ")}. Son asignaciones incorrectas que no avisan; por eso conviene revisar estos casos.`;
  const modo = resultados.interpretacion.includes("heurístico")
    ? "con reglas locales, sin modelo de lenguaje"
    : "con modelo de lenguaje";

  return (
    <Pagina className="space-y-5">
      <Encabezado
        titulo="Resultados medidos"
        descripcion={`Territorio Vivo frente a un buscador de mapas genérico. Medido el ${fecha} ${modo}. Las mismas 100 direcciones difíciles, en cuatro categorías de 25. Unidades vecinales reales (MIDESOF 2026, referenciales): las cifras se informan tal como salieron.`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Tarjeta titulo="Acierto">
          <p className="tabular text-[34px] font-bold leading-9 text-tv-araucaria">{sistema.total.acierto}%</p>
          <p className="mt-1 text-[13px] text-tv-tinta-suave">
            frente a <span className="tabular font-semibold text-tv-tinta">{generico.total.acierto}%</span> del genérico. Asignadas a la
            unidad vecinal correcta.
          </p>
        </Tarjeta>
        <Tarjeta titulo="Derivadas a revisión">
          <p className="tabular text-[34px] font-bold leading-9 text-tv-media">{sistema.total.derivacion}%</p>
          <p className="mt-1 text-[13px] text-tv-tinta-suave">
            frente a <span className="tabular font-semibold text-tv-tinta">{generico.total.derivacion}%</span> sin resultado en el
            genérico. Lo dudoso no se asigna: se revisa.
          </p>
        </Tarjeta>
        <Tarjeta titulo="Error silencioso">
          <p className="tabular text-[34px] font-bold leading-9 text-tv-baja">{sistema.total.error_silencioso}%</p>
          <p className="mt-1 text-[13px] text-tv-tinta-suave">
            frente a <span className="tabular font-semibold text-tv-tinta">{generico.total.error_silencioso}%</span> del genérico.
            Asignadas a una UV incorrecta con confianza alta o media: es la cifra que hay que bajar.
          </p>
        </Tarjeta>
      </div>

      <Tarjeta titulo="Acierto por categoría">
        <div className="grid gap-6 md:grid-cols-2">
          {categorias.map((c) => (
            <Comparacion
              key={c}
              titulo={NOMBRE_CATEGORIA[c] ?? c}
              sistema={sistema.por_categoria[c]}
              generico={generico.por_categoria[c]}
            />
          ))}
        </div>
      </Tarjeta>

      <Tarjeta titulo="Todas las métricas" className="hidden overflow-hidden sm:block">
        <div className="-m-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-[13px]">
            <thead className="bg-tv-superficie text-tv-tinta-suave shadow-[inset_0_-1px_0_var(--color-tv-borde)]">
              <tr>
                <th className="py-2 pl-4 text-left font-medium">Categoría</th>
                <th className="py-2 text-right font-medium">n</th>
                <th className="py-2 text-right font-medium">Acierto</th>
                <th className="py-2 text-right font-medium">Acierto genérico</th>
                <th className="py-2 text-right font-medium">A revisión</th>
                <th className="py-2 text-right font-medium">A revisión (genérico)</th>
                <th className="py-2 text-right font-medium">Error silencioso</th>
                <th className="py-2 pr-4 text-right font-medium">Error silencioso (genérico)</th>
              </tr>
            </thead>
            <tbody className="tabular">
              {[["total", "Total"] as const, ...categorias.map((c) => [c, NOMBRE_CATEGORIA[c] ?? c] as const)].map(([clave, nombre]) => {
                const s = clave === "total" ? sistema.total : sistema.por_categoria[clave];
                const g = clave === "total" ? generico.total : generico.por_categoria[clave];
                return (
                  <tr key={clave} className={`border-t border-tv-borde/70 ${clave === "total" ? "font-semibold" : ""}`}>
                    <td className="py-2 pl-4">{nombre}</td>
                    <td className="py-2 text-right">{s.n}</td>
                    <td className="py-2 text-right text-tv-araucaria">{s.acierto}%</td>
                    <td className="py-2 text-right text-tv-tinta-suave">{g.acierto}%</td>
                    <td className="py-2 text-right">{s.derivacion}%</td>
                    <td className="py-2 text-right text-tv-tinta-suave">{g.derivacion}%</td>
                    <td className="py-2 text-right">{s.error_silencioso}%</td>
                    <td className="py-2 pr-4 text-right text-tv-tinta-suave">{g.error_silencioso}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Tarjeta>

      <Tarjeta titulo="Lectura por categoría">
        <ul className="-my-1 text-[14px]">
          {categorias.map((c) => {
            const sc = sistema.por_categoria[c];
            const gc = generico.por_categoria[c];
            return (
              <li
                key={c}
                className="flex flex-col gap-1.5 border-b border-tv-borde/70 py-2.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium">{NOMBRE_CATEGORIA[c] ?? c}</span>
                <span className="flex flex-wrap gap-1.5">
                  <EtiquetaVeredicto
                    nombre="Acierto"
                    veredicto={comparar(sc.acierto, gc.acierto, false)}
                    detalle={`${sc.acierto} % frente a ${gc.acierto} %`}
                  />
                  <EtiquetaVeredicto
                    nombre="Error silencioso"
                    veredicto={comparar(sc.error_silencioso, gc.error_silencioso, true)}
                    detalle={`${sc.error_silencioso} % frente a ${gc.error_silencioso} %`}
                  />
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4">
          <Aviso tipo="info">{textoDebilidad}</Aviso>
        </div>
      </Tarjeta>

      <p className="text-[13px] text-tv-tinta-suave">
        Acierto: porcentaje asignado a la UV correcta. A revisión: porcentaje enviado a la bandeja (en el genérico, sin resultado). Error
        silencioso: porcentaje asignado a una UV incorrecta con confianza alta o media. El detalle caso por caso está disponible a pedido
        del equipo.
      </p>
    </Pagina>
  );
}
