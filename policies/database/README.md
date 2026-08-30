# Database policies router

Consulta este dominio antes de modificar estructura, datos persistentes o desempeño
de una base de datos.

## Routing

- Nombres de tablas e identificadores: [`schema-conventions.md`](schema-conventions.md).
- Auditoría y eliminación de registros:
  [`record-lifecycle.md`](record-lifecycle.md).
- Forma de entregar migraciones, backfills o reparaciones:
  [`sql-change-delivery.md`](sql-change-delivery.md).
- Compatibilidad entre base de datos y versiones desplegadas:
  [`deployment-compatibility.md`](deployment-compatibility.md).

## Planned coverage

- Evolución versionada: `migrations.md`.
- Eliminación o transformación irreversible: `destructive-changes.md`.
- Acceso y desempeño: `indexes.md`.
- Restricciones y consistencia: `data-integrity.md`.
