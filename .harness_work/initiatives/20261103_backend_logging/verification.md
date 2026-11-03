# Alcance y evidencia

Solicitud original: reforzar logs backend por stdout/stderr, captura Docker/Compose
de 50 MB diarios por diez días, Alloy del host hacia Loki asíncrono/no bloqueante y
campos útiles sin multiplicación innecesaria de labels. Solo normas y contexto;
no configurar una aplicación o infraestructura externa.

Implementación: 6ccd739. Fuentes canónicas logging.md y container-logging.md; observability,
Skills, routing e inventario de guías conectados. Invariantes y memoria actualizados.

| Requisito | Evidencia |
| --- | --- |
| Todo backend emite logs directamente por consola | Application output exige JSON por línea, severidad por stream, sin duplicación ni archivos/tail como transporte. |
| Docker/Compose homogéneo | Fragmento de Policy local, 50m, 11 archivos contando activo, compresión, non-blocking y buffer; opciones versionadas y capacidad por contenedor/réplica. |
| Diez días y volumen mínimo | Objetivo obligatorio medido, 500 MB base antes de overhead; no confundir tamaño con calendario. Retención Loki mínima separada, confirmada por responsable. |
| Alloy del host → Loki | Transporte estándar sin clientes, plugins o collectors alternativos en la aplicación; repo no instala/configura infraestructura del host por deducción. |
| Proyecto/app/endpoint consultables sin cardinalidad alta | Labels base project/app/environment; route normalizada, correlación y versión como campos consultables, query LogQL ilustrativa. |
| Contexto descubrible para agentes | Routers y Skills reforzados; recursos obligatorios y pruebas negativas de presencia/routing en checks normales. |
| No contradicción con doctor | Preparación previa y aceptación posterior separadas; revisión independiente cerrada tras corregir esa frontera. |

Pruebas dentro de engineering-harness-validation:monorepo, target validation existente,
Node 22.19.0 Alpine 3.22 por digest, sin red y fuente read-only:

- validate-framework con cambios distribuidos y VERSION sin modificar, lint-source,
  test-guide-check: aprobados; evidence/validation.log.
- Fragmento Compose extraído y parseado con parser YAML incluido: tipos string,
  driver, modo y parámetros aprobados; evidence/compose-example.log. No sustituye
  validación operativa de Docker/Compose ni prueba de retención.
- Validación final de fuente tras el ajuste doctor/aceptación: evidence/final-validation.log.

El escaneo real usa engineering-harness-validation:monorepo-security y Gitleaks 8.30.1,
archivos e índice, sin afirmar cobertura de todo el historial. Resultado en secret-scan.log.
La evidencia no demuestra ingestión real, ausencia de pérdidas, ventana de diez días
o comportamiento de un producto; no se arrancaron servicios ni se administró el host.
El cierre escribe únicamente este expediente mediante el motor del harness.
