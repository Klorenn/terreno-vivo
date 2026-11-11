import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ACIERTO_GENERICO, ACIERTO_SISTEMA } from "@/app/benchmark/resumen";
import { BotonArriba, IndiceMovil } from "@/components/documentacion-cliente";
import { ConfianzaBadge, Encabezado, Pagina } from "@/components/ui";
import type { Confianza } from "@/domain/tipos";

export const metadata: Metadata = { title: "Documentación · Territorio Vivo" };

/* ---------- Contenido editable ---------- */

/**
 * Fuentes de datos. `pendiente: true` marca lo que el municipio todavía debe validar
 * (detalle y método en docs/datos.md).
 */
const FUENTES: ReadonlyArray<{ dato: string; fuente: string; pendiente: boolean }> = [
  {
    dato: "Unidades vecinales (límites y nombres)",
    fuente: "36 UV de Temuco. Capa del Registro Social de Hogares, MIDESOF/BIDAT, junio 2026 (CC BY 4.0). Es referencial: falta la confirmación del municipio.",
    pendiente: true,
  },
  {
    dato: "Macrosectores",
    fuente: "11 macrosectores (10 urbanos y uno rural) armados a partir de la Tabla 1 del PLADECO Temuco 2020-2024, que asigna cada UV a su macrosector.",
    pendiente: false,
  },
  {
    dato: "Población por UV",
    fuente: "Censo 2024 (INE), sumada por manzana y entidad rural a la UV que contiene cada una. 99,9 % de los habitantes quedó asignado.",
    pendiente: false,
  },
  {
    dato: "Diccionario territorial",
    fuente: "Más de 500 lugares (poblaciones, villas, comunidades indígenas, caminos e hitos) tomados de OpenStreetMap y del Censo 2024. Los nombres informales los debe revisar alguien que conozca el territorio.",
    pendiente: true,
  },
  { dato: "Ubicación de calles y números", fuente: "OpenStreetMap, a través del servicio Nominatim.", pendiente: false },
  { dato: "Mapa base", fuente: "© colaboradores de OpenStreetMap (ODbL).", pendiente: false },
];

const SECCIONES = [
  { id: "que-es", titulo: "Qué es Territorio Vivo" },
  { id: "para-que-sirve", titulo: "Para qué sirve" },
  { id: "como-se-usa", titulo: "Cómo se usa, paso a paso" },
  { id: "confianza", titulo: "Niveles de confianza" },
  { id: "como-aprende", titulo: "Cómo aprende el sistema" },
  { id: "datos-y-fuentes", titulo: "Datos y fuentes" },
  { id: "privacidad", titulo: "Privacidad y uso responsable" },
  { id: "preguntas-frecuentes", titulo: "Preguntas frecuentes" },
  { id: "proximas-etapas", titulo: "Próximas etapas" },
  { id: "creditos", titulo: "Créditos" },
] as const;

type IdSeccion = (typeof SECCIONES)[number]["id"];

