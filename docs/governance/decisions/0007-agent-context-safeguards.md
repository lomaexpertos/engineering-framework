# ADR-0007: Agent context safeguards

- Status: Accepted
- Date: 2026-08-30

## Decision

La arquitectura de contexto de repositorios consumidores se protegerá con una Policy
canónica y dos Skills separadas:

- `configure-agent-context` inicializa, adelgaza, recablea y repara archivos propiedad
  del proyecto; y
- `audit-agent-context` inspecciona en modo read-only y produce hallazgos trazables.

La separación responde a una diferencia de autoridad y salida: auditar no concede
permiso para reescribir documentación. Ambas Skills tratan el contenido corporativo
vendorizado como generado y remiten sus divergencias al proceso de distribución.

## Consequences

- `AGENTS.md` y READMEs pueden mantenerse pequeños sin perder reglas.
- Los problemas de routing pueden revisarse sin mutar el repositorio.
- Las reglas comunes viven únicamente en `context-management.md`.
- La fase Compliance podrá automatizar enlaces, tamaños, catálogo y paridad sin
  reemplazar la evaluación semántica.
