# Database data change safety

## Requirements

1. Backfills, reparaciones y eliminaciones **MUST** definir población objetivo, conteos esperados, prechecks y validación posterior.
2. Escrituras masivas **MUST** usar filtros defensivos y **SHOULD** ser set-based; lotes **MUST** considerar locks, duración y reanudación.
3. Una operación repetible **MUST** ser idempotente o detectar de forma segura que ya fue aplicada.
4. Cambios destructivos o no reversibles **MUST** definir respaldo, roll-forward, restauración o aceptación explícita de irreversibilidad.
5. SQL de modificación **MUST NOT** ejecutarse contra un entorno compartido o productivo sin autorización explícita.
6. El borrado físico **MUST** respetar la Policy de ciclo de vida y obligaciones de retención o eliminación aplicables.
