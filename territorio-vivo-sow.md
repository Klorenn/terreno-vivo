# Territorio Vivo

**Convocatoria:** Innova TemucoLab 2026
**Desafío:** Información territorial: ¿cómo asociar automáticamente las prestaciones municipales a macrosectores y unidades vecinales?
**Equipo:** [nombre del equipo] / [integrantes y carreras]
**Versión del documento:** 1.0 (10 de noviembre de 2026)

---

## 1. Resumen

Territorio Vivo es una herramienta que recibe registros de prestaciones municipales con direcciones escritas como las escribe la gente y los asigna automáticamente a su unidad vecinal (UV) y macrosector.

Su diferencia frente a un geocodificador común es que resuelve las direcciones que no están en ningún mapa: referencias ("frente a la escuela"), kilómetros de caminos rurales, comunidades, y poblaciones conocidas por un nombre antiguo o informal. Lo hace con un modelo de lenguaje apoyado en un diccionario territorial propio de Temuco, que aprende de cada corrección que hace un funcionario.

Sobre esa base entrega dos cosas más: un mapa de brechas, que muestra qué sectores reciben menos prestaciones en relación con su población, y consultas en lenguaje natural para directivos.

**Lo que se mostrará el 26 de noviembre:** un prototipo funcional, una comparación medida contra un geocodificador genérico sobre 100 direcciones difíciles, y una demo en vivo con direcciones dictadas por el jurado.

---

## 2. Problema

1. Las prestaciones se registran con direcciones en texto libre: abreviaturas, errores de tipeo, datos incompletos.
2. Asignar cada registro a una UV se hace a mano o no se hace.
3. Los geocodificadores genéricos fallan más en sectores rurales y poblaciones nuevas o informales, que suelen ser los de mayor interés social. El error no es parejo: es peor justo donde más importa.
4. Sin esa asignación, el municipio no puede responder con datos preguntas como "¿a qué sectores estamos llegando menos?".

---

## 3. Solución y diferenciadores

| # | Componente | Qué hace | Por qué es distinto |
|---|---|---|---|
| 1 | Interpretación con IA | Convierte texto libre en una dirección estructurada: calle, número, población, referencia, comunidad, km | Entiende referencias y nombres informales, no solo calle y número |
| 2 | Diccionario territorial vivo | Guarda alias de poblaciones, villas, comunidades, hitos y caminos, con su ubicación | Cada corrección humana lo mejora. Queda como activo del municipio |
| 3 | Asignación territorial | Ubica el punto dentro del polígono de su UV y macrosector | Entrega nivel de confianza y deriva lo dudoso a revisión, en vez de asignar mal |
| 4 | Mapa de brechas | Prestaciones por habitante en cada UV | Pasa de "dónde hay" a "dónde falta" |
| 5 | Consultas en lenguaje natural | Responde preguntas escritas por un directivo, con tabla y mapa | Sin filtros ni planillas (componente opcional) |

---

## 4. Declaración de trabajo (SOW)

### 4.1 Objetivo

Entregar el 26 de noviembre de 2026 un prototipo funcional que asigne prestaciones a UV y macrosector desde direcciones en texto libre, con una medición de su acierto y una demostración en vivo.

### 4.2 Alcance incluido

- Carga de registros: uno a uno (escrito) y por planilla (CSV o Excel).
- Interpretación de direcciones con modelo de lenguaje.
- Diccionario territorial versión 1, con al menos 150 entradas.
- Geolocalización y cruce con las capas de UV y macrosectores.
- Nivel de confianza por registro y bandeja de revisión manual.
- Registro de correcciones que alimenta el diccionario.
- Mapa de resultados y tabla descargable.
- Mapa de brechas, sujeto a disponibilidad de datos de población por UV.
- Comparación medida contra un geocodificador genérico.
- Presentación y demo para el Demo Day.

### 4.3 Fuera de alcance

