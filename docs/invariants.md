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
| AGENTS conserva routing compacto y no excede cien líneas. | [Contexto](../policies/ai-assisted-development/context-management.md) |
| El código del proyecto se prepara, ejecuta y valida en Docker. | [Aislamiento](../policies/infrastructure/project-isolation.md) |
| El productor mantiene fuentes visibles y no se vendoriza a sí mismo. | [Decisión de arquitectura](governance/decisions/0013-project-harness.md) |
