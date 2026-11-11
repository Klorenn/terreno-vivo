# Territorio Vivo: dirección visual

Prototipo para el desafío Innova TemucoLab 2026, construido para la Municipalidad de Temuco. No es el sitio oficial del municipio: el logo se usa como atribución ("proyecto para la Municipalidad de Temuco"), nunca como marca propia de la app.

**Archivo de Figma:** https://www.figma.com/design/elRdhO6kK4b3cr881FAq6d (páginas *Tokens*, *Desktop (1440)* y *Móvil (390)*; 6 pantallas por tamaño: Inicio, Resultado individual, Resultados por lote, Bandeja de revisión, Mapa territorial, Mapa de brechas). El mapa en Figma es un dibujo simulado, no tiles reales.

## Contexto que manda

- **Público:** funcionarios municipales (cargan planillas, revisan dudas) y directivos (miran mapas). Jurado del Demo Day el 26 de noviembre de 2026, mirando desde un enlace y en celular.
- **Trabajo principal de la interfaz:** que una dirección escrita "como la dice un vecino" se vea convertida en un lugar del territorio, con una confianza honesta. El mapa es el protagonista, no un adorno.
- **Restricción:** el banner amarillo de prototipo (hoy: datos abiertos con límites de UV referenciales) se mantiene siempre visible.

## Referencias consultadas

- **Pinterest:** bloquea la navegación automatizada (muro de login en cada búsqueda). No se pudo usar.
- **21st.dev:** categorías *Dashboards*, *Maps*, *Stats & KPIs*, *Tables*. Patrones que se tomaron: KPI en fila compacta sin tarjetas pesadas, mapa a pantalla completa con panel flotante, tablas con filas densas y badges de estado.
- **Dribbble** (búsqueda "civic dashboard map"): confirma la tendencia gov-tech actual: fondo claro, un solo acento institucional, mapa como hero, tipografía sans humanista. Se evitó el "kit SaaS" de tarjetas idénticas con sombra gris.
- **Logo oficial** (temuco.cl, campaña "Municipio Ciudadano"): degradado azul → verde → naranja. La paleta sale de ahí: verde para lo correcto, azul para lo territorial, naranja/rojo para las brechas.

## Paleta (tokens)

| Token | Hex | Uso |
|---|---|---|
| `--tv-fondo` | `#F2F5F1` | Fondo de página, con tinte verde frío (no es gris genérico ni crema) |
| `--tv-superficie` | `#FFFFFF` | Paneles, tablas, inputs |
| `--tv-tinta` | `#14211B` | Texto principal, botones primarios (verde-negro, no gris) |
| `--tv-tinta-suave` | `#5B6B62` | Texto secundario |
| `--tv-borde` | `#D9E0DA` | Bordes de 1px |
| `--tv-araucaria` | `#1F6F4A` | Acento institucional: enlaces, foco, UV seleccionada |
| `--tv-cautin` | `#2460A8` | Azul del río Cautín: escala del mapa territorial |
| `--tv-alta` | `#1F8A4C` | Confianza alta |
| `--tv-media` | `#C8780A` | Confianza media |
| `--tv-baja` | `#C2362B` | Confianza baja |
| `--tv-aviso` | `#F5C544` | Banner de prototipo |

Escalas del mapa (5 pasos, claro → intenso):

- **Territorial (cantidad):** `#DCE9F7 · #A9C6EA · #6E9AD3 · #3B6FB6 · #1F4A88`
- **Brechas (menor cobertura = más intenso):** `#FBE3D3 · #F5B98F · #EC8A52 · #D85A2B · #A3321A`
- **UV sin dato:** `#E6ECE7`

## Tipografía

- **Una sola familia: Public Sans** (Google Fonts, diseñada para servicios públicos de EE. UU., con cifras tabulares). Reemplaza a Geist, que leía como plantilla.
- Escala: 32/36 display (peso 700, tracking -0.02em), 22/28 título de sección, 15/22 cuerpo, 13/18 secundario, 12/16 tabla densa.
- Números de KPI y tablas con `font-variant-numeric: tabular-nums`.
- Sin etiquetas en mayúsculas sostenidas. Las etiquetas van en sentence case y color `--tv-tinta-suave`.