- Integración con los sistemas internos del municipio.
- Uso de datos personales identificables (nombres, RUT, teléfonos).
- Operación en producción, cuentas de usuario y permisos.
- Cobertura de otras comunas.
- Aplicación móvil nativa.

### 4.4 Supuestos

- La organización acepta la inscripción del equipo pese a que el plazo cerró el 8 de noviembre.
- El municipio entrega, o permite ubicar, las capas geográficas de UV y macrosectores.
- Si no hay datos reales de prestaciones, se trabaja con datos ficticios construidos por el equipo.
- El equipo dispone de acceso a una API de modelo de lenguaje.

### 4.5 Dependencias externas

| Dependencia | De quién | Fecha límite | Plan si no llega |
|---|---|---|---|
| Confirmación de inscripción | Organización | 11 nov | Sin esto no se continúa |
| Capa de UV y macrosectores | Municipio / TemucoLab | 18 nov | Buscar en portales públicos de datos geográficos o digitalizar un subconjunto de UV para la demo |
| Muestra de prestaciones anonimizada | Municipio | 18 nov | Datos ficticios |
| Población por UV | Municipio / datos censales | 20 nov | Mapa de brechas con datos simulados, declarado como tal |

### 4.6 Roles

| Rol | Responsabilidad | Responsable |
|---|---|---|
| Líder de proyecto | Plazos, contacto con la organización, presentación | [nombre] |
| Conocimiento territorial | Set de direcciones, diccionario, validación de resultados | [nombre] |
| Desarrollo | Prototipo, pruebas, despliegue | [nombre] |
| Datos y medición | Benchmark, cifras, mapa de brechas | [nombre] |

Una persona puede cubrir más de un rol.

### 4.7 Criterios de aceptación del proyecto

1. El prototipo procesa una planilla de 100 registros de principio a fin sin intervención técnica.
2. Existe una cifra medida de acierto propia y otra del geocodificador genérico, sobre el mismo set.
3. Ningún registro de baja confianza se asigna sin quedar marcado para revisión.
4. Una corrección hecha en la bandeja de revisión cambia el resultado la siguiente vez que aparece la misma expresión.
5. La demo completa dura menos de 5 minutos y tiene respaldo en video.

---

## 5. Entregables

| ID | Entregable | Fecha | Criterio de cumplimiento |
|---|---|---|---|
| E1 | Inscripción confirmada | Mié 11 nov | Respuesta escrita de la organización |
| E2 | Set de 100 direcciones difíciles con su UV correcta | Jue 12 nov | 4 categorías de 25 (ver sección 8), cada una con ubicación verificada a mano |
| E3 | Prototipo v0 | Vie 13 nov | Interpreta una dirección escrita y la muestra en un mapa, con datos ficticios |
| E4 | Pitch de 1 minuto | Vie 13 nov | Problema, solución y diferenciador, ensayado |
| E5 | Solicitud de datos y preguntas para la asesoría | Dom 15 nov | Lista escrita (ver sección 9) |
| E6 | Minuta de asesoría | Mié 18 nov | Datos comprometidos, formato de salida validado, ajustes pedidos |
| E7 | Prototipo v1 con capas reales | Vie 20 nov | Asigna UV y macrosector con polígonos reales, carga por planilla |
| E8 | Diccionario territorial v1 y bandeja de revisión | Sáb 21 nov | 150 entradas o más. Las correcciones se guardan y se reutilizan |
| E9 | Informe de benchmark | Dom 22 nov | Tabla comparativa con las tres métricas de la sección 8 |
| E10 | Mapa de brechas | Lun 23 nov | Prestaciones por habitante por UV, con fuente de población declarada |
| E11 | Consultas en lenguaje natural (opcional) | Mar 24 nov | Responde 5 preguntas tipo. Si no está estable, se presenta como siguiente etapa |
| E12 | Versión congelada, ensayo y video de respaldo | Mié 25 nov | Sin cambios de código después de esta fecha. Dos ensayos completos |
| E13 | Presentación y demo | Jue 26 nov | Demo Day |

---

## 6. Diseño propuesto

