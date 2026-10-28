# Engineering Harness

Metodología compartida para conducir proyectos con agentes: contexto progresivo,
coordinación delegada, conocimiento duradero, revisión y cierre verificable.

La fuente se mantiene visible en `policies/`, `skills/`, `checks/` y `tooling/`.
El productor no instala una copia de sí mismo. Los consumidores separan:

| Ruta | Contenido y ownership |
| --- | --- |
| `.harness/core/` y wrappers | Núcleo distribuido, administrado por versión/SHA e integridad. |
| `.harness/project/` | Extensiones propias de políticas, skills y checks. |
| `docs/` | Conocimiento duradero, decisiones, invariantes y roadmap del proyecto. |
| `.harness_work/` | Continuidad, iniciativas y evidencia temporal. |

## Empezar

- Instalar, actualizar o migrar: [INSTALL.md](INSTALL.md).
- Estructura del consumidor: [CONSUMER_STRUCTURE.md](CONSUMER_STRUCTURE.md).
- Reglas por tipo de cambio: [policies/](policies/README.md).
- Contratos de trabajo: [skills/](skills/README.md).
- Arquitectura y límites: [docs/architecture/](docs/architecture/README.md).
- Decisiones y pendientes: [docs/governance/](docs/governance/README.md).
- Validaciones: [checks/](checks/README.md) y [tooling/](tooling/README.md).

## Contratos principales

`AGENTS.md` es un router de hasta 100 líneas. Cada tarea consulta solo los dominios
pertinentes. Un coordinador delega con alcance, ownership y contexto acotados cuando
el cliente lo permite; integra y verifica resultados, mantiene memoria y cierra.

El cierre consolida comportamiento real, decisiones e invariantes, avance del
roadmap y pendientes altos. El conocimiento duradero no depende de specs, ramas,
reportes ni evidencia de ejecución. Los expedientes cerrados se conservan sesenta
días y después pueden purgarse explícitamente con comprobaciones y recuperación.
No se instala un scheduler.

Una fuente de skills genera las copias de Codex y Claude Code. Las capacidades de
subagentes y descubrimiento dependen del cliente; las limitaciones se declaran sin
simular revisiones independientes.

Builds, tests y linters se ejecutan dentro de Docker. Los wrappers del host solo
orquestan infraestructura compartida: Bash, Git, Docker y utilidades generales.

## Distribución

La versión 2.x cambia el contrato del consumidor y requiere migración MAJOR desde
1.x. Cada operación fija un SHA antes de validar/aplicar. La actualización conserva
extensiones, documentación, memoria y cambios ajenos al contenido administrado.
No crea commits, push, PR ni altera rama o índice del consumidor.

Las actualizaciones se solicitan explícitamente. GitHub Actions y el canal central
permanecen suspendidos; un push no publica ni actualiza consumidores.
La disponibilidad pública de una revisión depende de su publicación por el mantenedor.
