# Informe de benchmark (E9)

Fecha: 2026-11-11 · Casos: 100 · Duración: 164 s · Interpretación: parser heurístico (sin ANTHROPIC_API_KEY)

Capas de UV y macrosectores **simuladas**: la UV esperada se verificó contra polígonos ficticios (ver benchmark/README.md). Las cifras se informan tal como salieron.

Métricas (sección 8.2): acierto = % asignados a la UV correcta sobre todos los casos; derivación = % enviados a revisión (genérico: sin resultado); error silencioso = % asignados a UV incorrecta con confianza alta o media (genérico: cualquier asignación incorrecta).

| Categoría | n | Acierto sistema | Acierto genérico | Derivación sistema | Derivación genérico | Error silencioso sistema | Error silencioso genérico |
|---|---|---|---|---|---|---|---|
| **Total** | 100 | 46% | 28% | 49% | 72% | 5% | 0% |
| urbana_limpia | 25 | 84% | 100% | 16% | 0% | 0% | 0% |
| urbana_errores | 25 | 24% | 12% | 76% | 88% | 0% | 0% |
| poblacion_villa | 25 | 60% | 0% | 20% | 100% | 20% | 0% |
| rural_referencia | 25 | 16% | 0% | 84% | 100% | 0% | 0% |

## Lectura

- En **urbana_limpia** el sistema no supera al genérico en acierto (84% vs 100%).
- Error silencioso total: sistema 5% vs genérico 0%.

## Fallos del sistema (54)

