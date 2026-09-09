# ADR-0003: Single source for Skills

- Status: Accepted
- Date: 2026-08-30

## Decision

Cada Skill corporativa tendrá una sola fuente en `skills/`. El workflow central
copiará ese contenido a `.agents/skills/` y `.claude/skills/` en el consumidor.

Repositorios personales o de incubación pueden originar propuestas, pero no son una
segunda fuente corporativa. Cuando un repositorio consumidor incluya una Skill
corporativa, una copia personal homónima no debe mantenerse activa como alternativa.

## Consequences

No se aceptan ediciones manuales divergentes por agente. Incompatibilidades reales se
resolverán mediante transformación determinista o metadata compartida y documentada.
La promoción de una Skill personal ocurre mediante un cambio versionado en este
repositorio; no mediante sincronización bidireccional de copias.
