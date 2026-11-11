# Territorio Vivo

Territorio Vivo recibe prestaciones municipales con direcciones escritas como las escribe la gente ("pje los aromos 123 pob sta rosa") y las asigna a su unidad vecinal (UV) y macrosector.
Indica qué tan segura es cada asignación (alta, media o baja) y deriva las dudosas a una bandeja de revisión.
Cada corrección de un funcionario se guarda como alias y mejora las siguientes asignaciones.

Prototipo para el desafío Innova TemucoLab 2026, Municipalidad de Temuco. Demo Day: 26 de noviembre de 2026.

> **Estado del prototipo:** usa datos abiertos reales (36 UV de MIDESOF 2026, población del Censo 2024, macrosectores del PLADECO, más de 500 lugares de OpenStreetMap e INE). Los límites de UV son referenciales hasta que el municipio los confirme; la interfaz lo avisa con un banner permanente. Detalle y método en [docs/datos.md](docs/datos.md).

## Para quién

- **Funcionarios municipales:** cargan planillas de prestaciones y resuelven los casos dudosos.
- **Directivos:** miran en qué UV se concentran las prestaciones y dónde hay menor cobertura.
- **Jurado y equipo técnico:** evalúan el método y la medición.

## Qué problema resuelve

Las prestaciones se registran con direcciones en texto libre: abreviaturas, errores de tipeo, referencias ("frente a la escuela"), caminos rurales. Asignarlas a una UV se hace a mano o no se hace.
Sin esa asignación, el municipio no puede responder con datos a la pregunta "¿a qué sectores estamos llegando menos?".

Principio de diseño: es preferible derivar un caso a revisión que asignarlo mal.

## Las 5 pantallas

| Pantalla | Ruta | Qué hace |
|---|---|---|
| Inicio | `/` | Se escribe una dirección y se obtiene su UV, macrosector, confianza y punto en el mapa. |
| Resultados por lote | `/lote` | Se sube una planilla CSV o Excel, se procesa y se revisa la tabla filtrable por confianza; permite descargar el CSV. |
| Bandeja de revisión | `/revision` | Lista los registros de confianza baja; el funcionario elige la UV en el mapa y puede guardar el alias. |
| Mapa territorial | `/mapa` | Colorea las UV por cantidad de prestaciones, con filtro por tipo y período. |
| Mapa de brechas | `/brechas` | Colorea las UV por prestaciones cada 1.000 habitantes y lista las 5 de menor cobertura. |

Guía paso a paso para el funcionario: [docs/guia-de-uso.md](docs/guia-de-uso.md). Reglas de confianza (y su desviación respecto del SOW): [docs/reglas-de-confianza.md](docs/reglas-de-confianza.md).

## Cómo correrlo

Requisitos: Node.js y pnpm.

```bash
pnpm install
pnpm dev
```

Abra http://localhost:3000.

**Modelo de lenguaje (opcional).** Para interpretar direcciones con el modelo de lenguaje, cree un archivo `.env.local` en la raíz del proyecto con la línea `ANTHROPIC_API_KEY=su_clave`.
Sin esa clave, o si el modelo falla, la aplicación usa un parser heurístico local y funciona igual (con menor capacidad para direcciones difíciles). La clave se usa solo en el servidor y no llega al navegador.

## Comandos

| Comando | Para qué sirve |
|---|---|
| `pnpm test` | Corre las pruebas automáticas (vitest). |
| `pnpm lint` | Revisa el estilo del código. |
| `pnpm tsc --noEmit` | Revisa los tipos de TypeScript. |
| `pnpm benchmark` | Corre el set de 100 direcciones contra el sistema y contra un geocodificador genérico; escribe `benchmark/informe.md` y `benchmark/resultados.json`. La primera corrida puede tardar varios minutos (Nominatim admite 1 consulta por segundo; luego usa caché). |
| `pnpm benchmark:generar` | Regenera `benchmark/set-100.csv` desde `benchmark/definicion-set.ts`. |

Detalles de la medición: [benchmark/README.md](benchmark/README.md).