### 6.1 Flujo de procesamiento

| Paso | Entrada | Proceso | Salida |
|---|---|---|---|
| 1. Carga | Texto o planilla | Lee los registros y conserva solo dirección, tipo de prestación y fecha | Registros de trabajo |
| 2. Interpretación | Dirección en texto libre | El modelo de lenguaje extrae los componentes y corrige abreviaturas y errores | Dirección estructurada |
| 3. Búsqueda en diccionario | Componentes | Busca población, comunidad, hito o camino entre los alias conocidos | Coincidencia local, si existe |
| 4. Geolocalización | Dirección estructurada | Si hay calle y número, geocodifica. Si no, usa la ubicación del diccionario | Coordenadas y tipo de precisión |
| 5. Cruce territorial | Coordenadas | Punto dentro de polígono contra UV y macrosector | UV y macrosector |
| 6. Confianza | Todo lo anterior | Aplica las reglas de la sección 6.4 | Alta, media o baja |
| 7. Revisión | Registros de confianza baja | Un funcionario confirma o corrige | Corrección guardada en el diccionario |
| 8. Resultados | Registros asignados | Tabla, mapa, mapa de brechas | Archivos descargables y vistas |

### 6.2 Dirección estructurada

Campos que devuelve el paso de interpretación:

| Campo | Ejemplo |
|---|---|
| texto_original | pje los aromos 123 pob sta rosa |
| calle | Pasaje Los Aromos |
| numero | 123 |
| poblacion_o_villa | Santa Rosa |
| comunidad | (vacío) |
| camino_y_km | (vacío) |
| referencia | (vacío) |
| es_rural | no |
| observaciones | abreviaturas expandidas |

Reglas para el modelo: no inventar datos que no estén en el texto, dejar vacío lo que no se pueda determinar, y devolver siempre el mismo formato.

### 6.3 Diccionario territorial

| Campo | Descripción |
|---|---|
| id | Identificador |
| nombre_oficial | Nombre formal del lugar |
| alias | Lista de nombres usados por la gente, incluidos antiguos y abreviados |
| tipo | población, villa, comunidad, hito, camino, sector |
| latitud, longitud | Punto representativo |
| unidad_vecinal | Si el lugar cae completo dentro de una UV |
| fuente | equipo, funcionario, municipio |
| fecha_actualizacion | Para trazabilidad |

Carga inicial a cargo del equipo: poblaciones y villas, establecimientos educacionales y de salud, sedes sociales, caminos rurales con sus kilómetros de referencia y comunidades. Antes de incluir comunidades indígenas y sus nombres, validar con el municipio cuál es la fuente y la forma correcta de nombrarlas.

### 6.4 Niveles de confianza

| Nivel | Condición | Acción |
|---|---|---|
| Alta | Calle y número geocodificados, o coincidencia exacta en diccionario con UV única | Se asigna |
| Media | Solo calle sin número, o lugar del diccionario que abarca más de una UV | Se asigna y se marca como aproximado |
| Baja | Solo referencias vagas, resultados contradictorios o punto fuera de la comuna | No se asigna. Va a revisión |

Principio de diseño: es preferible derivar a revisión que asignar mal. Un error silencioso distorsiona las cifras del municipio sin que nadie lo note.

### 6.5 Pantallas

1. **Inicio:** campo para escribir una dirección y botón para subir planilla.
2. **Resultado individual:** dirección original, dirección interpretada, UV, macrosector, confianza y punto en el mapa.
3. **Resultados por lote:** tabla con filtros por confianza, y resumen (asignados, aproximados, a revisión).
4. **Bandeja de revisión:** registros de confianza baja. El funcionario elige la UV en el mapa y puede guardar el alias.
5. **Mapa territorial:** UV coloreadas por cantidad de prestaciones, con filtro por tipo y período.
6. **Mapa de brechas:** UV coloreadas por prestaciones por habitante, con lista de las de menor cobertura.
7. **Consultas (opcional):** campo de pregunta, respuesta en texto, tabla y mapa.

