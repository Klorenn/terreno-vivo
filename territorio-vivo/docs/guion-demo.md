# Guion de demostración de 5 minutos

Guion para el Demo Day de Innova TemucoLab 2026. Se sacó de la página de Documentación de la aplicación para que ese documento hable solo de cómo se usa la herramienta.

**Antes de empezar:** abra el sitio en Inicio (`/`), procese la planilla de ejemplo en Resultados por lote (`/lote`) para que los mapas tengan datos y, si quiere partir de cero, borre las correcciones en la Bandeja de revisión (`/revision`). Tenga a mano un video de respaldo por si falla internet.

| Minuto | Qué hacer | Qué decir |
|---|---|---|
| 0:00 a 0:45 | Muestre Inicio. Toque el ejemplo `al lado del consultorio`. | «Las prestaciones se anotan como las dice la gente. Esta dirección no está en ningún mapa y el sistema no la inventa: queda en confianza baja.» |
| 0:45 a 2:00 | Pida al jurado una dirección como la diría un vecino y escríbala. Tenga a mano: `av alemnia 0450 dpto 3`, `pje los aromos 123 pob sta rosa`, `villa los alerces, pasaje 3, casa 12`, `comunidad juan cayunao, camino a tromén km 4, frente a la escuela`. | «El sistema corrige los errores, interpreta la dirección, la ubica y entrega UV, macrosector y confianza con su motivo.» |
| 2:00 a 2:45 | En Inicio, con el resultado de `al lado del consultorio` en confianza baja, presione «Enviar a revisión» y luego «Ir a revisarla». En la Bandeja de revisión, toque la UV correcta en el mapa y confirme con «Recordar» marcado. Vuelva a Inicio y escriba la misma expresión. | «Una dirección falla a propósito, se corrige y la segunda vez el sistema la resuelve. Cada corrección mejora el diccionario.» |
| 2:45 a 3:30 | Abra Resultados medidos (`/benchmark`). | «Resultado sobre 100 direcciones frente a un geocodificador genérico, por categoría. Las cifras se informan tal como salen.» |
| 3:30 a 4:15 | Abra Mapa territorial y luego Mapa de brechas. | «Pasamos de "dónde hay" a "dónde falta". Con población del Censo 2024. La siguiente etapa son las consultas en lenguaje natural: preguntar "¿cuántas ayudas sociales hubo en Amanecer este año?" y obtener la respuesta sobre estos mismos datos.» |
| 4:15 a 5:00 | Cierre. | «Para un piloto se necesitan capas reales de UV y macrosectores, un diccionario validado por el municipio, datos reales y una revisión de privacidad.» |

**Preguntas probables del jurado:** costo de operación, privacidad, qué pasa cuando se equivoca y cómo se integra con lo que el municipio ya usa.
