# Infrastructure repository layout

## Purpose

Establecer una estructura predecible para infraestructura sin organizarla por
tecnología ni crear capacidades que el proyecto no utiliza.

## Requirements

1. La infraestructura versionada **MUST** tener una única ruta de entrada documentada.
2. Cuando se adopte el layout corporativo, los artefactos operativos **MUST** agruparse
   por ambiente bajo `infra/deploy/`, no en directorios hermanos por tecnología como
   `infra/docker/`, `infra/terraform/` o `infra/nginx/`.
3. Un directorio tecnológico **MUST** vivir dentro del ambiente cuyo ciclo de vida
   atiende.
4. `production/`, `local/` y `preview/` **MAY** existir según las capacidades reales
   del repositorio. Un ambiente inexistente **MUST NOT** representarse mediante una
   carpeta vacía.
5. Directorios como `compose/`, `config/`, `scripts/`, `edge/`, `cron/`, `secrets/` y
   `runbooks/` **MUST** crearse solo cuando exista la capacidad correspondiente.
6. `edge/` **MUST** identificar explícitamente la tecnología que controla proxy, DNS,
   TLS o tráfico.
7. `runbooks/` **SHOULD** reservarse para procedimientos que requieren secuencia,
   precauciones o recuperación y no pueden expresarse con seguridad mediante un
   comando autocontenido.
8. Archivos y directorios propios del framework **SHOULD** usar lowercase kebab-case.

## Documentation contract

Cada repositorio con infraestructura **MUST** mantener:

- un mapa de ambientes, tecnologías y rutas de entrada;
- un README por ambiente existente con prerrequisitos, operación, validación y límites;
- un manifest productivo cuando despliegue servicios propios;
- runbooks para operaciones de riesgo o recuperación que requieran pasos manuales.

La documentación del proyecto **MUST NOT** duplicar texto normativo. Debe describir su
realidad y enlazar la Policy corporativa aplicable.

## Adoption

Adoptar este layout **MUST NOT** interpretarse como autorización para ejecutar la
migración. Evaluación, planeación y ejecución deben cumplir
[`../ai-assisted-development/infrastructure-change-safety.md`](../ai-assisted-development/infrastructure-change-safety.md).
