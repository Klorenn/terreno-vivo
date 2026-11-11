# Informe de benchmark (E9)

Fecha: 2026-11-11 · Casos: 100 · Duración: <1 s (con caché de Nominatim) · Interpretación: parser heurístico (sin ANTHROPIC_API_KEY)

Capa de UV **real referencial** (MIDESOF/BIDAT 2026, 36 UV), pendiente de validar con el municipio: la UV esperada se calculó con point-in-polygon sobre esa capa (ver benchmark/README.md). Las cifras se informan tal como salieron.

Métricas (sección 8.2): acierto = % asignados a la UV correcta sobre todos los casos; derivación = % enviados a revisión (genérico: sin resultado); error silencioso = % asignados a UV incorrecta con confianza alta o media (genérico: cualquier asignación incorrecta).

| Categoría | n | Acierto sistema | Acierto genérico | Derivación sistema | Derivación genérico | Error silencioso sistema | Error silencioso genérico |
|---|---|---|---|---|---|---|---|
| **Total** | 100 | 61% | 26% | 34% | 65% | 5% | 9% |
| urbana_limpia | 25 | 92% | 76% | 0% | 0% | 8% | 24% |
| urbana_errores | 25 | 52% | 8% | 36% | 88% | 12% | 4% |
| poblacion_villa | 25 | 56% | 4% | 44% | 88% | 0% | 8% |
| rural_referencia | 25 | 44% | 16% | 56% | 84% | 0% | 0% |

## Lectura

- Error silencioso total: sistema 5% vs genérico 9%.

## Fallos del sistema (39)

