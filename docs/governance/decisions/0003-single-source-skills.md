# ADR-0003: Single source for Skills

- Status: Accepted
- Date: 2026-08-30

## Decision

Cada Skill corporativa tendrá una sola fuente en `skills/`. El build copiará ese
contenido a `.agents/skills/` y `.claude/skills/` en el consumidor.

## Consequences

No se aceptan ediciones manuales divergentes por agente. Incompatibilidades reales se
resolverán mediante transformación determinista o metadata compartida y documentada.
