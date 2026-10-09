---
name: database-data-change
description: "Implementa backfills, reparaciones, transformaciones o eliminaciones de datos con alcance, prechecks, validación y recuperación verificables."
---

# Database Data Change

Entregar cambios de datos con alcance verificable y el contrato SQL corporativo.

## Restricciones y convenciones

- Consultar `database/data-change-safety.md`, `manual-sql-execution.md` y las
  convenciones de auditoría/ciclo de vida aplicables.
- Entregar por defecto un único SQL literal en `database/backfills/` o
  `database/repairs/`, conforme a `sql-artifact-layout.md` y `sql-change-delivery.md`.
  Separar prechecks, aplicación y validación; identificar población esperada.
- No ejecutar contra datos compartidos o productivos sin autorización específica,
  ni prometer rollback que no conserve la integridad.
- Una reparación crítica debe dejar evidencia del conjunto, motivo, responsable y
  resultado según `development/logging.md`, sin copiar datos sensibles a la salida.
  En un SQL manual, esa evidencia puede ser un registro de ejecución controlado,
  distinto de los datos de negocio y sin inventar una plataforma nueva.

## Resultado esperado

Artefacto, población/efectos esperados, evidencia de validación y recuperación o
reanudación aplicables. El modelo decide filtros, lotes y fronteras transaccionales
dentro de los controles de la Policy.
