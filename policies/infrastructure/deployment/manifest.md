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

## Formato verificable

El contrato `schema_version: 1` está definido en
[deployment.schema.json](../../../schemas/deployment.schema.json). `units` y
`services` son listas con identificadores únicos; no se admiten campos desconocidos.
`environment` es `production`. Un layout heredado puede conservar su ruta documentada
de ambiente; no se migra al activar el control. El archivo conserva el nombre
`deployment.yaml` y vive fuera de las aplicaciones.

Cada unidad declara `id`, `topology`, `runtime`, `artifact` y `automation`.
Cada servicio declara `id`, `unit`, `strategy`, `health_check`, `depends_on`,
`modifies_schema` y `migrations`. `health_check` contiene un `command` como argv
literal o una `reason` explícita de ausencia, nunca ambos. El validador no ejecuta
ese comando ni los entrypoints.

Un escritor de esquema declara `modifies_schema: true`, `migrations: external` o
`automated` y `migration_entrypoint`, que apunta al procedimiento o entrypoint
existente. Los demás declaran `false` y `none`, sin `migration_entrypoint`.
Blue/green y rolling requieren un comando de salud; blue/green requiere además
`traffic_controller`. Stateful requiere `recovery`, referencia al procedimiento de
integridad, respaldo y recuperación. Estos campos permiten comprobar las referencias;
no prueban capacidad doble, readiness real ni restauración efectiva.

Las rutas declaradas son relativas al directorio del manifest; pueden subir dentro
del repositorio para reutilizar artefactos. **MUST NOT** escapar del repositorio,
seguir symlinks ni referenciar archivos inexistentes. YAML admite un solo documento
de hasta 1 MiB, sin claves duplicadas, aliases ni tags personalizados.

Ejemplo mínimo; las rutas deben existir en el proyecto antes de validarlo:

```yaml
schema_version: 1
environment: production
units:
  - id: principal
    topology: single-host
    runtime: docker-compose
    artifact: compose/core.yml
    automation: scripts/deploy.sh
services:
  - id: api
    unit: principal
    strategy: recreate
    health_check:
      command: [curl, --fail, http://api:8080/health]
    depends_on: []
    modifies_schema: false
    migrations: none
```

## Integrity

1. Cada ruta declarada **MUST** existir.
2. Cada servicio **MUST** pertenecer a una unidad conocida.
3. Relaciones entre servicios **MUST** apuntar a identificadores existentes.
4. Unidades independientes **MUST NOT** depender implícitamente del artefacto de la
   unidad principal.
5. El manifest, los scripts, los artefactos runtime y la documentación **MUST**
   describir el mismo estado operativo.
