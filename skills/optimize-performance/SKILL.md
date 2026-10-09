---
name: optimize-performance
description: "Mejora latencia, throughput, memoria, CPU, I/O o carga mediante mediciones reproducibles. No optimiza por intuición sin un problema observado."
---

# Optimize Performance

Entregar una mejora medible sin alterar silenciosamente el comportamiento del proyecto.

## Restricciones

- Consultar `development/performance-and-resilience.md`, `backwards-compatibility.md`
  y las convenciones de medición y operación existentes.
- Conservar resultados, contratos y el logging obligatorio de operaciones críticas.
  No justificar eliminarlo, desactivarlo o muestrearlo indiscriminadamente para ganar
  rendimiento; cualquier ajuste debe cumplir `development/logging.md`.
- No introducir otra plataforma, dependencia o cambio de arquitectura fuera del alcance.
- Una consulta concreta puede usar `optimize-database-query`, sin duplicar el trabajo.
- El modelo elige la estrategia de medición y optimización; no imponer pasos de profiling.

## Resultado esperado

Comparación antes/después de la métrica acordada, evidencia de corrección y costos o
límites relevantes. No afirmar mejora cuando falta evidencia comparable.