## Densidad y estructura

- **Desktop:** riel de navegación vertical a la izquierda (56 px con íconos; 220 px con texto desde `xl`). Contenido a ancho completo; el mapa ocupa el alto disponible (`calc(100dvh - banner)`).
- **Móvil:** barra de pestañas inferior con 5 destinos. El mapa va arriba y el detalle abajo como hoja. Botón primario de ancho completo.
- **Jerarquía por bordes, no por sombras.** Paneles con borde `--tv-borde` y radio 12 px. Solo el input principal y el botón primario tienen radio 10 px; los chips, 999.
- **KPI:** una fila con número grande (28 px, tabular) y etiqueta abajo, separados por línea vertical, sin tarjeta propia.
- **Tablas:** cabecera pegajosa, filas de 40 px, badge de confianza con punto de color a la izquierda.

## Estilo de mapas

- Base raster **OpenStreetMap muy atenuada** (`raster-saturation -0.85`, `raster-brightness-min 0.15`, `raster-contrast -0.15`, `raster-opacity 0.85`): casi en escala de grises para que los polígonos y los nombres de UV manden. Se probó CARTO `light_nolabels` pero hoy exige API key (marca de agua "API KEY REQUIRED"), así que se descartó.
- UV: relleno según escala con 45 % de opacidad por defecto; en Inicio baja a 18 % (prop `opacidadRelleno`) para que el punto y la UV resaltada manden. Borde en dos capas: halo blanco de 2 px debajo y línea `--tv-tinta-suave` de 0.8 px encima.
- Etiquetas de UV: 12 px, halo blanco de 2 px, interletrado 0.01 y ancho máximo de 8 em.
- Macrosector: línea punteada `--tv-tinta` de 1.5 px al 60 % de opacidad (trazo 4-3).
- UV seleccionada: borde `--tv-araucaria` 3 px. En Inicio el mapa se encuadra a la UV resaltada (`fitBounds`, zoom máximo 14.5, margen izquierdo de 580 px en desktop para no quedar bajo la ficha); si no hay UV, vuela al punto con zoom 14.
- Punto: círculo de 10 px con halo blanco de 3 px y color por confianza, más anillo exterior de 16 px al 25 % del mismo color.
- Leyenda compacta flotante abajo a la izquierda, dentro del mapa, con extremos numéricos (p. ej. 0 y el máximo) y una fila opcional "sin dato" con el cuadrito `--tv-sin-dato`.

## Lo memorable (un solo lugar donde gastar la audacia)

La pantalla de inicio: el campo de dirección es enorme (56 px de alto, borde 2 px tinta), sobre el mapa de Temuco que ocupa toda la vista. Al ubicar, el panel de resultado aparece como una ficha sobre el mapa y la UV se ilumina. Todo lo demás es sobrio.

## Voz

Español neutro, trato de usted, frases cortas: la herramienta la usan funcionarios de distintas edades y el jurado desde el celular. Botones con verbo: "Ubicar", "Procesar planilla", "Confirmar UV". Estados vacíos dicen qué hacer: "Procese un lote para ver el mapa". El lote muestra los tres pasos (elegir, procesar, revisar) y marca en cuál está el usuario.

## Pie de página

Presente en todas las pantallas (en Inicio, debajo del mapa), como una sola franja de 12 px de texto: a la izquierda el logo pequeño y "Proyecto para la Municipalidad de Temuco · Innova TemucoLab 2026"; a la derecha las advertencias en una línea ("UV: MIDESOF/BIDAT 2026 · Población: INE Censo 2024 · Macrosectores: PLADECO · Lugares y mapa base © OpenStreetMap · Sin datos personales · Resultados guardados solo en este navegador · Mapa base © colaboradores de OpenStreetMap"). Entre ambos, los íconos de las cuentas oficiales de la Municipalidad de Temuco (sitio web, Facebook, Instagram, X, YouTube) tomadas de los directorios de temuco.cl. En móvil se apila. La navegación vive solo en el riel y en las pestañas; el pie no repite enlaces. La comparación medida (`/benchmark`) aparece solo en el riel de escritorio: la barra móvil conserva cinco pestañas.
