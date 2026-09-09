# Installed Skills refactoring

> Snapshot histórico del 2026-08-30. Las decisiones modificadas por la reconciliación
> posterior se documentan en
> [`2026-09-09-skills-reconciliation.md`](2026-09-09-skills-reconciliation.md).

## Source

Skills locales analizadas el 2026-08-30:

- `spec-definir`, `spec-clarificar`, `spec-planear`, `spec-implementar` y
  `spec-documentar`;
- `branch-quality-review`;
- `engineering-code-standards`;
- `database-engineering-standards`; y
- `explorador-de-dominio`.

No se encontró una Skill instalada llamada `spec-analizar`; se creó como workflow
nuevo para separar investigación AS-IS de la definición TO-BE.

## Mapping

| Source | Resultado canónico |
| --- | --- |
| `spec-definir` | Se conserva; `spec-analizar` y `research-best-practices` aíslan análisis e investigación cuando requieren un flujo propio. |
| `spec-clarificar` | Se conserva con su contrato de artefactos y estados. |
| `spec-planear` | Se conserva con plan, tareas y estrategia de pruebas. |
| `spec-implementar` | Se conserva con trazabilidad y cierre documental. |
| `spec-documentar` | Se conserva con el mismo nombre, alcance permanente y referencias. |
| `explorador-de-dominio` | Se conserva para tutoría y evaluación de preparación; `discover-business-process` y `research-best-practices` producen salidas más acotadas. |
| `engineering-code-standards` | Se retira como Skill monolítica: normas a Policies; workflows a Skills de implementación especializadas. |
| `database-engineering-standards` | Se retira como Skill monolítica: normas a Policies de base de datos; ejecución a cuatro Skills especializadas. |
| `branch-quality-review` | Se conserva como auditoría general y router de riesgo; `security-review` y `data-integrity-review` atienden auditorías explícitamente acotadas. |

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

Conservar una capacidad no implica copiar literalmente su documento anterior. Una
regla migrada a Policy se elimina del workflow como fuente normativa y la Skill la
consulta mediante routing. El documento anterior se usa como inventario de cobertura,
no como arquitectura final.

## Criterio de nombres

Las Skills preexistentes que siguen representando el mismo workflow conservan su
nombre. Un nombre nuevo solo se introduce para un workflow realmente nuevo o más
acotado. No se traducen nombres únicamente por uniformidad estética.
