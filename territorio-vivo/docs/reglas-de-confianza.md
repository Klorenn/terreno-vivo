# Reglas de confianza

Cada registro procesado recibe un nivel de confianza y un motivo. Las reglas están en `src/domain/confianza.ts` y se evalúan en el orden de esta tabla: la primera que se cumple decide el nivel. Principio: es preferible derivar a revisión que asignar mal.

**Alta** y **Media** asignan la unidad vecinal (UV). **Baja** no asigna nada: el registro va a la bandeja de revisión.

| # | Situación | Nivel | Motivo que se muestra (resumido) |
|---|---|---|---|
| 1 | No se obtuvo ninguna ubicación y solo hay coincidencia parcial en el diccionario | Baja | Solo coincidencia parcial en el diccionario |
| 2 | No se obtuvo ninguna ubicación, pero la dirección tiene calle | Baja | No se encontró la calle en el mapa |
| 3 | No se obtuvo ninguna ubicación, pero nombra una población, comunidad o camino que el diccionario no conoce | Baja | El lugar nombrado no está en el diccionario |
| 4 | No se obtuvo ninguna ubicación: solo referencias vagas o datos insuficientes | Baja | No se pudo ubicar |
| 5 | El punto queda fuera de la comuna o de toda UV conocida | Baja | Punto fuera de la comuna |
| 6 | La calle cae en una UV distinta a la del lugar nombrado (contradicción) | Baja | Resultado contradictorio |
| 7 | Calle y número ubicados dentro de la comuna | Alta | Calle y número geocodificados |
| 8 | Calle sin número y un lugar nombrado que el diccionario no conoce | Baja | Posible ubicación errónea |
| 9 | Calle sin número y una población, villa o comunidad del diccionario que confirma la misma UV | Media | El lugar nombrado confirma la UV |
| 10 | **Pasaje sin número** resuelto y sin lugar que lo confirme | **Baja** | Hay pasajes con el mismo nombre en varias UV |
| 11 | Calle con número, pero el mapa solo encontró la calle | Media | Ubicación a nivel de calle |
| 12 | **Calle con nombre propio sin número** | **Media** | Ubicación aproximada |
| 13 | Lugar del diccionario con coincidencia parcial | Baja | Requiere confirmación |
| 14 | Dirección corregida antes por un funcionario (UV única) | Alta | Corregida antes por un funcionario |
| 15 | **Lugar del diccionario que abarca más de una UV** | **Baja** | El lugar abarca más de una UV |
| 16 | Varias entradas del diccionario coinciden con UV distintas | Baja | Coincidencias en UV distintas |
| 17 | Coincidencia exacta en el diccionario con UV única | Alta | Coincidencia exacta con UV única |
| 18 | Ningún caso anterior | Baja | No se pudo determinar la confianza |

> **Desviación respecto de la sección 6.4 del SOW:** los lugares que abarcan varias UV y los pasajes sin número van a revisión en lugar de Media, para bajar el error silencioso de 10 % a 5 % sobre la capa real.

El error silencioso es una asignación con confianza alta o media a una UV incorrecta: el funcionario no tiene cómo notarlo. Por eso, ante la duda, el sistema prefiere la bandeja de revisión. Las cifras medidas están en la pantalla Resultados medidos (`/benchmark`).
