# Datos reales: scripts de construcción

Con estos scripts se generan `src/data/uv.json`, `src/data/macrosectores.json` y `src/data/diccionario.json`. Las fuentes, licencias y limitaciones están en `docs/datos.md`.

| Archivo | Qué hace |
|---|---|
| `construir.py` | Arma la capa de UV y la de macrosectores a partir del shapefile de MIDESOF/BIDAT (junio 2026), con nombres del PLADECO y población del Censo 2024 por manzana. Requiere `pyshp`, `shapely` y `pyarrow`. |
| `diccionario.py` | Arma `diccionario-candidato.json` con lugares de OSM e INE que caen dentro de la comuna, cada uno con su UV por point-in-polygon. Deja en `diccionario-candidato-origen.csv` el origen de cada entrada. |
| `diccionario-candidato.json`, `diccionario-candidato-origen.csv` | Salida de `diccionario.py`. Queda versionada para que la integración sea reproducible sin volver a descargar nada. |
| `integrar-diccionario.ts` | Junta los lugares iniciales (corregidos, nuevos y retirados, cada uno con su motivo) con el candidato y escribe `src/data/diccionario.json`. Es determinista. |

## Regenerar

```bash
# 1. Capas (necesita los datos crudos descargados en <BASE>: bidat-uv-2026/ e ine-censo/R09/)
python3 -I benchmark/datos-reales/construir.py <BASE>
python3 -I benchmark/datos-reales/diccionario.py <BASE>
# copiar <BASE>/salida/{uv,macrosectores}.json a src/data/ y el candidato a esta carpeta

# 2. Diccionario
pnpm tsx benchmark/datos-reales/integrar-diccionario.ts

# 3. Set del benchmark (recalcula las UV esperadas)
pnpm benchmark:generar && pnpm benchmark
```

Los datos crudos (unos 140 MB comprimidos) no se versionan.