### 6.6 Opciones de implementación

| | Ruta A: aplicación web sin instalación | Ruta B: Python |
|---|---|---|
| Para quién | Equipo sin programadores | Equipo con alguien que maneje Python |
| Cómo se usa | Se abre desde un enlace | Se ejecuta en un computador |
| Componentes | Página web con mapa, polígonos incluidos en la página, modelo de lenguaje para interpretar | pandas, geopandas, Streamlit, mapa con folium, API de modelo de lenguaje, geocodificador de OpenStreetMap |
| Ventaja | Lista para la demo, funciona en celular | Maneja mejor planillas grandes y datos reales |
| Límite | Depende más del diccionario local para ubicar | Requiere instalación y alguien que la mantenga |

**Decisión pendiente:** elegir la ruta antes del miércoles 11. Si nadie del equipo programa, se toma la ruta A.

Nota técnica: el servicio público de geocodificación de OpenStreetMap limita la cantidad de consultas por segundo. Para lotes grandes hay que procesar con pausas y guardar los resultados ya obtenidos.

---

## 7. Cronograma

| Fecha | Hito del programa | Trabajo del equipo |
|---|---|---|
| Mar 10 nov | Taller de IA | Definir equipo y roles. Escribir a la organización por la inscripción |
| Mié 11 nov | | E1. Elegir ruta A o B. Empezar el set de direcciones |
| Jue 12 nov | | E2. Primeras 50 entradas del diccionario |
| Vie 13 nov | **Matching Day** | E3 y E4 |
| Sáb 14 y dom 15 nov | | E5. Completar el diccionario a 100 entradas |
| Lun 16 a mié 18 nov | **Asesorías** | Presentar v0, pedir datos, validar formato de salida. E6 |
| Jue 19 nov | Inicio de desarrollo | Integrar capas reales de UV |
| Vie 20 nov | | E7 |
| Sáb 21 nov | | E8 |
| Dom 22 nov | | E9. Correr el benchmark y analizar los fallos |
| Lun 23 nov | | E10. Corregir los errores encontrados en el benchmark |
| Mar 24 nov | | E11 si hay tiempo. Armar la presentación |
| Mié 25 nov | Fin de desarrollo | E12. Congelar, ensayar dos veces, grabar video |
| Jue 26 nov | **Demo Day** | E13 |

---

## 8. Plan de medición

### 8.1 Set de prueba

100 direcciones con su UV correcta verificada a mano por el equipo:

| Categoría | Cantidad | Ejemplo de forma |
|---|---|---|
| Urbanas bien escritas | 25 | Calle, número, comuna |
| Urbanas con errores y abreviaturas | 25 | "av alemnia 0450 dpto 3" |
| Poblaciones y villas por nombre | 25 | "villa tal, pasaje 3, casa 12" |
| Rurales y por referencia | 25 | "camino a tal sector km 5, frente a la escuela" |

Las direcciones deben ser inventadas o tomadas de fuentes públicas. No usar direcciones de beneficiarios reales.

### 8.2 Métricas

| Métrica | Definición | Por qué importa |
|---|---|---|
| Acierto | Porcentaje de registros asignados a la UV correcta | Cifra principal |
| Derivación | Porcentaje enviado a revisión | Carga de trabajo que queda para el funcionario |
| Error silencioso | Porcentaje asignado a una UV incorrecta con confianza alta o media | La más importante: debe ser lo más baja posible |

Las mismas 100 direcciones se pasan por un geocodificador genérico y se reportan ambos resultados, en total y por categoría. Las cifras se informan tal como salgan. Si en alguna categoría el sistema no supera al genérico, se dice y se explica.

---

## 9. Solicitudes y preguntas para la asesoría

**Datos a pedir**

1. Capa geográfica de unidades vecinales y de macrosectores (shapefile, GeoJSON o KML).
2. Muestra de prestaciones sin datos personales: dirección, tipo de prestación, fecha.
3. Población por unidad vecinal, o la fuente que usa el municipio.
4. Listado oficial de poblaciones, villas y sectores rurales, si existe.

