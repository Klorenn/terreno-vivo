# Guía de uso: Territorio Vivo

Esta guía también está dentro de la aplicación, en Documentación.

Esta guía es para funcionarios municipales. No requiere conocimientos técnicos.

**Recuerde:** es un prototipo con datos abiertos reales (UV de MIDESOF 2026, población del Censo 2024, lugares de OpenStreetMap e INE). Los límites de las UV son referenciales hasta que el municipio los confirme. Un banner amarillo lo recuerda en todas las pantallas.

## Qué hace, en dos minutos

1. Usted entrega una dirección escrita como la diría un vecino, o una planilla con muchas.
2. El sistema la interpreta, la ubica en el mapa y la asigna a una UV y un macrosector.
3. Cada asignación trae un nivel de confianza. Lo dudoso no se asigna: va a la bandeja de revisión.
4. Usted corrige lo dudoso y el sistema recuerda la corrección.
5. Con los resultados, los mapas muestran dónde se concentran las prestaciones y dónde hay menor cobertura.

## Niveles de confianza

| Nivel | Qué significa | Qué hace el sistema |
|---|---|---|
| **Alta** (asignado) | Calle y número ubicados dentro de la comuna, o coincidencia exacta con un lugar del diccionario que pertenece a una sola UV. | Asigna la UV. |
| **Media** (aproximado) | Una calle con nombre propio sin número, o una calle sin número confirmada por una población o villa del diccionario. | Asigna la UV, marcada como aproximada. |
| **Baja** (requiere revisión) | Solo referencias vagas, coincidencia parcial, resultados contradictorios, punto fuera de la comuna, un lugar del diccionario que abarca más de una UV, o un pasaje sin número sin un lugar que lo confirme (hay pasajes con el mismo nombre en muchas villas). | No asigna. El registro va a la bandeja de revisión. |

Junto a cada resultado, el campo **Motivo** explica en una frase por qué quedó en ese nivel. La tabla completa de reglas está en [reglas-de-confianza.md](reglas-de-confianza.md).

## Pantalla 1: Inicio

**Qué ve.** Un mapa de Temuco a pantalla completa y, encima, una ficha con un campo grande para escribir la dirección, los botones "Ubicar" y "Subir planilla", y una fila de direcciones de ejemplo.

**Qué hace.**
1. Escriba la dirección (por ejemplo `pje los aromos 123 pob sta rosa`) y presione "Ubicar". También puede tocar un ejemplo.
2. Espere unos segundos: la ubicación se consulta en un servicio externo que atiende una consulta por segundo.
3. Lea la ficha de resultado: dirección original, UV, macrosector, confianza, "Ubicado por", motivo y, en "Ver cómo se interpretó", las partes que reconoció (calle, número, población, comunidad, camino y km, referencia). El punto aparece en el mapa con el color de la confianza y la UV se ilumina.
4. Si la confianza es baja, presione "Enviar a revisión": el registro queda en la bandeja. Luego "Ir a revisarla" lo lleva a la bandeja de revisión.

"Subir planilla" lo lleva a la pantalla de lotes.

## Pantalla 2: Resultados por lote

**Qué ve.** Tres pasos (elegir el archivo, procesar, revisar), un botón para elegir archivo y dos planillas de ejemplo: 30 registros y 300 registros. Se procesa aproximadamente 1 registro por segundo: la planilla de 300 tarda unos 5 minutos.

**Qué hace.**
1. Prepare un CSV o Excel con la columna `direccion`. Opcionales: `tipo_prestacion` y `fecha` (AAAA-MM-DD). **No incluya nombres, RUT ni teléfonos.**
2. Presione "Elegir archivo", o junto a "Usar ejemplo" elija "30 registros" o "300 registros". Verá el nombre y la cantidad de registros.
3. Presione "Procesar planilla". Una barra muestra el avance y el tiempo que falta; los lotes grandes tardan porque el servicio de ubicación admite una consulta por segundo. Si necesita detenerlo, presione "Cancelar": se guardan los registros ya procesados.
4. Revise el resumen: Total, Asignados (alta), Aproximados (media) y Revisión (baja). Al tocar uno, la tabla se filtra.
5. La tabla muestra dirección original, dirección interpretada, UV, macrosector, confianza y motivo.
6. "Descargar CSV" entrega los resultados. "Ir a la bandeja de revisión" abre la pantalla siguiente.

Con la planilla cargada, "Volver a procesar" la procesa de nuevo (útil después de corregir registros en la bandeja). Al procesar un lote nuevo, este reemplaza al anterior.

