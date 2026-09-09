# ADR-0009: Proportional spec workflow

- Status: Accepted
- Date: 2026-09-09

## Decision

El ciclo corporativo de una iniciativa usa cuatro Skills:

1. `spec-definir` crea y refina la definición, integrando aclaraciones posteriores.
2. `spec-planear` produce un plan proporcional.
3. `spec-implementar` ejecuta y valida el comportamiento aprobado.
4. `spec-documentar` actualiza conocimiento vigente sólo cuando el resultado material
   ya fue implementado y validado.

`spec-analizar` y `spec-clarificar` se retiran. El análisis AS-IS, Best Practices,
brechas, preguntas, tareas, pruebas y trazabilidad usan archivos separados únicamente
cuando su volumen, riesgo o audiencia lo justifiquen.

## Consequences

- `spec.md` es la autoridad del comportamiento futuro aprobado y absorbe sus
  aclaraciones, evitando narrativas paralelas.
- `plan/plan.md` es el único artefacto obligatorio de planeación.
- La trazabilidad de implementación no se crea por ceremonia.
- `engineering/docs/` describe el estado vigente y no recibe propuestas futuras.
