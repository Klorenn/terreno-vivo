# Benchmark (E2 + E9)

## Set de 100 direcciones (`set-100.csv`)

Columnas: `id, categoria, direccion, uv_esperada, lat_ref, lon_ref, fuente_verificacion, nota`.

Cuatro categorías de 25 (sección 8.1 del SOW): `urbana_limpia`, `urbana_errores`, `poblacion_villa`, `rural_referencia`. Todas las direcciones son inventadas o usan calles públicas de Temuco con número inventado. **Ninguna es de un beneficiario real.**

`fuente_verificacion` indica de dónde sale la coordenada de referencia:

- `nominatim (calle|numero)`: coordenada obtenida de Nominatim para la calle pública (cacheada en `cache-nominatim.json`). Las 25 de `urbana_errores` comparten referencia con su versión limpia.
- `diccionario`: coordenada de la entrada correspondiente del diccionario territorial (`src/data/diccionario.json`).
- `manual`: coordenada fijada por el equipo.

### Capa de referencia

`uv_esperada` es la UV de la **capa real referencial** (`src/data/uv.json`: 36 UV de MIDESOF/BIDAT 2026) en la que cae el punto de referencia, calculada con point-in-polygon. Esa capa todavía no está validada por el municipio: si entrega su capa oficial, regenerar con `pnpm benchmark:generar` y revisar a mano las filas que cambien.

Las categorías `poblacion_villa` y `rural_referencia` apuntan a lugares reales del diccionario (OpenStreetMap, INE Censo 2024). Los tres puntos `manual` (camino a Boyeco km 7 y camino viejo a Boyeco en uv-34; CESFAM Villa Alegre en uv-21) se verificaron con point-in-polygon. Con la capa simulada anterior, unas 35 referencias de esas categorías caían fuera de la comuna real; esas cifras (sistema 71% vs genérico 28%) no son comparables con las actuales.

El set se define en `definicion-set.ts` y se materializa con `pnpm benchmark:generar`.

## Correr el benchmark

```bash
pnpm benchmark
```

Con `ANTHROPIC_API_KEY` la interpretación usa el modelo de lenguaje; sin la clave usa el parser heurístico. El informe registra cuál se usó.

Produce `informe.md` (tabla total y por categoría, lista de fallos del sistema) y `resultados.json`. Las llamadas a Nominatim se cachean en `cache-nominatim.json` y respetan 1 consulta por segundo; la primera corrida tarda varios minutos.

Geocodificador genérico de comparación: Nominatim con la dirección tal cual + ", Temuco, Chile", sin acotar, sin interpretación y sin confianza; asigna siempre que haya resultado.

Las cifras se informan tal como salen. Si en alguna categoría el sistema no supera al genérico, el informe lo dice.
