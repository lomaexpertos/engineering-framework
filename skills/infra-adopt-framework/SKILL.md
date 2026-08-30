---
name: infra-adopt-framework
description: "Migra un repositorio legado al layout infra/deploy, consolidando ambientes, manifests, documentación y automatización. No usar para cambios aislados ni deployments."
---

# Infra Adopt Framework

Convertir infraestructura legada en una estructura corporativa única y trazable.

## Fase de evaluación

1. Leer `AGENTS.md`, Policies de infraestructura y documentación vigente.
2. Inspeccionar en modo read-only todas las rutas, ambientes, scripts, Compose,
   configuración, secretos, edge, cron, CI y runbooks existentes.
3. Construir una matriz con ruta actual, responsabilidad, referencias, destino
   canónico y clasificación: conforme, desviación o cambio propuesto.
4. Detectar entrypoints rivales, archivos huérfanos, estado versionado y operaciones
   privilegiadas o externas.

## Plan obligatorio

Antes de mover archivos, documentar alcance, no-alcance, árbol objetivo, matriz de
migración, dependencias, fases, validación, compatibilidad, rollback y aprobaciones
necesarias. Una evaluación o un plan no autorizan la ejecución.

## Implementación autorizada

1. Crear solo ambientes y capacidades reales bajo `infra/deploy/`.
2. Mantener una única ruta documentada para cada deployment.
3. Crear `deployment.yaml` y automatización mediante
   `implement-deployment-automation` cuando corresponda.
4. Clasificar configuración, secretos y runtime antes de reubicar archivos.
5. Actualizar referencias de código, CI y documentación en la misma fase que la ruta.
6. Retirar artefactos heredados solo después de probar que no tienen consumidores.
7. Validar cada fase y conservar una ruta de reversión hasta terminar la adopción.

## Prohibiciones

No ejecutar deployments, rotar credenciales, descifrar secretos, cambiar servicios
externos ni crear carpetas vacías para capacidades inexistentes.

## Entrega

Conservar trazabilidad entre matriz y cambios, y reportar validaciones, desviaciones
aceptadas, operaciones no ejecutadas y pendientes.
