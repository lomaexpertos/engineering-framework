---
name: coordinate-work
description: Coordina ejecución delegada o retoma una iniciativa con alcance, ownership y contexto acotados; integra resultados sin heredar todo el historial.
---

# Coordinate Work

Conservar continuidad y responsabilidad de entrega delegando siempre que la herramienta
lo permita, según `ai-assisted-development/coordination.md` y `memory-and-continuity.md`.

## Contrato

- Identificar solicitud, expediente y estado real; leer memoria general, resumen de
  iniciativa y fuentes pertinentes. Para alcance ambiguo usar definición antes de editar.
- Mantener alcance, dependencias y decisiones transversales. Encargar ejecución y
  revisión con objetivo, exclusiones, ownership, referencias mínimas, permisos,
  validación y resultado esperado; no copiar conversaciones completas.
- Registrar encargos/resultados bajo `agents/<task-id>/`. Estado estructurado mantiene
  tareas/ownership; el resumen explica siguiente acción y bloqueos, sin duplicar docs.
- Un escritor por archivo. Serializar integración compartida; usar entrega/worktrees
  según capacidades reales. Una capa y dos trabajadores simultáneos son el presupuesto
  inicial ajustable, no obligación de paralelizar.
- Inspeccionar resultados y verificar integración. Un trabajo de alto riesgo conserva
  revisión independiente pendiente si no pudo obtenerse; no inventar otro revisor.
- Sin subagentes, declarar limitación y ejecutar en secuencia con el mismo contrato.
  No ampliar permisos ni invocar servicios/modelos externos implícitamente.
- Pausas y cambios de sesión dejan un punto de reanudación. Al terminar alcance,
  usar `close-initiative`, sin confundir implementación con cierre o despliegue.

## Resultado

Resultado integrado verificable, memoria breve actualizada, ownership resuelto y
pendientes visibles; los detalles de ejecución permanecen en el expediente.