const PANTALLAS: ReadonlyArray<{
  id: string;
  nombre: string;
  href: string;
  ve: ReactNode;
  pasos: ReactNode[];
  resultado: ReactNode;
}> = [
  {
    id: "pantalla-inicio",
    nombre: "Inicio",
    href: "/",
    ve: "Un mapa de Temuco y, encima, una ficha con un campo grande para escribir una dirección. Debajo hay direcciones de ejemplo.",
    pasos: [
      <>
        Escriba la dirección tal como la diría un vecino. Por ejemplo: <Ejemplo>pje los aromos 123 pob sta rosa</Ejemplo>.
      </>,
      <>
        Presione <B>Ubicar</B>. También puede tocar uno de los ejemplos.
      </>,
      "Espere unos segundos. La ubicación se consulta en un servicio externo que atiende una consulta por segundo.",
      <>
        Si quiere ver cómo se leyó cada parte de la dirección, abra <B>Ver cómo se interpretó</B>.
      </>,
      <>
        Si la confianza es baja, presione <B>Enviar a revisión</B>: el registro queda en la bandeja. Luego <B>Ir a revisarla</B> lo
        lleva a la Bandeja de revisión.
      </>,
    ],
    resultado: (
      <>
        Aparece una ficha con la unidad vecinal (UV), el macrosector, el nivel de confianza, cómo se ubicó y el motivo. El punto se
        marca en el mapa con el color de la confianza y la UV se ilumina. Si la confianza es baja, no se asigna UV.
      </>
    ),
  },
  {
    id: "pantalla-lote",
    nombre: "Resultados por lote",
    href: "/lote",
    ve: "Tres pasos (elegir archivo, procesar planilla, revisar y descargar), un botón para elegir archivo y dos planillas de ejemplo: 30 y 300 registros.",
    pasos: [
      <>
        Prepare un archivo CSV o Excel con el formato que se indica más abajo. <B>No incluya nombres, RUT ni teléfonos.</B>
      </>,
      <>
        Presione <B>Elegir archivo</B>, o junto a <B>Usar ejemplo</B> elija <B>30 registros</B> o <B>300 registros</B>. Verá el
        nombre del archivo y la cantidad de registros.
      </>,
      <>
        Presione <B>Procesar planilla</B>. Una barra muestra el avance y el tiempo que falta: se procesa aproximadamente 1 registro
        por segundo, así que la planilla de 300 tarda unos 5 minutos. Si necesita detenerlo, presione <B>Cancelar</B>; se guardan
        los registros ya procesados.
      </>,
      <>
        Revise el resumen: <B>Total</B>, <B>Asignados</B> (alta), <B>Aproximados</B> (media) y <B>Revisión</B> (baja). Al tocar
        uno, la tabla muestra solo esos registros.
      </>,
      <>
        Presione <B>Descargar CSV</B> para guardar los resultados, o <B>Ir a la bandeja de revisión</B> para resolver los dudosos.
      </>,
      <>
        Con la planilla cargada, <B>Volver a procesar</B> la procesa de nuevo, por ejemplo después de corregir registros en la
        bandeja.
      </>,
    ],
    resultado:
      "Una tabla con la dirección original, cómo se leyó, la UV, el macrosector, la confianza y el motivo de cada registro. Al procesar un lote nuevo, este reemplaza al anterior.",
  },
  {
    id: "pantalla-revision",
    nombre: "Bandeja de revisión",
    href: "/revision",
    ve: "La lista de registros pendientes (confianza baja que nadie ha corregido), un mapa para elegir la UV y el detalle del registro. Arriba, el número de correcciones guardadas.",
    pasos: [
      "Elija un registro de la lista. La etiqueta corta («Sin ubicar» o «Parcial») indica el tipo de problema; el motivo completo aparece en la ficha del registro, debajo del mapa.",
      <>
        Haga clic en el mapa, sobre la UV que corresponde. Su nombre aparece en <B>UV elegida</B>.
      </>,
      <>
        Deje marcada la casilla <B>Recordar</B> si quiere que el sistema aprenda esa expresión. Desmárquela si fue un caso aislado.
      </>,
      <>
        Presione <B>Confirmar UV</B>.
      </>,
    ],
    resultado: (
      <>
        El registro pasa a confianza alta, con el motivo «Asignada manualmente por un funcionario», y sale de la lista. Si marcó{" "}
        <B>Recordar</B>, la próxima vez esa expresión se ubicará sola.
      </>
    ),
  },
  {
    id: "pantalla-mapa",
    nombre: "Mapa territorial",
    href: "/mapa",
    ve: "Las UV coloreadas según la cantidad de prestaciones asignadas, una leyenda y la lista de prestaciones por UV.",
    pasos: [
      "Procese antes un lote. Sin lote, la lista dice «Procese un lote para ver el mapa».",
      <>
        Si lo necesita, filtre por <B>Tipo de prestación</B> y por fechas (<B>Desde</B> y <B>Hasta</B>).
      </>,
      "Lea el mapa: un azul más oscuro significa más prestaciones.",
    ],
    resultado:
      "Ve en qué UV se concentran las prestaciones asignadas (confianza alta, media o corregidas a mano). El mapa muestra totales por UV, nunca puntos individuales.",
  },
  {
    id: "pantalla-brechas",
    nombre: "Mapa de brechas",
    href: "/brechas",
    ve: "Las UV coloreadas por prestaciones cada 1.000 habitantes, las 5 UV de menor cobertura y una tabla con todas.",
    pasos: [
      "Procese antes un lote. Sin lote, no hay brechas que calcular.",
      "Lea el mapa: un color más intenso significa menor cobertura relativa.",
      "Revise la lista de las 5 UV de menor cobertura y la tabla completa.",
    ],
    resultado:
      "Sabe dónde mirar primero. No reemplaza el criterio de los equipos municipales: una UV con pocas prestaciones puede tener menos necesidad, no menos cobertura. La población viene del Censo 2024.",
  },
  {
    id: "pantalla-resultados-medidos",
    nombre: "Resultados medidos",
    href: "/benchmark",
    ve: "La comparación de Territorio Vivo con un buscador de mapas genérico, sobre las mismas 100 direcciones difíciles. En computador está en el menú lateral; en celular, en el pie de página.",
    pasos: [
      <>
        Lea las tres cifras principales: <B>Acierto</B>, <B>Derivadas a revisión</B> y <B>Error silencioso</B>.
      </>,
      "Revise el acierto por categoría: urbana limpia, urbana con errores de tipeo, población o villa, y rural o por referencia.",
    ],
    resultado: (
      <>
        Conoce cuánto acierta el sistema y cuánto se equivoca sin avisar. En la última medición:{" "}
        <span className="tabular font-semibold">{ACIERTO_SISTEMA} %</span> de acierto frente a{" "}
        <span className="tabular font-semibold">{ACIERTO_GENERICO} %</span> del genérico.
      </>
    ),
  },
];

