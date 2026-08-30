---
name: data-integrity-review
description: "Audita pagos, saldos, inventario, folios, webhooks o estados críticos frente a concurrencia, duplicados, reintentos y fallas parciales."
---

# Data Integrity Review

Detectar caminos que puedan perder, duplicar o confirmar incorrectamente efectos.

## Workflow

1. Identificar invariantes, fuente de verdad, estados y transiciones permitidas.
2. Mapear fronteras transaccionales, locks, constraints y efectos externos.
3. Seguir cada comando desde validación y autorización hasta confirmación observable.
4. Probar mentalmente doble envío, carreras, reintentos, mensajes fuera de orden y
   crash en cada frontera.
5. Evaluar idempotencia, unicidad, deduplicación y persistencia del resultado.
6. Revisar redondeo, signo, unidades y precisión cuando existan cantidades o dinero.
7. Verificar compensación, reconciliación y recuperación de estados parciales.
8. Revisar auditoría y alertas para anomalías no prevenibles completamente.
9. Confirmar pruebas concurrentes o proponer casos reproducibles.

## Salida

Ordenar hallazgos por posibilidad de pérdida o doble efecto. Incluir secuencia concreta,
invariante violada, evidencia y control esperado. No corregir durante la auditoría salvo
solicitud explícita.
