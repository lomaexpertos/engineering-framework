# Invariantes del harness

Este índice localiza la fuente canónica; las explicaciones se mantienen allí.

| Invariante | Fuente |
| --- | --- |
| Núcleo y adaptadores generados no reemplazan conocimiento/extensiones locales. | [Ownership](architecture/consumer-contract.md) |
| Una sola fuente editable de cada skill para los clientes soportados. | [Skills](../skills/README.md) |
| La operación fija su snapshot y no cambia rama, índice ni historia del consumidor. | [Distribución](architecture/distribution.md) |
| La documentación duradera se entiende sin expedientes descartables. | [Consolidación y cierre](architecture/work-lifecycle.md) |
| Cerrar, validar y desplegar son hechos distintos; retención mínima de sesenta días. | [Ciclo de vida](architecture/work-lifecycle.md) |
| Las normas no se debilitan mediante reglas locales silenciosas. | [Precedencia](../policies/precedence.md) |
| El recorrido reduce ceremonia según riesgo sin rebajar controles intrínsecos ni pisos del proyecto. | [Entrega proporcional](../policies/ai-assisted-development/proportional-delivery.md) |
| AGENTS conserva routing compacto y no excede cien líneas. | [Contexto](../policies/ai-assisted-development/context-management.md) |
| Las aplicaciones se ejecutan en Docker; las herramientas transversales del harness admiten Node nativo. | [Aislamiento](../policies/infrastructure/project-isolation.md) |
| El productor mantiene fuentes visibles y no se vendoriza a sí mismo. | [Decisión de arquitectura](governance/decisions/0013-project-harness.md) |
| Actualizar y recuperar preserva contenido desconocido y ediciones posteriores. | [Decisión operativa](governance/decisions/0014-safe-harness-operations.md) |
| Los perfiles personales satisfacen requisitos del equipo sin relajarlos. | [Ejecución de agentes](architecture/agent-execution.md) |
| Conversación, workspace y permisos efectivos se declaran por separado. | [Ejecución de agentes](architecture/agent-execution.md) |
| Las guías necesarias se descubren y validan desde el consumidor sin checkout productor. | [Contexto operativo](../policies/ai-assisted-development/context-management.md) |
