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

Las preguntas de negocio, otros sistemas o deber ser se responden en conversación.
Analizar un módulo del repositorio actual permite investigar y documentar su AS-IS
con `spec-documentar`, respetando «solo analiza» o «sin archivos». El
[conocimiento de dominios](docs/architecture/domain-knowledge.md) relaciona reglas,
frontend, backend, datos y dependencias para futuros cambios.

`AGENTS.md` es un router de hasta 100 líneas. Cada tarea consulta solo los dominios
pertinentes. El coordinador elige recorrido con
[entrega proporcional](policies/ai-assisted-development/proportional-delivery.md):
mínimo puede ejecutarse directamente sin expediente; estándar usa un trabajador y
un revisor funcional agrupado; reforzado conserva el flujo completo por riesgo.
Siempre integra y verifica el resultado, con continuidad cuando se necesita.

El cierre es compacto en mínimo/estándar y completo en reforzado. Consolida
conocimiento significativo y continuidad sin actualizaciones por casilla.
El conocimiento duradero no depende de specs, ramas,
reportes ni evidencia de ejecución. Los expedientes cerrados se conservan sesenta
días y después pueden purgarse explícitamente con comprobaciones y recuperación.
No se instala un scheduler.

Una fuente de skills genera las copias de Codex y Claude Code. Las capacidades de
subagentes y descubrimiento dependen del cliente; las limitaciones se declaran sin
simular revisiones independientes.

El [ejecutor de agentes](docs/architecture/agent-execution.md) separa requisitos
versionados del equipo y perfiles personales. Una sesión coordinadora puede delegar
en clientes configurados mediante encargos y entregas verificables; diagnóstico,
permisos y revisión conservan sus límites explícitos.

El harness opera con Node.js 22 o 24 nativo, Bash y Git, sin dependencias npm ni instalación
automática en el host. Builds, tests y linters del producto se ejecutan dentro de
Docker; los checks declarados requieren además Docker y GNU `timeout`.

## Distribución

La versión 3.x requiere Node.js nativo y aceptación MAJOR desde 2.x; conserva el
layout introducido en 2.x. Cada operación fija un SHA antes de validar/aplicar. La actualización conserva
extensiones, documentación, memoria y cambios ajenos al contenido administrado.
No crea commits, push, PR ni altera rama o índice del consumidor.

Las actualizaciones se solicitan explícitamente. GitHub Actions y el canal central
permanecen suspendidos; un push no publica ni actualiza consumidores.
La disponibilidad pública de una revisión depende de su publicación por el mantenedor.