**Preguntas**

1. ¿Qué direcciones o áreas municipales registran más prestaciones y en qué formato?
2. ¿Cómo se asigna hoy la UV y cuánto tiempo toma?
3. ¿Qué tipos de dirección dan más problemas?
4. ¿Qué formato de salida les sirve: planilla, mapa, ambos?
5. ¿Qué decisiones tomarían con un mapa de brechas?
6. ¿Qué restricciones de datos y de sistemas debemos respetar?

---

## 10. Privacidad y uso responsable

- Se procesa solo dirección, tipo de prestación y fecha. Nombres, RUT y teléfonos se eliminan antes de cargar.
- Una dirección asociada a una prestación social puede ser un dato sensible. Los mapas públicos se muestran agregados por UV, no por punto.
- Las direcciones se envían a un modelo de lenguaje externo. Esto debe informarse al municipio y evaluarse frente a la normativa chilena de protección de datos personales antes de cualquier uso con datos reales.
- El mapa de brechas indica dónde mirar, no reemplaza el criterio de los equipos municipales. Una UV con pocas prestaciones puede tener menos necesidad, no menos cobertura.
- Los nombres de comunidades y lugares se validan con el municipio antes de incorporarlos.

---

## 11. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| No aceptan la inscripción tardía | Media | Total | Escribir hoy. Asistir igual al Matching Day si lo permiten |
| No llega la capa de UV | Media | Alto | Portales públicos de datos geográficos. En último caso, digitalizar un subconjunto de UV y declararlo |
| No hay datos reales de prestaciones | Alta | Medio | Datos ficticios realistas, declarados como tales |
| Falla de internet en la demo | Media | Alto | Video de respaldo y resultados precargados |
| El modelo inventa componentes de la dirección | Media | Alto | Reglas estrictas, niveles de confianza, revisión manual |
| El benchmark no favorece al sistema | Media | Medio | Analizar fallos el 22, corregir el 23, reportar con honestidad |
| Se acaba el tiempo | Alta | Medio | Orden de prioridad: componentes 1 a 3, luego 4, luego 5 |

---

## 12. Guion del Demo Day (5 minutos)

| Minuto | Contenido |
|---|---|
| 0:00 a 0:45 | El problema, con una dirección real de ejemplo que ningún mapa encuentra |
| 0:45 a 2:00 | Demo: un miembro del jurado dicta una dirección como la diría un vecino. El sistema la interpreta y la ubica |
| 2:00 a 2:45 | Una dirección falla a propósito, va a revisión, se corrige, y la segunda vez el sistema la resuelve |
| 2:45 a 3:30 | Resultado del benchmark: sistema frente a geocodificador genérico, por categoría |
| 3:30 a 4:15 | Mapa de brechas y una consulta en lenguaje natural |
| 4:15 a 5:00 | Qué se necesita para un piloto y cierre |

Preparar respuestas para: costo de operación, privacidad, qué pasa cuando se equivoca, y cómo se integra con lo que el municipio ya usa.

---

## 13. Etapas posteriores al Demo Day

1. Piloto con una dirección municipal y datos reales anonimizados.
2. Ampliación del diccionario con funcionarios y dirigentes vecinales.
3. Conexión con los sistemas de registro para asignar la UV al momento de ingresar la prestación.
4. Evaluación de un modelo de lenguaje alojado localmente para no enviar direcciones a terceros.

---

## 14. Decisiones pendientes

| Decisión | Responsable | Fecha |
|---|---|---|
| Confirmar inscripción | Líder | 11 nov |
| Ruta A o B | Equipo | 11 nov |
| Nombre definitivo del proyecto | Equipo | 13 nov |
| Asignación de roles | Equipo | 11 nov |
| Fuente de población por UV | Datos y medición | 20 nov |
| Incluir o no el componente 5 en la demo | Equipo | 24 nov |
