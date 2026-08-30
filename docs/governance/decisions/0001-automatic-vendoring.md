# ADR-0001: Automatic vendoring

- Status: Accepted
- Date: 2026-08-30

## Decision

Las releases se copiarán físicamente a cada repositorio consumidor mediante Pull
Request automatizado. No se usarán submodules ni referencias dinámicas a `main` como
mecanismo inicial.

## Consequences

Cada commit consumidor contiene exactamente lo aplicado y funciona tras `git pull`.
El framework debe generar manifests, distinguir ownership y prevenir modificaciones
silenciosas del contenido corporativo.
