# Infrastructure health checks

## Purpose

Definir evidencia mínima para decidir si un servicio o ambiente está listo y si un
cambio puede considerarse exitoso.

## Requirements

1. Todo servicio desplegado por el repositorio **MUST** declarar un health check
   representativo o justificar explícitamente su ausencia.
2. Un health check **MUST** validar la capacidad necesaria para recibir trabajo; la
   mera existencia de un proceso o puerto **MUST NOT** asumirse como salud suficiente.
3. Readiness y liveness **SHOULD** separarse cuando el runtime pueda actuar de manera
   distinta ante falta de disponibilidad temporal y fallo permanente.
4. Los deployments **MUST** ejecutar la validación de salud antes de publicar estado
   exitoso o retirar la versión recuperable anterior.
5. Los ambientes creados o restaurados **MUST** validar sus capacidades después del
   aprovisionamiento y antes de declararse disponibles.
6. Las comprobaciones **MUST NOT** mostrar secretos ni datos sensibles en su salida.
7. Un fallo **MUST** producir diagnóstico suficiente y un código de salida inequívoco.

Esta Policy cubre salud operativa. Métricas, logs, trazas, SLO y alertamiento se
definirán posteriormente en `policies/infrastructure/observability.md`.
