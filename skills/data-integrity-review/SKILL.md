---
name: data-integrity-review
description: "Audita pagos, saldos, inventario, folios, webhooks o estados críticos frente a concurrencia, duplicados, reintentos y fallas parciales."
---

# Data Integrity Review

Entregar una revisión focalizada de las garantías de datos del proyecto.

## Contrato de revisión

- Aplicar `development/domain-integrity.md`, `concurrency-and-idempotency.md`
  y las Policies de base de datos pertinentes. El modelo elige la técnica de análisis.
- Un hallazgo debe identificar secuencia concreta, invariante, escritores plausibles,
  protección existente e impacto; no exigir locks o coordinación distribuida por receta.
- Comprobar logging crítico según `development/logging.md`; los eventos no sustituyen
  ledger, estado transaccional o auditoría durable.
- No corregir durante una auditoría, ejecutar cambios productivos ni generar efectos
  externos sin una solicitud y autorización independientes.
- Mantener alcance focalizado; no exigir una auditoría de rama completa por tocar datos.

## Resultado esperado

Hallazgos ordenados por pérdida o doble efecto, evidencia, control esperado y escenarios
pendientes. Distinguir defectos confirmados de riesgos no comprobados.
