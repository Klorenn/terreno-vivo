"use client";

import { useEffect, useRef, useState } from "react";

/** Índice plegable para pantallas angostas (< lg). Se cierra al elegir una sección. */
export function IndiceMovil({ secciones }: { secciones: ReadonlyArray<{ id: string; titulo: string }> }) {
  const detalle = useRef<HTMLDetailsElement>(null);
  return (
    <details
      ref={detalle}
      className="group sticky top-[calc(var(--tv-alto-banner)+3rem)] z-20 -mx-4 border-b border-tv-borde bg-tv-superficie px-4 md:top-[var(--tv-alto-banner)] md:-mx-6 md:px-6 lg:hidden"
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-[14px] font-semibold text-tv-tinta [&::-webkit-details-marker]:hidden">
        En esta página
        <span aria-hidden className="transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <ol className="grid grid-cols-1 gap-x-4 pb-3 text-[14px] sm:grid-cols-2">
        {secciones.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={() => {
                if (detalle.current) detalle.current.open = false;
              }}
              className="flex min-h-10 items-center rounded-lg px-2 py-1.5 text-tv-tinta-suave transition-colors hover:bg-tv-fondo hover:text-tv-tinta"
            >
              {s.titulo}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}

/** Botón flotante para volver al inicio de la página; aparece tras 800 px de desplazamiento. */
export function BotonArriba() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const revisar = () => setVisible(window.scrollY > 800);
    revisar();
    window.addEventListener("scroll", revisar, { passive: true });
    return () => window.removeEventListener("scroll", revisar);
  }, []);
  if (!visible) return null;
  return (
    <button
      type="button"
      aria-label="Volver arriba"
      title="Volver arriba"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-20 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-tv-borde bg-tv-superficie text-tv-tinta shadow-[0_4px_16px_-6px_rgba(20,33,27,0.3)] transition-colors hover:border-tv-tinta md:bottom-6"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
