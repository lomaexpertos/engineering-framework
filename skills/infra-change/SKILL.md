---
name: infra-change
description: "Modifica infraestructura ya adoptada: Compose, configuración, scripts, manifests, salud o recursos. No migra todo el layout, gestiona secretos ni despliega."
---

# Infra Change

Modificar infraestructura existente sin ampliar silenciosamente el alcance operativo.

## Contexto

1. Leer `AGENTS.md`, el router de infraestructura y las Policies del componente
   afectado.
2. Inspeccionar documentación, layout, ambientes, manifests, scripts, configuración,
   checks y referencias existentes.
3. Identificar owner, consumidores, estado mutable y operaciones externas relacionadas.
4. Separar hechos observados, cambio solicitado y acciones que requieren autorización.

## Routing

- Migración completa al layout corporativo: `infra-adopt-framework`.
- Scripts o contratos de deployment: `implement-deployment-automation`.
- Alta, rotación o retiro de secretos: `manage-secrets`.
- Ejecución de un deployment: fuera del alcance de esta Skill.

## Workflow

1. Definir alcance, no-alcance, ambientes y unidades afectadas.
2. Evaluar compatibilidad, blast radius, rollback y estado coexistente.
3. Reutilizar módulos, convenciones y entrypoints existentes antes de crear otros.
4. Implementar el cambio mínimo en fuentes versionadas; no alterar servicios externos.
5. Actualizar manifests y documentación cuando cambien contratos u operación.
6. Ejecutar validaciones estáticas, linters y pruebas locales seguras disponibles.
7. Confirmar que no se escribieron secretos, estado runtime ni artefactos generados.

## Entrega

Reportar archivos modificados, ambientes afectados, validaciones, operaciones no
ejecutadas, rollback previsto y riesgos pendientes.
