# Observability

## Requirements

1. Una señal **MUST** responder a una pregunta operativa o soportar una acción identificable.
2. Logs, métricas y trazas **MUST** preservar el contrato de secretos. Los datos de
   negocio **MUST** limitarse a lo necesario para reconstruir la operación, sin borrar
   hechos diagnósticos requeridos por [`../development/logging.md`](../development/logging.md).
3. Nombres, unidades, etiquetas y correlación **SHOULD** reutilizar las convenciones existentes.
4. Dimensiones de alta cardinalidad **MUST** evaluarse por costo y utilidad antes de publicarse.
5. Una alerta **MUST** tener síntoma, severidad, owner y respuesta o runbook esperados; **SHOULD** alertar por impacto observable antes que por causas especulativas.
6. La falla de telemetría **MUST NOT** provocar por defecto la pérdida del efecto de negocio, salvo que la señal sea un requisito explícito de auditoría o seguridad.
7. Cambios al contrato de señales **MUST** actualizar dashboards, alertas y documentación afectados.
8. La aplicación **MUST** permanecer desacoplada del collector y backend concretos;
   la entrega base de logs productivos usa `stdout` y `stderr`, y el runtime se encarga
   de recolectarlos.