## Formato del CSV de entrada

| Columna | Obligatoria | Ejemplo |
|---|---|---|
| `direccion` | Sí | `Avenida Alemania 0450, Temuco` |
| `tipo_prestacion` | No | `Subsidio de agua` |
| `fecha` | No (formato AAAA-MM-DD) | `2026-03-04` |

También se acepta Excel (`.xlsx`, `.xls`; se lee la primera hoja). Archivo de ejemplo con 30 registros: [public/ejemplo-prestaciones.csv](public/ejemplo-prestaciones.csv). En la pantalla de lotes, el botón "Usar planilla de ejemplo" lo carga directamente.

```csv
direccion,tipo_prestacion,fecha
"Avenida Alemania 0450, Temuco",Subsidio de agua,2026-03-04
"Manuel Montt 1150, Temuco",Ayuda técnica,2026-03-11
```

## Privacidad

- **No cargue datos personales.** Solo se procesan dirección, tipo de prestación y fecha. Quite nombres, RUT y teléfonos antes de subir una planilla.
- Los resultados y las correcciones se guardan solo en el navegador del usuario (`localStorage`). No hay base de datos ni cuenta de usuario.
- Para ubicar una dirección, el servidor de la aplicación la consulta en Nominatim (OpenStreetMap), siempre. Si hay `ANTHROPIC_API_KEY`, el texto de la dirección también se envía al modelo de lenguaje. Esto debe informarse al municipio y evaluarse frente a la normativa chilena de protección de datos antes de usar datos reales.
- Los mapas de `/mapa` y `/brechas` muestran datos agregados por UV, no por punto.

## Datos

| Archivo | Contenido | Fuente |
|---|---|---|
| `src/data/uv.json` | 36 unidades vecinales de Temuco con población. | MIDESOF/BIDAT, capa RSH junio 2026 (CC BY 4.0, referencial); población INE Censo 2024. |
| `src/data/macrosectores.json` | 11 macrosectores (10 urbanos y uno rural). | Derivados de la Tabla 1 del PLADECO Temuco 2020-2024. |
| `src/data/diccionario.json` | Más de 500 lugares (poblaciones, villas, comunidades, caminos, hitos). | OpenStreetMap (ODbL) e INE Censo 2024; requiere validación territorial. |
| `src/data/calles.json` | Calles y avenidas principales para corregir errores de tipeo. | Equipo; revisar con el municipio. |
| `src/data/ejemplo-prestaciones.csv` | 30 prestaciones de ejemplo (copia en `public/`). | Ficticias. |

Cómo se construyeron y cómo regenerarlos: [docs/datos.md](docs/datos.md) y `benchmark/datos-reales/`. La capa oficial del municipio reemplaza a `uv.json` con el mismo formato GeoJSON (propiedades `id`, `nombre`, `macrosector`, `poblacion`).

## Diseño

- Figma: https://www.figma.com/design/elRdhO6kK4b3cr881FAq6d
- Decisiones visuales: [docs/diseno.md](docs/diseno.md)

## Estructura de carpetas

| Carpeta | Contenido |
|---|---|
| `src/app/` | Las 5 pantallas y las rutas del servidor (`api/interpretar`, `api/geocodificar`). |
| `src/components/` | Mapa, navegación, piezas de interfaz y colores. |
| `src/domain/` | Lógica pura con pruebas: normalización, parser heurístico, diccionario, cruce territorial, niveles de confianza. |
| `src/pipeline/` | Orquestación del procesamiento y lectura/escritura de planillas. |
| `src/servicios/` | Interpretación (modelo o heurístico) y geocodificación (Nominatim). |
| `src/store/` | Resultados y correcciones guardados en el navegador. |
| `src/data/` | Capas de UV y macrosectores, diccionario territorial, calles y planilla de ejemplo. |
| `benchmark/` | Set de 100 direcciones, script de medición e informes. |
| `docs/` | Diseño y guía de uso. |
| `public/` | Planilla de ejemplo y logos. |
