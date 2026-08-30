---
name: add-observability
description: "Usar para incorporar o mejorar logs, métricas, trazas, health checks, dashboards o alertas que permitan detectar y diagnosticar comportamiento operativo."
---

# Add Observability

Crear señales accionables vinculadas con fallas y objetivos reales.

## Workflow

1. Identificar consumidor de la señal, pregunta operativa y acción esperada.
2. Inspeccionar logging, métricas, tracing, health checks y convenciones existentes.
3. Definir eventos, dimensiones, correlación y nivel de cardinalidad.
4. Reutilizar nombres, contextos y exporters existentes.
5. Evitar secretos, credenciales, payloads sensibles y PII innecesaria.
6. Diferenciar salud, disponibilidad, degradación y diagnóstico.
7. Diseñar alertas por síntomas accionables con owner, severidad y runbook.
8. Probar emisión, ausencia de duplicados y comportamiento de fallo de la telemetría.
9. Verificar costo, volumen y cardinalidad antes de ampliar cobertura.
10. Actualizar documentación y paneles cuando cambie el contrato de señales.

## Entrega

Relacionar cada señal con su propósito, umbral o consulta, validación y respuesta
operativa esperada.
