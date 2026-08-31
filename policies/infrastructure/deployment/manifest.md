# Deployment manifest

## Purpose

Mantener una declaración legible y verificable de unidades, servicios y estrategias
productivas.

## Location and ownership

El manifest **MUST** vivir dentro del ambiente productivo de infraestructura y
**MUST NOT** ubicarse dentro de una aplicación. Su nombre canónico es
`deployment.yaml`.

## Minimum contract

El documento **MUST** declarar:

- `schema_version` y `environment`;
- unidades con topología, runtime y artefacto de ejecución;
- servicios y la unidad a la que pertenecen;
- estrategia por servicio;
- health check o justificación explícita de su ausencia;
- controlador de tráfico cuando exista conmutación;
- relaciones de acoplamiento entre servicios;
- política de migraciones cuando el servicio pueda modificar esquema; y
- entrypoint de automatización responsable.

La política de migraciones **MUST** usar uno de estos valores:

- `none`: la unidad no ejecuta migraciones;
- `external`: otro procedimiento es responsable;
- `automated`: existe una fase automatizada y documentada.

## Integrity

1. Cada ruta declarada **MUST** existir.
2. Cada servicio **MUST** pertenecer a una unidad conocida.
3. Relaciones entre servicios **MUST** apuntar a identificadores existentes.
4. Unidades independientes **MUST NOT** depender implícitamente del artefacto de la
   unidad principal.
5. El manifest, los scripts, los artefactos runtime y la documentación **MUST**
   describir el mismo estado operativo.
