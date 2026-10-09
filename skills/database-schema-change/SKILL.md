---
name: database-schema-change
description: "Crea o modifica tablas, columnas, relaciones, constraints, índices o vistas con integridad, compatibilidad y entrega SQL controlada."
---

# Database Schema Change

Entregar cambios de esquema bajo las convenciones y el contrato SQL corporativos.

## Restricciones y convenciones

- Consultar `database/schema-conventions.md`, `object-naming.md`, `record-lifecycle.md`,
  `relational-integrity.md` y `deployment-compatibility.md` según el cambio.
  Aplicar naming, identificadores y auditoría aprobados; no renombrar objetos legados
  solo para uniformarlos.
- La entrega predeterminada es un único SQL literal en `database/migrations/`,
  conforme a `sql-artifact-layout.md` y `sql-change-delivery.md`, con prechecks,
  aplicación, validación y resultados esperados.
- Usar una migration nativa solo por solicitud explícita o contrato de despliegue
  vigente; no duplicar ambos formatos por iniciativa propia.
- No ejecutar contra producción o una base compartida sin autorización específica.
- Si el cambio afecta un flujo crítico, asegurar su trazabilidad en la aplicación
  según `development/logging.md`; no volcar registros sensibles desde el SQL.

## Resultado esperado

Artefacto ejecutable en el motor real, evidencia de integridad/compatibilidad,
riesgos y recuperación aplicable. El modelo decide diseño y técnica de evolución.