| id | Categoría | Dirección | Esperada | Sistema | Confianza | Motivo | Genérico |
|---|---|---|---|---|---|---|---|
| c004 | urbana_limpia | Arturo Prat 215, Temuco | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | UV 5 Centro |
| c009 | urbana_limpia | Manuel Bulnes 480, Temuco | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | UV 5 Centro |
| c011 | urbana_limpia | Vicuña Mackenna 650, Temuco | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | UV 5 Centro |
| c015 | urbana_limpia | Las Heras 745, Temuco | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | UV 5 Centro |
| c026 | urbana_errores | av alemnia 0450 dpto 3 | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c028 | urbana_errores | av. p. neruda 1540 | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c029 | urbana_errores | prat 215 ofic 2 | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c031 | urbana_errores | hoschtetter 1320 | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c032 | urbana_errores | rudecindo ortega 2200 blk b | UV 3 Las Quilas | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c033 | urbana_errores | aldunte 575 depto 12 | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c034 | urbana_errores | bulnes 480 2do piso | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c035 | urbana_errores | lautaro 1250 local 4 | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c036 | urbana_errores | vicuna mackena 650 | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c037 | urbana_errores | portales 810 of 301 | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c038 | urbana_errores | av balmaseda 1480 | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c040 | urbana_errores | las eras 745 | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c041 | urbana_errores | a. varas 1030 casa 2 | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c042 | urbana_errores | claro solar n° 880 | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | UV 5 Centro |
| c044 | urbana_errores | av javiera carera 1320 block 7 | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c045 | urbana_errores | san martin 1180 dpto 404 | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c047 | urbana_errores | avda. luis duran 1950 | UV 4 Labranza Oriente | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c049 | urbana_errores | andres vello 1290 | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c050 | urbana_errores | zenteno 540, temuco, 2° piso | UV 5 Centro | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c055 | poblacion_villa | la pedro, pasaje las rosas casa 8 | UV 1 Pedro de Valdivia | UV 2 Amanecer Norte | media | Solo calle sin número: ubicación aproximada | — |
| c058 | poblacion_villa | los caciques pasaje 2 casa 9 | UV 8 Santa Rosa | UV 6 Pueblo Nuevo | media | Solo calle sin número: ubicación aproximada | — |
| c061 | poblacion_villa | pueblo nuevo, pasaje los robles 8 | UV 6 Pueblo Nuevo | UV 5 Centro | media | Solo calle sin número: ubicación aproximada | — |
| c064 | poblacion_villa | jardin del sur casa 21 | UV 8 Santa Rosa | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c067 | poblacion_villa | pob. sta. rosita pasaje 9 | UV 8 Santa Rosa | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c068 | poblacion_villa | villa alerse casa 3 | UV 4 Labranza Oriente | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c069 | poblacion_villa | pob lanín norte, casa 31 | UV 2 Amanecer Norte | — | baja | Coincidencia parcial en el diccionario; requiere confirmación | — |
| c070 | poblacion_villa | villa la esperanza 2, pasaje 1 casa 10 | UV 3 Las Quilas | UV 5 Centro | media | Solo calle sin número: ubicación aproximada | — |
| c071 | poblacion_villa | los pinitos, pasaje 3 | UV 2 Amanecer Norte | UV 5 Centro | media | Solo calle sin número: ubicación aproximada | — |
| c072 | poblacion_villa | el portal casa 12 | UV 1 Pedro de Valdivia | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c076 | rural_referencia | camino a cajón km 5, frente a la escuela | UV 9 Cajón Rural | — | baja | Coincidencia parcial en el diccionario; requiere confirmación | — |
| c079 | rural_referencia | camino a labranza km 8 parcela 12 | UV 4 Labranza Oriente | — | baja | Coincidencia parcial en el diccionario; requiere confirmación | — |
| c080 | rural_referencia | frente al consultorio santa rosa | UV 8 Santa Rosa | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c081 | rural_referencia | fundo el carmen, detrás de la sede | UV 7 Fundo El Carmen | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c082 | rural_referencia | camino el carmen km 3, cerca de la cancha | UV 7 Fundo El Carmen | — | baja | Coincidencia parcial en el diccionario; requiere confirmación | — |
| c085 | rural_referencia | al lado de la escuela rural cajón | UV 9 Cajón Rural | — | baja | Coincidencia parcial en el diccionario; requiere confirmación | — |
| c086 | rural_referencia | frente a la posta de cajon | UV 9 Cajón Rural | — | baja | Coincidencia parcial en el diccionario; requiere confirmación | — |
| c087 | rural_referencia | sector botrolhue, parcela 7 | UV 4 Labranza Oriente | — | baja | Coincidencia parcial en el diccionario; requiere confirmación | — |
| c088 | rural_referencia | camino a tromen km 4 | UV 7 Fundo El Carmen | — | baja | Coincidencia parcial en el diccionario; requiere confirmación | — |
| c089 | rural_referencia | detrás de la sede vecinal los alerces | UV 4 Labranza Oriente | — | baja | Coincidencia parcial en el diccionario; requiere confirmación | — |
| c090 | rural_referencia | junto a la cancha las quilas | UV 3 Las Quilas | — | baja | Coincidencia parcial en el diccionario; requiere confirmación | — |
| c091 | rural_referencia | frente a la feria pinto | UV 5 Centro | — | baja | Coincidencia parcial en el diccionario; requiere confirmación | — |
| c092 | rural_referencia | cerca del liceo pueblo nuevo | UV 6 Pueblo Nuevo | — | baja | Coincidencia parcial en el diccionario; requiere confirmación | — |
| c093 | rural_referencia | camino cajon km 12 parcela 3 | UV 9 Cajón Rural | — | baja | Coincidencia parcial en el diccionario; requiere confirmación | — |
| c094 | rural_referencia | camino a labransa km 2 | UV 4 Labranza Oriente | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c095 | rural_referencia | frente a la escuelita de cajon | UV 9 Cajón Rural | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c096 | rural_referencia | sector tromen alto, al lado del canal | UV 7 Fundo El Carmen | — | baja | Coincidencia parcial en el diccionario; requiere confirmación | — |
| c097 | rural_referencia | comunidad lof peguen, camino a cajon | UV 9 Cajón Rural | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c098 | rural_referencia | al lado del consultorio | UV 9 Cajón Rural | — | baja | Coincidencia parcial en el diccionario; requiere confirmación | — |
| c099 | rural_referencia | parcela 22 camino viejo a cajón | UV 9 Cajón Rural | — | baja | No se pudo ubicar: solo referencias vagas o datos insuficientes | — |
| c100 | rural_referencia | frente a la plaza anibal pinto | UV 5 Centro | — | baja | Coincidencia parcial en el diccionario; requiere confirmación | — |
