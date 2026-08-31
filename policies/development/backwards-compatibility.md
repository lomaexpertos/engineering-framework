# Backwards compatibility

## Requirements

1. Antes de cambiar un contrato **MUST** identificarse productores, consumidores, versiones coexistentes y ventana de transición.
2. APIs, eventos, archivos, configuración y formatos persistidos **SHOULD** evolucionar de forma aditiva cuando sea razonable.
3. Un cambio incompatible **MUST** tener aprobación explícita, versión o corte identificable, migración de consumidores y estrategia de recuperación.
4. Un campo o comportamiento deprecado **MUST** conservar ownership, plazo y evidencia de uso antes de retirarse.
5. Compatibilidad aparente que cambie semántica, unidad, default o autorización **MUST NOT** presentarse como cambio compatible.
6. La coexistencia entre versiones **MUST** probarse cuando rollout y rollback puedan ejecutar simultáneamente contratos distintos.
