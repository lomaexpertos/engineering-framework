# Installed Skills refactoring

## Source

Skills locales analizadas el 2026-08-30:

- `spec-definir`, `spec-clarificar`, `spec-planear`, `spec-implementar` y
  `spec-documentar`;
- `branch-quality-review`;
- `engineering-code-standards`;
- `database-engineering-standards`; y
- `explorador-de-dominio`.

No se encontró una Skill instalada llamada `spec-analizar`; se creó el workflow nuevo
`spec-analyze` para separar investigación AS-IS de definición TO-BE.

## Mapping

| Source | Canonical Skills |
| --- | --- |
| `spec-definir` | `spec-analyze`, `spec-define`, `research-best-practices` |
| `spec-clarificar` | `spec-clarify` |
| `spec-planear` | `spec-plan` |
| `spec-implementar` | `spec-implement` |
| `spec-documentar` | `spec-documentar`, preservada con sus referencias |
| `explorador-de-dominio` | `explore-domain`, `discover-business-process`, `research-best-practices` |
| `engineering-code-standards` | `implement-feature`, `implement-ui-change`, `implement-distributed-integration`, `implement-critical-state-change`, `optimize-performance`, `add-observability` |
| `database-engineering-standards` | `database-schema-change`, `database-data-change`, `database-routine-change`, `optimize-database-query` más Policies de base de datos |
| `branch-quality-review` | `code-review`, `security-review`, `data-integrity-review` |

`debug-error` e `investigate-production-incident` completan límites que antes quedaban
mezclados con implementación, revisión u operación general.

## Decision rule

Se creó una Skill separada únicamente cuando cambia al menos uno de estos elementos:

- trigger de activación;
- resultado esperado;
- autoridad o límites de seguridad; o
- workflow y validación principales.

Las reglas transversales se trasladan a Policies. Las listas condicionales permanecen
dentro de la Skill general cuando no cambian el tipo de trabajo ni su salida.
