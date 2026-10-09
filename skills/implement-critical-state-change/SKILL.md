---
name: implement-critical-state-change
description: "Implementa cambios en pagos, saldos, inventario, folios u otros estados críticos protegiendo integridad, concurrencia e idempotencia."
---

# Implement Critical State Change

Entregar transiciones críticas con integridad y trazabilidad desde su implementación.

## Contratos aplicables

- Consultar `development/domain-integrity.md`, `concurrency-and-idempotency.md` y
  `logging.md`; usar las convenciones de estado, autorización y auditoría del proyecto.
- Hacer explícitas las invariantes y garantías del cambio. El modelo elige la
  protección adecuada; no exigir locks, sagas u outbox sin una necesidad real.
- El logging crítico forma parte de la entrega: cubrir decisiones, reglas de cálculo,
  efectos, rechazo y falla conforme a la Policy, con correlación y datos permitidos.
- Los eventos no reemplazan estado transaccional, ledger ni auditoría durable.
- No ejecutar reparaciones o cambios en datos compartidos/productivos sin autorización.

## Resultado esperado

Transición implementada, evidencia de sus invariantes y del logging de éxito,
rechazo/falla y escenarios concurrentes o repetidos relevantes. Reportar garantías
reales, recuperación y pendientes operativos; no confirmar éxito parcial.
