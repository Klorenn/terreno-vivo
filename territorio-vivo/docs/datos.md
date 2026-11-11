# Datos territoriales

El prototipo usa datos abiertos reales de la comuna de Temuco (09101). Los límites de unidades vecinales son **referenciales**: falta validarlos con el municipio.

## Archivos

| Archivo | Contenido | Fuente | Licencia |
|---|---|---|---|
| `src/data/uv.json` | 36 unidades vecinales (Polygon), con nombre y macrosector | MIDESOF / BIDAT, capa de UV de junio de 2026 | CC BY 4.0 |
| `src/data/macrosectores.json` | 11 macrosectores, como unión de sus UV | Tabla 1 del PLADECO Temuco 2020-2024 (asignación UV → macrosector) | Documento público |
| `src/data/diccionario.json` | 539 lugares con alias: 206 poblaciones, 141 villas, 142 comunidades, 26 caminos, 23 hitos, 1 sector | OpenStreetMap (Nominatim) e INE Censo 2024 | ODbL (OSM); INE, datos abiertos |
| `src/data/index.ts` | `CAJA_COMUNA` = [-72.8235, -38.7824, -72.4695, -38.5493], que acota las búsquedas en Nominatim | Límite comunal derivado de la capa de UV | — |

La población por UV viene del Censo 2024 (INE), asignada por manzana a la capa de UV de MIDESOF.

## Cómo se construyó

Los scripts están en `benchmark/datos-reales/` (ver su README):

1. `construir.py` lee el shapefile de UV de MIDESOF, filtra la comuna 09101, corrige geometrías, simplifica (tolerancia de unos 8 m), asigna los nombres y macrosectores del PLADECO y agrega la población del Censo por manzana.
2. `diccionario.py` arma un diccionario candidato con lugares de OSM e INE que caen dentro de la comuna. Cada lugar recibe la UV donde cae su punto representativo, o `null` si cruza más de una UV.
3. `integrar-diccionario.ts` junta el candidato con los lugares iniciales y escribe `src/data/diccionario.json`. Es determinista: `pnpm tsx benchmark/datos-reales/integrar-diccionario.ts`.

## Lugares iniciales del diccionario

- De las 40 entradas simuladas originales, 21 se ubicaron en su coordenada real de OSM.
- 16 son hitos reales nuevos (dic-041 a dic-056): escuelas y postas rurales, CESFAM Labranza y Villa Alegre, Mercado, Hospital Regional y Estadio.
- 19 se retiraron porque eran inventadas, estaban fuera de la comuna (Cajón está en Vilcún y Los Caciques en Padre Las Casas) o no se pudieron verificar. La lista y los motivos están en `integrar-diccionario.ts`.
- Del candidato se agregaron 502 entradas. Se excluyeron 88 por tipo, 1 por largo del nombre y 33 duplicadas (mismo nombre normalizado, o mismo elemento de OSM que un lugar inicial).

## Limitaciones conocidas

- **Límites referenciales.** La capa de MIDESOF no es la oficial del municipio. Si el municipio entrega la suya, hay que reemplazar `uv.json`, correr `integrar-diccionario.ts` y `pnpm benchmark:generar`, y revisar a mano las UV esperadas que cambien.
- **Zonas rurales sin cubrir.** Hay comunidades del INE que quedan fuera de toda UV o que cruzan varias. Por eso 51 entradas tienen `unidad_vecinal: null`, y el sistema las manda a revisión.
- **Lugares extensos.** Pueblo Nuevo y Pedro de Valdivia abarcan varias UV, pero tienen una sola coordenada representativa.
- **Coincidencias de baja confianza.** "Población Lanín" quedó como "San José de Lanín". "Villa Esperanza" quedó como "Villa La Esperanza" (nodo OSM 6101466145), y hay varias con ese nombre. El alias "el portal" es ambiguo, porque también existe Villa El Portal en uv-27.
- **Caché de Nominatim.** La clave de `benchmark/cache-nominatim.json` no incluye la caja de búsqueda, así que se reutilizan resultados que se obtuvieron con la caja anterior, más chica.

## Atribución en la interfaz

- Aviso: "Datos territoriales reales de fuentes abiertas (MIDESOF, INE Censo 2024, OpenStreetMap); límites de UV referenciales, pendientes de validar con el municipio."
- Pie: "UV: MIDESOF/BIDAT 2026 (CC BY 4.0) · Población: INE Censo 2024 · Macrosectores: PLADECO Temuco 2020-2024 · Lugares y mapa base © colaboradores de OpenStreetMap (ODbL)."
