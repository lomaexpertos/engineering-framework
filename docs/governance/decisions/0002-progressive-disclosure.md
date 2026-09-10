# ADR-0002: Progressive disclosure

- Status: Accepted
- Date: 2026-08-30

## Decision

`AGENTS.md` será un router compacto. READMEs intermedios dirigirán al agente hacia
Policies, Skills y documentación específicas según la tarea.

## Consequences

El catálogo puede crecer sin cargar contexto irrelevante permanentemente. Toda fuente
vigente y de larga vida debe quedar accesible desde un router canónico y evitar
duplicación.

Los artefactos temporales de trabajo o evidencia —como specs, planes, preguntas,
reportes, auditorías, investigaciones y timelines de incidentes— no requieren enlaces
individuales desde routers permanentes. El conocimiento que se vuelva estable debe
promoverse a su fuente canónica y quedar enlazado allí.