const NIVELES: ReadonlyArray<{ nivel: Confianza; cuando: string; sistema: string; usted: string }> = [
  {
    nivel: "alta",
    cuando: "Calle y número ubicados dentro de la comuna, o un lugar del diccionario que pertenece a una sola UV.",
    sistema: "Asigna la UV.",
    usted: "Nada. Puede usar el resultado.",
  },
  {
    nivel: "media",
    cuando:
      "Una calle con nombre propio sin número, o una calle sin número confirmada por una población o villa del diccionario.",
    sistema: "Asigna la UV y la marca como aproximada.",
    usted: "Tómelo como orientación. Revise el motivo si el caso es importante.",
  },
  {
    nivel: "baja",
    cuando:
      "Solo referencias vagas, coincidencia parcial, resultados contradictorios, un lugar desconocido, un punto fuera de la comuna, un lugar del diccionario que abarca más de una UV, o un pasaje sin número sin un lugar que lo confirme.",
    sistema: "No asigna UV. Envía el registro a la bandeja de revisión.",
    usted: "Elija la UV correcta en la bandeja de revisión y confirme.",
  },
];

const PREGUNTAS: ReadonlyArray<{ pregunta: string; respuesta: ReactNode }> = [
  {
    pregunta: "¿Qué pasa si el sistema se equivoca?",
    respuesta: (
      <>
        Está diseñado para dudar antes que equivocarse: lo incierto va a revisión en vez de asignarse. Aun así puede haber errores
        silenciosos, es decir, asignaciones con confianza alta o media a una UV incorrecta. La pantalla{" "}
        <Link href="/benchmark" className="text-tv-araucaria underline underline-offset-2">
          Resultados medidos
        </Link>{" "}
        los mide e informa. Las asignaciones aproximadas (media) deben tomarse como orientación.
      </>
    ),
  },
  {
    pregunta: "¿Dónde quedan mis datos?",
    respuesta:
      "Los resultados y las correcciones quedan solo en su navegador, en este equipo. No hay base de datos ni cuenta de usuario. Si borra los datos del sitio, se pierden.",
  },
  {
    pregunta: "¿Funciona sin internet?",
    respuesta:
      "No del todo. El mapa base y la ubicación de direcciones necesitan internet. Lo que corre en el navegador sí funciona sin conexión: lectura de la planilla, tablas, filtros, correcciones y resultados ya guardados.",
  },
  {
    pregunta: "¿Qué pasa si cierro la ventana?",
    respuesta: "El último lote y las correcciones siguen en el navegador al volver a abrir. Procesar un lote nuevo reemplaza el anterior.",
  },
  {
    pregunta: "¿Puedo usarlo con datos reales?",
    respuesta:
      "Todavía no con prestaciones reales. Los límites de UV son referenciales y deben validarse con el municipio, y cargar prestaciones reales requiere evaluar la normativa chilena de protección de datos personales.",
  },
];