## Pantalla 3: Bandeja de revisión

**Qué ve.** A la izquierda, la lista de registros pendientes (confianza baja que nadie ha corregido). A la derecha, el detalle del registro seleccionado y un mapa para elegir la UV. Arriba, el número de correcciones guardadas y los botones "Descargar lugares aprendidos" y "Borrar correcciones".

**Qué hacer cuando algo cae a revisión.**
1. Seleccione un registro de la lista. La etiqueta corta ("Sin ubicar" o "Parcial") indica el tipo de problema; el motivo completo aparece en la ficha del registro, debajo del mapa.
2. Haga clic en el mapa, sobre la UV que corresponde. El nombre aparece en "UV elegida".
3. Deje marcada la casilla "Recordar «…»" si quiere que el sistema aprenda esa expresión (por ejemplo, el nombre de una población o de un hito). Desmárquela si fue un caso aislado.
4. Presione "Confirmar UV". El registro pasa a confianza alta con el motivo "Asignada manualmente por un funcionario" y sale de la lista.
5. Si marcó "Recordar", la próxima vez que aparezca esa expresión se asignará a esa UV.

"Descargar lugares aprendidos" descarga las correcciones guardadas, para compartirlas. "Borrar correcciones" elimina las guardadas en este navegador.

## Pantalla 4: Mapa territorial

**Qué ve.** Las UV coloreadas según la cantidad de prestaciones asignadas (más oscuro, más prestaciones), una leyenda y la lista de prestaciones por UV.

**Qué hace.** Filtre por tipo de prestación y por rango de fechas (Desde, Hasta). Cuenta los registros asignados con confianza alta o media y los corregidos manualmente. Si no ha procesado un lote, verá "Procese un lote para ver el mapa". El mapa muestra totales por UV, nunca puntos individuales.

## Pantalla 5: Mapa de brechas

**Qué ve.** Las UV coloreadas por prestaciones cada 1.000 habitantes. **Más intenso significa menor cobertura relativa.** A la derecha, las 5 UV de menor cobertura y una tabla con todas.

**Cómo leerlo.** Indica dónde mirar; no reemplaza el criterio de los equipos municipales. Una UV con pocas prestaciones puede tener menos necesidad, no menos cobertura. La población por UV viene del Censo 2024 (INE).

## Guion para la demo de 5 minutos

El guion de la demostración está en [guion-demo.md](guion-demo.md).

## Próximas etapas

- **Consultas en lenguaje natural** (componente opcional 5 del SOW): preguntar, por ejemplo, «¿cuántas ayudas sociales hubo en Amanecer este año?» y obtener la respuesta sobre los datos asignados.
- **Validación de las capas con el municipio:** reemplazar los límites referenciales de UV y macrosectores por la capa oficial.
- **Despliegue con URL pública** para el piloto.

## Preguntas frecuentes

**¿Qué pasa si el sistema se equivoca?**
Está diseñado para dudar antes que equivocarse: lo incierto va a revisión en vez de asignarse. Aun así puede haber errores silenciosos (asignaciones con confianza alta o media a una UV incorrecta). El informe del benchmark los mide y los informa. Si detecta uno, revise el motivo del registro; las asignaciones aproximadas (media) deben tomarse como orientación.

**¿Dónde quedan mis datos?**
Los resultados y las correcciones quedan solo en su navegador, en este equipo. No hay servidor de datos ni cuenta de usuario; si borra los datos del sitio, se pierden. Para ubicar cada dirección, el servidor de la aplicación la consulta en Nominatim (OpenStreetMap); si hay clave configurada, el texto también se envía al modelo de lenguaje. Por eso no debe cargar nombres, RUT ni teléfonos.

**¿Funciona sin internet?**
No del todo. El mapa base necesita internet. La ubicación de direcciones también consulta un servicio externo. Lo que corre en el navegador (lectura de la planilla, tablas, filtros, correcciones, resultados ya guardados) no requiere conexión, pero sin mapa base los mapas no se ven completos.

**¿Qué pasa si cierro la ventana?**
El último lote y las correcciones siguen en el navegador al volver a abrir. Procesar un lote nuevo reemplaza el anterior.

**¿Puedo usarlo con datos reales?**
Todavía no con prestaciones reales. Los límites de UV son referenciales y deben validarse con el municipio, y cargar prestaciones reales requiere evaluar la normativa chilena de protección de datos personales.
