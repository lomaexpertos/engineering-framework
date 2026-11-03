# Arquitectura del harness

El harness conserva continuidad de trabajo y un contrato de entrega compartido por
personas y agentes. Combina políticas, skills, herramientas de verificación y un
ciclo de vida de iniciativas, sin ser un framework de aplicación ni un motor de IA.

## Componentes y límites

| Componente | Responsabilidad |
| --- | --- |
| Fuente visible | `policies/`, `skills/`, `checks/`, `schemas/`, `templates/` y `tooling/` son fuentes editables del productor. |
| Distribución | Un snapshot identificado por versión y SHA produce contenido administrado para consumidores. |
| Adaptadores | Una fuente común de skills produce copias para Codex y Claude; no se mantienen variantes manuales. |
| Conocimiento | `docs/` conserva explicaciones, decisiones e invariantes; no se actualiza desde otro repositorio. |
| Continuidad | Memoria operativa y expedientes guardan estado, encargos y evidencia proporcional. |
| Ejecución | Wrappers Bash ejecutan el harness con Node.js 22 o 24 nativo; los checks del producto usan runners Docker declarados. |

El productor no se vendoriza a sí mismo: sus fuentes permanecen visibles y su trabajo
operativo usa la misma raíz oculta que los consumidores. La documentación de este
repositorio describe el harness, no el producto de un consumidor.

La separación evita que una actualización de metodología sobrescriba conocimiento o
reglas propias del proyecto. Instalar el harness tampoco autoriza reconciliar documentos
heredados, desplegar, crear commits o publicar una release.

## Descubrimiento progresivo

`AGENTS.md` es un router de hasta 100 líneas. Dirige a reglas, contexto estable o
continuidad según el trabajo. Los routers de dominio permiten elegir contratos y
fuentes concretas; los ejemplos y referencias extensas se cargan solo por necesidad.
No se exige leer todos los expedientes ni el catálogo completo en cada tarea.

Las preguntas de negocio, otros sistemas o deber ser se responden en conversación
sin activar una entrega por defecto. Investigar un módulo del repositorio actual
consolida su AS-IS con `spec-documentar`, salvo límites expresos de escritura.
El [contrato de conocimiento de dominios](domain-knowledge.md) explica su ubicación,
cobertura y mantenimiento incremental.

Las explicaciones vigentes permanecen útiles después de eliminar el expediente que
motivó su cambio. Las decisiones duraderas conservan razón, consecuencias y sucesor;
los reportes y bitácoras no se convierten en autoridad del sistema.

## Operación

- [Contrato consumidor](consumer-contract.md): estructura y límites de escritura.
- [Distribución](distribution.md): actualización, integridad y recuperación.
- [Continuidad y cierre](work-lifecycle.md): delegación, memoria y consolidación.
- [Instalación](../../INSTALL.md): entrada operativa para adoptar o actualizar.

Los workflows de GitHub Actions y la publicación central permanecen suspendidos.
El registro de proyectos y sus helpers conservados no activan publicación automática.
