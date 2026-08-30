---
name: spec-planear
description: Convierte una spec bajo engineering/specs/ en un plan técnico, tareas y estrategia de pruebas para ERP grandes o sistemas brownfield. Usar cuando el usuario pida planear, aterrizar o descomponer una implementación, consumiendo AS-IS, Best Practices y brechas cuando existan, pero planificando únicamente el TO-BE y las brechas de implementación aprobadas.
---

# Spec Planear

Transformar una spec aprobable en un plan técnico incremental, verificable y compatible con el sistema existente. No implementar código salvo que el usuario lo pida además y se active `$spec-implementar`.

## Frontera

Escribir únicamente en `engineering/specs/<slug>/plan/`:

- `plan.md`;
- `tasks.md`;
- `test-plan.md`.

No modificar la spec padre, implementación, arquitectura ni reportes de calidad. Se permite leer `engineering/architecture/` y el repositorio como contexto.

## Entradas y contexto

Leer:

- `spec.md`;
- `as-is.md`, `best-practices.md` y `brechas.md` si existen;
- `preguntas.md`, `checklist.md` y `clarificaciones.md` si existen;
- otros documentos de decisión del slug;
- `engineering/architecture/index.md` y snapshots vigentes relevantes;
- código, esquema y pruebas sólo donde sea necesario confirmar impacto, nombres o vigencia.

Si falta `spec.md`, reportar el bloqueo. Si existen preguntas pendientes capaces de cambiar materialmente la solución, no cerrar el plan: declarar el bloqueo y recomendar `$spec-clarificar`. Las dudas menores pueden continuar como supuestos explícitos.

La arquitectura documentada es el punto de partida, no una verdad inmutable. Verificar las áreas afectadas cuando el documento esté desactualizado, no cubra el flujo o contradiga el repositorio.
Si no existe `engineering/architecture/index.md` o no contiene el módulo, derivar el límite desde la spec y el repositorio, y planear `$spec-documentar` cuando el cambio produzca conocimiento estable que convenga preservar.

## Flujo

1. Extraer objetivo, RF, reglas, aceptación, alcance, entidades, estados, permisos, integraciones, NFR, compatibilidad, riesgos, supuestos y brechas.
2. Distinguir la evidencia AS-IS, los referentes de Best Practice y las decisiones TO-BE; usar `spec.md` como autoridad del comportamiento a implementar.
3. Confirmar que cada brecha de implementación aprobada esté cubierta por RF y que las diferencias residuales contra Best Practice tengan una disposición explícita.
4. Mapear los RF contra módulos y flujos documentados.
5. Determinar cambios de código, datos, contratos, UI, operaciones y documentación; si habrá SQL literal manual, clasificarlo como migration, backfill, repair o routine y planear su ruta bajo `database/`.
6. Buscar activamente casos borde: estados inválidos, permisos, concurrencia, históricos, duplicados, nulos, tiempo, reintentos, rollback, idempotencia, integraciones caídas y regresiones.
7. Diseñar una solución incremental y reversible que respete arquitectura dominante.
8. Crear o actualizar los tres artefactos usando [artefactos.md](references/artefactos.md).
9. Incluir una tarea para `$spec-documentar` si cambiarán materialmente flujos, estados, invariantes, datos, contratos, eventos, jobs, permisos o dependencias.
10. Reportar archivos y cualquier decisión pendiente.

## Plan proporcional

Mantener `plan.md`, `tasks.md` y `test-plan.md` para cambios que llegarán a código o datos; pueden ser breves cuando el cambio sea pequeño. Si el trabajo es exclusivamente documentar el estado actual, usar `$spec-documentar` en lugar de crear un plan de implementación.

Permitir fases cuando el usuario, la spec o una restricción operativa las requiera. Cada fase debe indicar RF incluidos, dependencias, compatibilidad y condición de salida. No inventar un MVP ni recortar silenciosamente la solución.

No afirmar rutas o símbolos exactos sin verificarlos. Usar `por confirmar` únicamente cuando la confirmación pertenezca razonablemente a la implementación y no cambie el diseño.

No planear todas las recomendaciones de `best-practices.md`. Una práctica sólo entra al plan cuando fue adoptada en el TO-BE mediante un RF. Mantener las desviaciones aceptadas o diferidas como contexto y riesgo residual, no como tareas encubiertas.

## Pruebas y calidad

`test-plan.md` debe permitir aprobar o rechazar la implementación. Cubrir según riesgo:

- dominio y casos de uso;
- integración, API y contratos;
- UI, accesibilidad y estados;
- permisos y seguridad;
- datos, migración y compatibilidad;
- concurrencia, eventos y reintentos;
- regresiones, smoke y validación operativa.

Recomendar `$branch-quality-review` para entrega, PR o cambios de riesgo medio/alto, reutilizando el slug fechado del expediente. Para cambios pequeños, definir una revisión proporcional sin exigir un análisis exhaustivo de toda la rama.

## Tareas

Usar IDs `T001`, `T002` y siguientes. Cada tarea debe indicar descripción concreta, RF, dependencias, posibilidad real de paralelización y criterio de terminado. Dividir por comportamiento o frontera verificable, no por cantidad arbitraria de archivos.

Para SQL literal manual, incluir en la tarea la ruta esperada `database/<categoria>/<YYYYMMDD_nombre_descriptivo>/` y el mecanismo de ejecución. No tratar automáticamente todo SQL como migration ni ubicar el ejecutable dentro de `engineering/`.

Activar en la implementación:

- las Policies de desarrollo, seguridad, frontend o base de datos que correspondan al riesgo;
- `$implement-feature` para una capacidad general y la Skill focalizada de UI,
  integración distribuida, estado crítico, performance u observabilidad cuando aplique;
- `$database-schema-change`, `$database-data-change`, `$database-routine-change` u
  `$optimize-database-query` según el efecto SQL real;
- `$spec-documentar` para refrescar conocimiento arquitectónico material.

## Cierre

Confirmar que:

- cada RF tenga cobertura en plan, tareas y pruebas;
- cada brecha de implementación aprobada esté cubierta por RF y ninguna Best Practice no adoptada se haya convertido en tarea;
- las dependencias y el orden sean ejecutables;
- riesgos, rollback y despliegue gradual estén tratados cuando apliquen;
- la documentación arquitectónica consumida y la que deberá actualizarse queden identificadas;
- los supuestos no oculten una decisión material.
