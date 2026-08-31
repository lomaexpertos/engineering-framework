---
name: add-observability
description: "Agrega logs, métricas, trazas, salud o alertas, incluida la reconstrucción de operaciones críticas y la salida productiva stdout/stderr."
---

# Add Observability

Crear señales accionables vinculadas con fallas y objetivos reales.

## Progressive disclosure

- Para instrumentar operaciones críticas o cálculos de negocio, cargar
  [`references/business-operation-logging.md`](references/business-operation-logging.md).
- Para configurar salida productiva, Docker o `stdout`/`stderr`, cargar
  [`references/production-log-output.md`](references/production-log-output.md).
- No cargar ambas referencias si la tarea solo cubre uno de esos escenarios.

## Workflow

1. Identificar consumidor de la señal, pregunta operativa y acción esperada.
2. Clasificar si requiere señales técnicas, trazabilidad de negocio, contrato de
   runtime o una combinación, y cargar solo la referencia aplicable.
3. Consultar las Policies de logging y observabilidad aplicables.
4. Inspeccionar logging, métricas, tracing, health checks y convenciones existentes.
5. Definir eventos, dimensiones, correlación y nivel de cardinalidad.
6. Reutilizar nombres, contextos, middleware y exporters existentes.
7. Conservar los datos de negocio necesarios para explicar resultados, sin registrar
   secretos, credenciales, tokens, llaves ni payloads innecesarios.
8. Diferenciar salud, disponibilidad, degradación y diagnóstico.
9. Diseñar alertas por síntomas accionables con owner, severidad y runbook.
10. Probar emisión, correlación, ausencia de duplicados y fallo de la telemetría.
11. Verificar costo, volumen, cardinalidad y retención antes de ampliar cobertura.
12. Actualizar documentación y paneles cuando cambie el contrato de señales.

## Entrega

Relacionar cada señal con propósito, esquema, correlación, validación y respuesta
operativa esperada. Señalar qué datos se registran y por qué son necesarios.