/* ---------- Piezas de presentación ---------- */

function B({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-tv-tinta">{children}</strong>;
}

function Ejemplo({ children }: { children: ReactNode }) {
  return <code className="rounded bg-tv-fondo px-1 py-px font-sans text-[14px] text-tv-tinta">{children}</code>;
}

function Seccion({ id, titulo, children }: { id: IdSeccion; titulo: string; children: ReactNode }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titulo`}
      className="scroll-mt-[calc(var(--tv-alto-banner)+7.5rem)] border-t border-tv-borde pt-8 pb-2 first:border-t-0 first:pt-0 md:scroll-mt-[calc(var(--tv-alto-banner)+4.5rem)] lg:scroll-mt-[calc(var(--tv-alto-banner)+1.5rem)]"
    >
      <h2 id={`${id}-titulo`} className="text-[22px] font-bold leading-7 tracking-[-0.01em]">
        {titulo}
      </h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

function Parrafo({ children }: { children: ReactNode }) {
  return <p className="max-w-[68ch]">{children}</p>;
}

function Subtitulo({ children }: { children: ReactNode }) {
  return <h4 className="text-[13px] font-semibold text-tv-tinta-suave">{children}</h4>;
}

/*
 * ui.tsx es un módulo de cliente: desde un componente de servidor sus componentes funcionan,
 * pero sus constantes (CLASES_BOTON) llegan como referencia y no como texto. Se replican aquí.
 */
const BOTON_BASE = "inline-flex items-center justify-center gap-2 rounded-[10px] text-sm font-semibold transition-colors";
const BOTON_SUTIL = `${BOTON_BASE} h-9 px-3 text-tv-araucaria hover:bg-tv-araucaria/10`;
const BOTON_SECUNDARIO = `${BOTON_BASE} h-10 px-5 border border-tv-borde bg-tv-superficie text-tv-tinta hover:border-tv-tinta`;

const CLASE_ENLACE = "font-medium text-tv-araucaria underline underline-offset-2 hover:no-underline";

/* ---------- Página ---------- */

export default function PaginaDocumentacion() {
  return (
    <Pagina>
      <Encabezado
        titulo="Documentación"
        descripcion="Qué es Territorio Vivo, para qué sirve y cómo se usa cada pantalla. No requiere conocimientos técnicos."
      />

      {/* Índice móvil: plegable y pegajoso bajo la barra superior (fuera del grid para que el sticky abarque toda la página) */}
      <div className="mt-4 lg:hidden">
        <IndiceMovil secciones={SECCIONES} />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        {/* Índice de escritorio: pegajoso a la izquierda */}
        <nav aria-label="Contenido de la documentación" className="hidden lg:sticky lg:top-12 lg:block lg:self-start">
          <p className="mb-2 text-[13px] font-semibold text-tv-tinta-suave">En esta página</p>
          <ol className="grid grid-cols-1 text-[14px]">
            {SECCIONES.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex min-h-9 items-center gap-2.5 rounded-lg px-2 py-1.5 text-tv-tinta-suave transition-colors hover:bg-tv-superficie hover:text-tv-tinta"
                >
                  <span className="tabular w-5 shrink-0 text-right text-[12px] text-tv-tinta-suave/80">{i + 1}</span>
                  {s.titulo}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="min-w-0 space-y-8 text-[15px] leading-[22px] text-tv-tinta">
          <Seccion id="que-es" titulo="Qué es Territorio Vivo">
            <Parrafo>
              Territorio Vivo recibe direcciones escritas como las escribe la gente y las asigna a su unidad vecinal (UV) y
              macrosector. Indica qué tan segura es cada asignación. Lo dudoso no se asigna: va a una bandeja de revisión.
            </Parrafo>
            <Parrafo>
              Es un prototipo con datos abiertos reales; los límites de las UV son referenciales hasta que el municipio los
              confirme. Un aviso amarillo lo recuerda en todas las pantallas.
            </Parrafo>
          </Seccion>

          <Seccion id="para-que-sirve" titulo="Para qué sirve">
            <Parrafo>
              Las prestaciones municipales se registran con direcciones en texto libre: abreviaturas, errores de tipeo y referencias
              como «frente a la escuela». Asignarlas a una UV se hace a mano o no se hace.
            </Parrafo>
            <ul className="max-w-[68ch] list-disc space-y-2 pl-5 marker:text-tv-araucaria">
              <li>
                <B>Ordenar el territorio.</B> Cada prestación queda en su UV y macrosector, con un nivel de confianza y un motivo.
              </li>
              <li>
                <B>Evitar errores silenciosos.</B> Es preferible enviar un caso a revisión que asignarlo mal.
              </li>
              <li>
                <B>Ver dónde falta.</B> Los mapas responden con datos a la pregunta «¿a qué sectores estamos llegando menos?».
              </li>
            </ul>
          </Seccion>

          <Seccion id="como-se-usa" titulo="Cómo se usa, paso a paso">
            <Parrafo>
              Son seis pantallas. Puede recorrerlas en este orden. Para que los mapas tengan datos, primero procese un lote.
            </Parrafo>

            <ol className="space-y-0">
              {PANTALLAS.map((p, i) => (
                <li key={p.id} id={p.id} className="relative grid scroll-mt-[calc(var(--tv-alto-banner)+4.5rem)] grid-cols-[32px_minmax(0,1fr)] gap-x-4 pb-8 last:pb-0 md:scroll-mt-[calc(var(--tv-alto-banner)+1.5rem)]">
                  {/* Línea vertical que une los pasos */}
                  {i < PANTALLAS.length - 1 && (
                    <span aria-hidden="true" className="absolute top-9 bottom-1 left-[15px] w-px bg-tv-borde" />
                  )}
                  <span
                    aria-hidden="true"
                    className="tabular relative flex h-8 w-8 items-center justify-center rounded-full bg-tv-tinta text-[14px] font-bold text-white"
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[18px] font-bold leading-8">
                      <span className="sr-only">Pantalla {i + 1}: </span>
                      {p.nombre}
                    </h3>
                    <div className="mt-2 max-w-[68ch] space-y-3">
                      <div>
                        <Subtitulo>Qué ve</Subtitulo>
                        <p className="mt-0.5">{p.ve}</p>
                      </div>
                      <div>
                        <Subtitulo>Qué hace</Subtitulo>
                        <ol className="mt-1 list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-tv-tinta-suave">
                          {p.pasos.map((paso, j) => (
                            <li key={j} className="pl-1">
                              {paso}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="rounded-[10px] border-l-2 border-tv-araucaria bg-tv-superficie py-2.5 pr-3 pl-3.5">
                        <Subtitulo>Resultado esperado</Subtitulo>
                        <p className="mt-0.5">{p.resultado}</p>
                      </div>

                      {p.id === "pantalla-lote" && <FormatoArchivo />}

                      <Link href={p.href} className={`${BOTON_SUTIL} -ml-3`}>
                        Ir a esta pantalla
                        <span aria-hidden="true">→</span>
                        <span className="sr-only">: {p.nombre}</span>
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Seccion>

          <Seccion id="confianza" titulo="Qué significa cada nivel de confianza">
            <Parrafo>
              Cada resultado trae un nivel de confianza y un <B>motivo</B> que explica, en una frase, por qué quedó en ese nivel.
            </Parrafo>
            <div className="overflow-hidden rounded-xl border border-tv-borde bg-tv-superficie">
              <table className="w-full text-left text-[14px] leading-5 max-md:block">
                <thead className="text-[12px] text-tv-tinta-suave max-md:hidden">
                  <tr className="border-b border-tv-borde">
                    <th scope="col" className="py-2.5 pr-3 pl-4 font-medium">
                      Nivel
                    </th>
                    <th scope="col" className="py-2.5 pr-3 font-medium">
                      Cuándo ocurre
                    </th>
                    <th scope="col" className="py-2.5 pr-3 font-medium">
                      Qué hace el sistema
                    </th>
                    <th scope="col" className="py-2.5 pr-4 font-medium">
                      Qué debe hacer usted
                    </th>
                  </tr>
                </thead>
                <tbody className="max-md:block">
                  {NIVELES.map((n) => (
                    <tr
                      key={n.nivel}
                      className="border-t border-tv-borde/70 align-top first:border-t-0 max-md:block max-md:space-y-2 max-md:px-4 max-md:py-3.5"
                    >
                      <th scope="row" className="py-3 pr-3 pl-4 font-normal max-md:block max-md:p-0">
                        <ConfianzaBadge nivel={n.nivel} detalle />
                      </th>
                      <CeldaNivel etiqueta="Cuándo ocurre">{n.cuando}</CeldaNivel>
                      <CeldaNivel etiqueta="Qué hace el sistema" destacado>
                        {n.sistema}
                      </CeldaNivel>
                      <CeldaNivel etiqueta="Qué debe hacer usted" ultima>
                        {n.usted}
                      </CeldaNivel>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Parrafo>
              En resumen: <B>alta y media se asignan; baja va a revisión.</B> Los mapas cuentan solo los registros asignados.
            </Parrafo>
            <Parrafo>
              Dos reglas son más estrictas que las del SOW (sección 6.4): los lugares que abarcan varias UV y los pasajes sin número van
              a revisión en lugar de quedar como aproximados. Hay pasajes con el mismo nombre en muchas villas, y un lugar repartido en
              varias UV no permite elegir una sola. Con esto, el error silencioso bajó de 10 % a 5 % sobre la capa real.
            </Parrafo>
          </Seccion>

          <Seccion id="como-aprende" titulo="Cómo aprende el sistema">
            <Parrafo>
              El sistema usa un <B>diccionario territorial</B>: una lista de nombres de poblaciones, villas, hitos, caminos y
              comunidades, cada uno con su UV. Así entiende lugares que no aparecen en los mapas comunes.
            </Parrafo>
            <ol className="max-w-[68ch] list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-tv-tinta-suave">
              <li className="pl-1">Un funcionario corrige un registro en la bandeja de revisión.</li>
              <li className="pl-1">
                Si deja marcada la casilla <B>Recordar</B>, la expresión se guarda en el diccionario con la UV elegida.
              </li>
              <li className="pl-1">La próxima vez que aparezca esa expresión, el sistema la ubica solo.</li>
            </ol>
            <Parrafo>
              Con el uso, el diccionario crece y se vuelve un <B>activo del municipio</B>: conocimiento del territorio que antes
              estaba solo en la memoria de las personas.
            </Parrafo>
            <Parrafo>
              En la bandeja de revisión, <B>Descargar lugares aprendidos</B> entrega un archivo con el diccionario completo (lugares
              iniciales y aprendidos) para compartirlo o respaldarlo. <B>Borrar correcciones</B> elimina las correcciones guardadas en
              este navegador; pide confirmación y no se puede deshacer.
            </Parrafo>
          </Seccion>

          <Seccion id="datos-y-fuentes" titulo="Datos y fuentes">
            <Parrafo>El prototipo usa datos abiertos reales. Estas son las fuentes de cada dato:</Parrafo>
            <dl className="max-w-[68ch] divide-y divide-tv-borde/70 border-y border-tv-borde">
              {FUENTES.map((f) => (
                <div key={f.dato} className="grid gap-1 py-2.5 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:gap-4">
                  <dt className="font-semibold">{f.dato}</dt>
                  <dd className="text-tv-tinta-suave">
                    {f.pendiente && (
                      <span className="mr-1.5 inline-flex rounded-full bg-tv-aviso/40 px-2 py-px text-[12px] font-semibold text-tv-tinta">
                        Por validar
                      </span>
                    )}
                    {f.fuente}
                  </dd>
                </div>
              ))}
            </dl>
            <Parrafo>
              Cuando el municipio entregue su capa oficial de UV y su listado de lugares, reemplazan a estas fuentes sin cambiar la
              forma de usar la aplicación.
            </Parrafo>
          </Seccion>

          <Seccion id="privacidad" titulo="Privacidad y uso responsable">
            <ul className="max-w-[68ch] list-disc space-y-2 pl-5 marker:text-tv-araucaria">
              <li>
                <B>No cargue datos personales.</B> Quite nombres, RUT y teléfonos antes de subir una planilla.
              </li>
              <li>Solo se procesan tres datos: dirección, tipo de prestación y fecha.</li>
              <li>
                Para ubicar cada dirección, el servidor de la aplicación la consulta en OpenStreetMap (servicio Nominatim). Si hay un
                modelo de lenguaje configurado, el texto de la dirección también se envía a ese modelo.
              </li>
              <li>Los resultados y las correcciones se guardan solo en este navegador. No hay base de datos ni cuenta de usuario.</li>
              <li>Los mapas muestran totales por UV, nunca puntos de personas.</li>
              <li>
                El mapa de brechas indica dónde mirar. No reemplaza el criterio de los equipos municipales.
              </li>
            </ul>
          </Seccion>

          <Seccion id="preguntas-frecuentes" titulo="Preguntas frecuentes">
            <div className="max-w-[68ch] divide-y divide-tv-borde/70 border-y border-tv-borde">
              {PREGUNTAS.map((p) => (
                <details key={p.pregunta} className="group py-1">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-1.5 font-semibold [&::-webkit-details-marker]:hidden">
                    {p.pregunta}
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-[18px] leading-none text-tv-tinta-suave transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="pb-3 text-tv-tinta-suave">{p.respuesta}</p>
                </details>
              ))}
            </div>
          </Seccion>

          <Seccion id="proximas-etapas" titulo="Próximas etapas">
            <ul className="max-w-[68ch] list-disc space-y-2 pl-5">
              <li className="pl-1">
                <B>Consultas en lenguaje natural</B> (componente opcional 5 del SOW): preguntar, por ejemplo, «¿cuántas ayudas sociales
                hubo en Amanecer este año?» y obtener la respuesta sobre los datos asignados.
              </li>
              <li className="pl-1">
                <B>Validación de las capas con el municipio:</B> reemplazar los límites referenciales de UV y macrosectores por la capa
                oficial.
              </li>
              <li className="pl-1">
                <B>Despliegue con URL pública</B> para el piloto.
              </li>
            </ul>
          </Seccion>

          <Seccion id="creditos" titulo="Créditos">
            <Parrafo>Proyecto para la Municipalidad de Temuco · Innova TemucoLab 2026.</Parrafo>
            <Parrafo>
              <a
                href="https://www.figma.com/design/elRdhO6kK4b3cr881FAq6d"
                target="_blank"
                rel="noopener noreferrer"
                className={CLASE_ENLACE}
              >
                Diseño de interfaz
              </a>{" "}
              (Figma).
            </Parrafo>
            <Parrafo>Mapa base © colaboradores de OpenStreetMap.</Parrafo>
          </Seccion>
        </article>
      </div>
      <BotonArriba />
    </Pagina>
  );
}

function CeldaNivel({
  etiqueta,
  children,
  destacado = false,
  ultima = false,
}: {
  etiqueta: string;
  children: ReactNode;
  destacado?: boolean;
  ultima?: boolean;
}) {
  return (
    <td className={`py-3 ${ultima ? "pr-4" : "pr-3"} ${destacado ? "font-semibold" : ""} max-md:block max-md:p-0`}>
      <span className="block text-[12px] font-normal text-tv-tinta-suave md:hidden">{etiqueta}</span>
      {children}
    </td>
  );
}

function FormatoArchivo() {
  return (
    <div className="rounded-[10px] border border-tv-borde bg-tv-superficie p-3.5">
      <Subtitulo>Formato del archivo</Subtitulo>
      <ul className="mt-1.5 space-y-1">
        <li>
          <Ejemplo>direccion</Ejemplo> · obligatoria. Ejemplo: <Ejemplo>Avenida Alemania 0450, Temuco</Ejemplo>
        </li>
        <li>
          <Ejemplo>tipo_prestacion</Ejemplo> · opcional. Ejemplo: <Ejemplo>Subsidio de agua</Ejemplo>
        </li>
        <li>
          <Ejemplo>fecha</Ejemplo> · opcional, en formato AAAA-MM-DD. Ejemplo: <Ejemplo>2026-03-04</Ejemplo>
        </li>
      </ul>
      <p className="mt-2 text-[14px] text-tv-tinta-suave">Se acepta CSV o Excel (.xlsx, .xls; se lee la primera hoja).</p>
      <a href="/ejemplo-prestaciones.csv" download className={`${BOTON_SECUNDARIO} mt-3 w-full sm:w-auto`}>
        Descargar planilla de ejemplo (CSV)
      </a>
    </div>
  );
}