| id | Categoría | Dirección | Esperada | Sistema | Confianza | Motivo | Genérico |
|---|---|---|---|---|---|---|---|
| c005 | urbana_limpia | Avenida Caupolicán 980, Temuco | UV 2 Caupolicán | UV 1 Prieto Sur | media | Número no encontrado en el mapa; ubicación a nivel de calle | UV 1 Prieto Sur |
| c024 | urbana_limpia | Andrés Bello 1290, Temuco | UV 16 San Antonio | UV 1 Prieto Sur | media | Número no encontrado en el mapa; ubicación a nivel de calle | UV 16 San Antonio |
| c028 | urbana_errores | av. p. neruda 1540 | UV 11 Estadio | — | baja | No se encontró la calle en el mapa; requiere revisión | — |
| c029 | urbana_errores | prat 215 ofic 2 | UV 1 Prieto Sur | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c030 | urbana_errores | avda caupolican 980 temuco | UV 2 Caupolicán | UV 1 Prieto Sur | media | Número no encontrado en el mapa; ubicación a nivel de calle | UV 2 Caupolicán |
| c032 | urbana_errores | rudecindo ortega 2200 blk b | UV 15 Acceso Norte | UV 13 Museo Ferroviario | media | Número no encontrado en el mapa; ubicación a nivel de calle | — |
| c034 | urbana_errores | bulnes 480 2do piso | UV 1 Prieto Sur | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c035 | urbana_errores | lautaro 1250 local 4 | UV 2 Caupolicán | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c037 | urbana_errores | portales 810 of 301 | UV 1 Prieto Sur | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c041 | urbana_errores | a. varas 1030 casa 2 | UV 1 Prieto Sur | — | baja | No se encontró la calle en el mapa; requiere revisión | — |
| c042 | urbana_errores | claro solar n° 880 | UV 3 Estación | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | UV 1 Prieto Sur |
| c045 | urbana_errores | san martin 1180 dpto 404 | UV 12 Las Encinas | — | baja | No se encontró la calle en el mapa; requiere revisión | — |
| c049 | urbana_errores | andres vello 1290 | UV 16 San Antonio | UV 1 Prieto Sur | media | Número no encontrado en el mapa; ubicación a nivel de calle | — |
| c050 | urbana_errores | zenteno 540, temuco, 2° piso | UV 16 San Antonio | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c055 | poblacion_villa | la pedro, pasaje las rosas casa 8 | UV 20 Cerro Mariposas | — | baja | Pasaje con número no encontrado en el mapa y sin lugar que lo confirme; requiere revisión | — |
| c058 | poblacion_villa | lomas del carmen pasaje 2 casa 9 | UV 26 Creadores | — | baja | Pasaje con número no encontrado en el mapa y sin lugar que lo confirme; requiere revisión | — |
| c061 | poblacion_villa | pueblo nuevo, pasaje los robles 8 | UV 15 Acceso Norte | — | baja | Pasaje con número no encontrado en el mapa y sin lugar que lo confirme; requiere revisión | — |
| c064 | poblacion_villa | brisas de labranza casa 21 | UV 31 Sector Ribereño | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | UV 31 Sector Ribereño |
| c066 | poblacion_villa | villa santa maria de labranza pasaje 4 casa 2 | UV 30 Labranza Uno Norte | — | baja | Calle sin número y lugar nombrado desconocido: posible ubicación errónea | — |
| c067 | poblacion_villa | pob. sta. rosita pasaje 9 | UV 16 San Antonio | — | baja | No se encontró la calle en el mapa; requiere revisión | — |
| c068 | poblacion_villa | villa alerse casa 3 | UV 27 Botrolhue | — | baja | El lugar nombrado no está en el diccionario; requiere revisión | — |
| c069 | poblacion_villa | pob lanín norte, casa 31 | UV 20 Cerro Mariposas | — | baja | Coincidencia parcial en el diccionario; requiere confirmación | — |
| c070 | poblacion_villa | villa la esperanza 2, pasaje 1 casa 10 | UV 24 Raluncoyán | — | baja | Calle sin número y lugar nombrado desconocido: posible ubicación errónea | — |
| c071 | poblacion_villa | las quilitas, pasaje 3 | UV 4 5 Sur | — | baja | Pasaje sin número resuelto ni lugar que lo confirme: hay pasajes con el mismo nombre en varias unidades vecinales; requiere revisión | — |
| c072 | poblacion_villa | el portal casa 12 | UV 12 Las Encinas | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | UV 30 Labranza Uno Norte |
| c076 | rural_referencia | camino a boyeco km 5, frente a la escuela | UV 34 Boyeco | — | baja | El lugar abarca más de una unidad vecinal; requiere revisión | — |
| c078 | rural_referencia | frente al consultorio santa rosa | UV 17 Valparaíso | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c079 | rural_referencia | sector conoco, al lado de la posta | UV 34 Boyeco | — | baja | Coincidencia parcial en el diccionario; requiere confirmación | — |
| c085 | rural_referencia | camino a mollulco, cerca de la escuela | UV 33 Tromén Mollulco | — | baja | No se encontró la calle en el mapa; requiere revisión | — |
| c087 | rural_referencia | sector botrolhue, frente a la escuela | UV 27 Botrolhue | — | baja | El lugar abarca más de una unidad vecinal; requiere revisión | — |
| c088 | rural_referencia | frente al cesfam labranza | UV 29 Labranza Alto | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c092 | rural_referencia | frente a la escuelita de boyeco | UV 34 Boyeco | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c093 | rural_referencia | posta konoko, camino a conoco | UV 34 Boyeco | — | baja | No se encontró la calle en el mapa; requiere revisión | — |
| c094 | rural_referencia | comunidad curilej, camino a tromen | UV 33 Tromén Mollulco | — | baja | Calle sin número y lugar nombrado desconocido: posible ubicación errónea | — |
| c095 | rural_referencia | sector tromen alto, al lado del canal | UV 33 Tromén Mollulco | — | baja | El lugar abarca más de una unidad vecinal; requiere revisión | — |
| c096 | rural_referencia | escuela trañi trañi, camino a labranza | UV 33 Tromén Mollulco | — | baja | No se encontró la calle en el mapa; requiere revisión | UV 33 Tromén Mollulco |
| c097 | rural_referencia | al lado del consultorio | UV 21 Villa Alegre | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c098 | rural_referencia | parcela 22 camino viejo a boyeco | UV 34 Boyeco | — | baja | No se encontró la calle en el mapa; requiere revisión | — |
| c099 | rural_referencia | frente a la escuela de boyeco, sitio 2 | UV 34 Boyeco | — | baja | Coincidencia parcial en el diccionario; requiere confirmación | — |
