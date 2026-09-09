# ADR-0008: Project artifact layout

- Status: Accepted
- Date: 2026-09-09

## Decision

Los repositorios consumidores usarán tres namespaces de proyecto bajo `engineering/`:

- `docs/` para documentación canónica AS-IS estable por módulo;
- `specs/` para definición, planeación y trazabilidad proporcional de iniciativas; y
- `quality-review/` para evidencia temporal de revisiones.

`engineering/corporate/` seguirá reservado al contenido generado por el framework.
Las rutas `engineering/architecture/` y `engineering/project/` no se usarán para
contenido nuevo.

## Consequences

- La documentación vigente se actualiza en lugar de generar snapshots fechados; Git
  conserva su historial.
- Specs y reportes no compiten con la documentación canónica.
- El bot distribuye el contrato, pero no crea ni administra contenido del proyecto.
- Los repositorios con rutas legadas requieren una migración explícita y no deben
  mantener dos autoridades en paralelo.
