import type { Metadata, Viewport } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { Banner, Navegacion, PiePagina } from "@/components/ui";

const publicSans = Public_Sans({ variable: "--font-public-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Territorio Vivo",
  description: "Asignación automática de prestaciones municipales a unidad vecinal y macrosector",
};

export const viewport: Viewport = {
  themeColor: "#f2f5f1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${publicSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-tv-fondo text-tv-tinta">
        <Banner />
        <div className="flex flex-1">
          <Navegacion />
          <div className="flex min-w-0 flex-1 flex-col pt-12 pb-[var(--tv-alto-pestanas)] md:pt-0 md:pb-0">
            <main className="flex-1">{children}</main>
            <PiePagina />
          </div>
        </div>
      </body>
    </html>
  );
}
