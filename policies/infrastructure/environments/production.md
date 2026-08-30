# Production environment

## Purpose

Organizar las unidades productivas y hacer que su instalación, operación y
recuperación sean repetibles y auditables.

## Requirements

1. Producción **MUST** identificar cada unidad desplegable, su runtime, topología,
   servicios, configuración, secretos y responsable de automatización.
2. Los servicios que compartan host, red, ciclo operativo o controlador de tráfico
   **MAY** agruparse en una unidad principal.
3. Una unidad con host, aislamiento o ciclo diferente **MUST** declararse y operarse de
   forma independiente.
4. Cada unidad independiente **MUST** contar con artefacto de ejecución, configuración
   y secretos identificables, health check, automatización de instalación/actualización
   y procedimiento de recuperación.
5. La separación física en otro host **MUST NOT** utilizarse como justificación para
   mantener un deployment manual o no auditable.
6. Producción **MUST** documentar prerrequisitos, prechecks, instalación, deployment,
   estado, diagnóstico, estrategias por servicio y operaciones restringidas.
7. Archivos descifrados, locks y estado generado **MUST NOT** formar parte de las
   fuentes versionadas.

La estructura exacta puede variar por runtime, pero debe satisfacer
[`../repository-layout.md`](../repository-layout.md) y declarar sus servicios mediante
[`../deployment/manifest.md`](../deployment/manifest.md).
