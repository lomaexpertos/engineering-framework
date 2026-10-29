---
name: coordinate-work
description: Coordina una entrega mínima, estándar o reforzada según riesgo; delega y retoma trabajo con ownership y contexto acotados cuando el recorrido lo requiere.
---

# Coordinate Work

Conservar responsabilidad de entrega según
`ai-assisted-development/proportional-delivery.md`, `coordination.md` y
`memory-and-continuity.md`. El coordinador elige el recorrido sin pedir al usuario
que clasifique la tarea. Mínimo permite ejecución directa sin expediente ni perfiles.

## Operación instalada

Cargar sólo la referencia de la operación actual; los ejemplos se ejecutan desde
la raíz del consumidor con `.harness/` instalado.

- Primera ejecución, perfiles personales o nueva iniciativa:
  [profiles-and-start.md](references/profiles-and-start.md).
- Ejecución mínima o estándar, sin definición por defecto:
  [delivery-tracks.md](references/delivery-tracks.md).
- Ciclo reforzado, preguntas, hallazgos y escalamiento:
  [workflow-operations.md](references/workflow-operations.md).
- Encargo individual, worktree, recogida o recuperación de procesos:
  [individual-tasks.md](references/individual-tasks.md).

## Contrato

- Identificar solicitud, recorrido y estado real; leer contexto existente pertinente.
  No crear memoria, preguntas, spec ni plan para una tarea clara por trámite.
- Antes de usar el ejecutor, diagnosticar solo los roles necesarios: mínimo usa
  `bash .harness/agents.sh doctor --roles implementation`; estándar añade
  `functional`, y `definition` solo si se activa. Reforzado diagnostica sus roles
  requeridos. Si falta configuración personal, orientar `setup`; no elegir proveedor,
  credenciales o modelos implícitamente. Mínimo directo no necesita ejecutor ni perfiles.
- Mantener alcance, dependencias y decisiones transversales. Encargar ejecución y
  revisión con objetivo, exclusiones, ownership, referencias mínimas, permisos,
  validación y resultado esperado; no copiar conversaciones completas.
- Registrar encargos/resultados del ejecutor bajo `agents/<task-id>/`. Estado
  estructurado mantiene tareas/ownership; crear resumen separado solo si ayuda a
  continuar, sin duplicar docs.
- Un escritor por archivo. Serializar integración compartida; usar entrega/worktrees
  según capacidades reales. Una capa y dos trabajadores simultáneos son el presupuesto
  inicial ajustable, no obligación de paralelizar.
- Inspeccionar resultados y verificar integración. Un trabajo de alto riesgo conserva
  revisión independiente pendiente si no pudo obtenerse; no inventar otro revisor.
- En estándar, un revisor funcional agrupa las dimensiones afectadas sobre la
  misma versión; reforzado conserva encargos independientes por riesgo. Mínimo
  requiere comprobación del coordinador y evidencia, sin revisores adicionales.
- Agrupar preguntas materiales y registrar sus respuestas en el encargo. Actualizar
  memoria cuando cambie conocimiento significativo o continuidad pendiente.
- Si falta capacidad para revisión requerida, declararla pendiente. No ampliar
  permisos ni invocar servicios/modelos externos implícitamente.
- Pausas y cambios de sesión dejan un punto de reanudación. Para un expediente,
  usar `close-initiative` con cierre compacto o completo según recorrido.

## Resultado

Resultado integrado verificable, ownership resuelto y pendientes visibles;
continuidad y evidencia proporcionales, sin confundir cierre con despliegue.
