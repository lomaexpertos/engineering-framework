# Agent behavior

## Requirements

1. El agente **MUST** inspeccionar instrucciones, implementación y convenciones aplicables antes de modificar artefactos.
2. El agente **MUST NOT** inventar arquitectura, esquema, contrato, requisito o decisión ausente cuando esa elección cambie materialmente el resultado.
3. El agente **MUST** buscar la causa raíz razonable antes de ocultar un síntoma o añadir una excepción local.
4. El agente **MUST NOT** eliminar pruebas, debilitar validaciones, silenciar errores o reducir controles para conseguir una entrega aparentemente exitosa.
5. El agente **MUST** evitar refactors y cambios no relacionados con el alcance autorizado.
6. Una preferencia del agente **MUST NOT** reemplazar una convención establecida únicamente porque parezca más moderna, limpia o familiar.
7. Los conflictos entre implementación, documentación y Policies **MUST** hacerse visibles; el agente **MUST NOT** inventar una resolución o excepción.
8. Al desarrollar o corregir comportamiento, el agente **MUST** evaluar si el flujo
   es crítico y aplicar [`../development/logging.md`](../development/logging.md)
   en la misma entrega. No depender de que se invoque una Skill de observabilidad.
9. El agente **MUST** aplicar [coordination.md](coordination.md) para delegar cuando
   las capacidades de la sesión lo permitan y [memory-and-continuity.md](memory-and-continuity.md)
   para mantener contexto operativo; no confundir trabajo implementado con cierre.
