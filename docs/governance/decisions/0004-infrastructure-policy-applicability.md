# ADR-0004: Infrastructure Policy applicability

- Status: Accepted
- Date: 2026-08-30

## Decision

1. SOPS con age es obligatorio cuando se versionan secretos productivos como
   archivos. Credenciales deliberadamente efímeras de local o preview pueden
   versionarse en texto plano cuando estén aisladas de producción.
2. El layout `infra/deploy/` aplica a repositorios que administran deployments. Su
   adopción en repositorios legados debe recomendarse y planearse sin hacer que la
   instalación del framework falle por sí sola.
3. `compose/core.yml` y `compose/standalone/` son convenciones del perfil Docker
   Compose, no requisitos para otros runtimes.
4. El sufijo `.example` puede representar un contrato o ejemplo consumidor, pero no
   debe sustituir configuración operativa real.
5. Las Policies tendrán metadata estructurada. El schema mínimo se definirá antes de
   exigirla mediante CI.
6. Las excepciones tendrán un registro estructurado que identifique como mínimo la
   Policy afectada, alcance, owner y aprobación. Su schema y ubicación canónica se
   definirán antes de automatizar su validación.

## Consequences

La aplicabilidad se determina por capacidades reales del repositorio. Distribuir el
framework no obliga a inventar ambientes, runtimes ni deployments inexistentes. La
adopción de infraestructura legada sigue siendo una operación explícita y planeada.
