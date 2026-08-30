# Database policies router

Consulta este dominio antes de modificar estructura, datos persistentes o desempeño
de una base de datos.

## Routing

- Nombres de tablas e identificadores: [`schema-conventions.md`](schema-conventions.md).
- Nombres de PK, FK, constraints, índices, vistas y rutinas:
  [`object-naming.md`](object-naming.md).
- Auditoría y eliminación de registros:
  [`record-lifecycle.md`](record-lifecycle.md).
- PK, FK, relaciones y constraints: [`relational-integrity.md`](relational-integrity.md).
- Tipos, precisión, fechas y JSON: [`data-types.md`](data-types.md).
- Selección y validación de índices: [`indexes.md`](indexes.md).
- Forma de entregar migraciones, backfills o reparaciones:
  [`sql-change-delivery.md`](sql-change-delivery.md).
- Contrato y diferencias de ejecución SQL manual:
  [`manual-sql-execution.md`](manual-sql-execution.md).
- Ubicación y clasificación de artefactos SQL:
  [`sql-artifact-layout.md`](sql-artifact-layout.md).
- Backfills, reparaciones y cambios destructivos:
  [`data-change-safety.md`](data-change-safety.md).
- Funciones, procedimientos y triggers: [`routine-safety.md`](routine-safety.md).
- Compatibilidad entre base de datos y versiones desplegadas:
  [`deployment-compatibility.md`](deployment-compatibility.md).

## Planned coverage

- Evolución versionada: `migrations.md`.
- Retención, archivado y particionamiento: se definirán cuando exista contrato corporativo.
