---
name: spec-plan
description: "Usar para convertir una spec aprobada en estrategia técnica, fases, tareas, pruebas y rollout. No usar para decidir requisitos pendientes ni para implementar cambios."
---

# Spec Plan

Traducir el TO-BE aprobado en una secuencia implementable y verificable.

## Preconditions

Confirmar que la spec identifica decisiones aprobadas y que ninguna pregunta material
bloquea la implementación. Planear únicamente el TO-BE, no todo el AS-IS investigado.

## Workflow

1. Consultar `engineering/architecture/index.md` y verificar snapshots vigentes del
   alcance antes de redescubrir el sistema.
2. Inspeccionar código, datos, contratos, pruebas y tooling afectados.
3. Elegir el cambio mínimo compatible con las convenciones existentes.
4. Descomponer por dependencias y estados desplegables, no por capas aisladas.
5. Asociar tareas con requisitos y criterios de aceptación.
6. Incluir migraciones, compatibilidad, observabilidad, seguridad y documentación
   cuando apliquen.
7. Definir pruebas por riesgo, prechecks, rollout, rollback y validación posterior.
8. Señalar decisiones técnicas todavía abiertas y operaciones que requieren autoridad.
9. Revisar que el plan no amplíe el alcance aprobado.

## Entrega

Seguir la convención existente; por defecto crear `plan.md`, `tasks.md` y `tests.md`
bajo `engineering/specs/<slug>/`.
