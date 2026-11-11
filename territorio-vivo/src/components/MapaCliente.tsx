"use client";

import dynamic from "next/dynamic";

/** maplibre accede a window: solo en cliente. */
const MapaCliente = dynamic(() => import("./Mapa"), {
  ssr: false,
  loading: () => <div className="h-full min-h-[280px] w-full animate-pulse bg-tv-sin-dato" />,
});

export default MapaCliente;
