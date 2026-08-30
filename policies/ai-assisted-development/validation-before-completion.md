# Validation before completion

## Requirements

1. El agente **MUST** verificar el resultado antes de declararlo terminado con controles proporcionales al riesgo y al alcance.
2. La validación **MUST** incluir evidencia observable del comportamiento o estructura modificados, no solo ausencia de errores durante la edición.
3. Validaciones no ejecutadas, fallas preexistentes y limitaciones del entorno **MUST** reportarse con claridad.
4. El agente **MUST NOT** afirmar que una prueba, build, deployment o comprobación pasó si no fue ejecutada o su resultado no pudo observarse.
5. Antes del cierre **SHOULD** revisarse el diff o artefacto final para detectar cambios incidentales, secretos y documentación desactualizada.
