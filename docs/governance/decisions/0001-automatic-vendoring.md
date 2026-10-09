# ADR-0001: Automatic vendoring

- Status: Accepted
- Date: 2026-08-30

El canal central dejó de ser el único con
[`0011-assisted-installation.md`](0011-assisted-installation.md).
El 2026-10-09 se retiraron sus workflows por decisión del mantenedor; permanece
suspendido. La decisión original se conserva como evidencia de su diseño.

## Decision

Después de validar `main`, el mantenedor podrá ejecutar manualmente un workflow que
copiará físicamente la versión aplicable a cada consumidor mediante Pull Request de
una GitHub App. No se usarán submodules, referencias dinámicas a `main`, PATs
personales ni push directo a la rama protegida.

## Consequences

Cada commit consumidor contiene exactamente lo aplicado y funciona tras `git pull`.
Los detalles del workflow y del bot permanecen internos. El consumidor recibe solo
contenido corporativo, Skills duplicadas para ambos agentes y versión explícita.
