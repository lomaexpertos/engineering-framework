---
name: spec-implementar
description: Implementa una spec planificada bajo engineering/specs/ con trazabilidad, Policies, pruebas y actualización documental. No resuelve silenciosamente decisiones abiertas.
---

# Spec Implementar

Ejecutar una spec y su plan con cambios seguros, localizados y trazables. Mantener la evidencia de implementación en `engineering/specs/<slug>/implementation/` y delegar la documentación permanente del módulo a `$spec-documentar`.

## Entradas

Leer:

- `spec.md` y, cuando existan, `as-is.md`, `best-practices.md`, `brechas.md`, `preguntas.md`, `checklist.md` y clarificaciones;
- `plan/plan.md`, `plan/tasks.md` y `plan/test-plan.md`;
- `engineering/architecture/index.md` y snapshots relevantes;
- documentación y convenciones locales necesarias.

Si faltan `spec.md`, `plan/plan.md` o `plan/tasks.md`, detenerse y reportar la ruta. `preguntas.md` y `checklist.md` son opcionales, pero deben leerse cuando existan. Si falta `test-plan.md`, solicitar completar el plan para riesgo medio/alto; en un cambio pequeño, derivar pruebas seguras y registrar la brecha en la revisión.

Identificar el módulo desde la spec, el plan y el código, no únicamente desde el slug. Si no existe un índice arquitectónico, continuar con descubrimiento proporcional y registrar la brecha; no inventar documentación previa.

## Fronteras y ownership

- Escribir trazabilidad propia únicamente en `engineering/specs/<slug>/implementation/`.
- No modificar la spec o el plan para hacerlos coincidir retrospectivamente; registrar desviaciones.
- Leer `engineering/architecture/` como contexto. Escribir ahí sólo mediante `$spec-documentar` cuando corresponda.
- Preservar cambios ajenos y revisar Git antes de editar archivos que ya tengan modificaciones.
- No ampliar el alcance funcional sin autorización.

## Validar antes de implementar

Comparar AS-IS, Best Practices, brechas, spec, preguntas, checklist, plan, tareas, pruebas y arquitectura. Bloquear sólo ante problemas capaces de cambiar la solución o volverla insegura, por ejemplo:

- preguntas materiales pendientes;
- RF críticos sin cobertura;
- brechas de implementación aprobadas sin RF, tareas o pruebas;
- recomendaciones de Best Practice tratadas como alcance sin decisión TO-BE;
- contradicciones entre aceptación, plan y pruebas;
- omisiones de seguridad, datos, permisos, invariantes o compatibilidad;
- tareas con dependencias imposibles;
- migraciones o efectos externos sin estrategia segura.

Registrar como riesgo o supuesto los huecos menores que permitan continuar con una decisión segura y reversible.

## Implementar

1. Crear `implementation/` cuando haga falta.
2. Leer las Policies aplicables y activar `$implement-feature` o la Skill focalizada de UI, integración distribuida, estado crítico, performance u observabilidad según el trabajo real.
3. Activar `$database-schema-change`, `$database-data-change`, `$database-routine-change` u `$optimize-database-query` para trabajo SQL según su efecto. Cuando se solicite SQL literal manual, guardarlo bajo `database/migrations/`, `database/backfills/`, `database/repairs/` o `database/routines/` según su propósito; no convertirlo en migration de framework.
4. Implementar tareas según sus dependencias; usar fases aprobadas sin ocultar RF pendientes.
5. Mantener arquitectura, contratos y estilo del repositorio; modernizar legacy de forma incremental.
6. Registrar decisiones no previstas y desviaciones relevantes.
7. Ejecutar las pruebas y validaciones del plan; documentar omisiones y riesgo residual.
8. Revisar permisos, datos, concurrencia, errores, contratos y regresiones según el riesgo.
9. Usar `$branch-quality-review` para una entrega, PR o cambio de riesgo medio/alto y reutilizar exactamente el slug del expediente. En cambios pequeños, realizar una revisión proporcional. Si no existe una rama o base apta, documentar una revisión manual equivalente y la limitación.
10. Actualizar la trazabilidad de implementación usando [artefactos.md](references/artefactos.md).
11. Invocar `$spec-documentar` si el resultado cambia materialmente flujos, estados, invariantes, modelo de datos, APIs, eventos, jobs, permisos o dependencias.

Si una tarea no puede completarse con seguridad, dejarla pendiente con motivo, impacto y siguiente acción. No declarar implementada una fase incompleta.

Clasificar como pequeño un cambio localizado sin alteración de contrato, datos, permisos ni dependencias entre módulos. Considerar medio un cambio acotado que toque contratos, persistencia, permisos, migraciones o asincronía. Tratar como alto el trabajo sobre dinero, nómina, fiscalidad, seguridad crítica, múltiples dominios, datos irreversibles o eventos durables con impacto operativo.

## Trazabilidad proporcional

Crear `implementation-review.md` cuando la implementación haya comenzado. Si se bloquea antes de tocar código, reportar el bloqueo sin generar artefactos vacíos. Crear además, cuando se cumpla cualquiera de las condiciones indicadas:

- `resumen-ejecutivo.md` para cambios de impacto medio/alto, con audiencia de negocio o cuando el usuario lo solicite;
- `resumen-extenso.md` para cambios complejos, transversales, de alto riesgo o cuando el usuario lo solicite;
- `progreso.md`, `desviaciones-plan.md`, `decisiones-implementacion.md`, `pruebas.md` o `pendientes.md` sólo si contienen información que no cabe claramente en la revisión.

No producir documentos vacíos ni repetir la misma narrativa en varios archivos. `plan/tasks.md` permanece como plan aprobado; registrar ejecución en `implementation/`.
Los reportes creados por `$branch-quality-review` pertenecen a `engineering/quality-review/`; referenciarlos desde la revisión sin tratarlos como trazabilidad propia ni duplicarlos.
Los SQL ejecutables pertenecen a `database/`; desde `implementation/` registrar sólo sus rutas, orden, resultados, evidencia y limitaciones, sin duplicar el contenido.

Mantener `as-is.md`, `best-practices.md` y `brechas.md` como evidencia de definición. No reescribirlos retrospectivamente para que coincidan con la implementación; registrar cambios de alcance, decisiones tardías y desviaciones dentro de `implementation/`.

## Actualizar conocimiento permanente

La arquitectura documentada acelera el trabajo, pero debe verificarse en las zonas cambiadas. Después de implementar:

- crear un snapshot con `$spec-documentar` cuando el comportamiento estable haya cambiado materialmente, reutilizando el slug fechado de la spec cuando corresponda a la misma iniciativa;
- actualizar `engineering/architecture/index.md` para señalar la documentación vigente;
- no generar un snapshot por cambios cosméticos, refactors internos sin efecto o documentación exclusivamente transitoria;
- si no es posible documentar de forma segura, registrar el pendiente y el alcance que debe revisarse.

Si el cambio es transversal, crear mediante `$spec-documentar` un expediente por cada módulo que sea autoridad del comportamiento modificado y enlazar sus dependencias. Derivar cada slug desde la misma fecha y un nombre descriptivo que distinga el módulo; reutilizar exactamente el slug de la spec sólo cuando un único expediente represente correctamente la unidad documentada. Usar un snapshot compartido únicamente si el repositorio ya trata ese dominio como una unidad. Si `$spec-documentar` no está disponible, no improvisar su formato: registrar la actualización pendiente.

Si se reanuda el mismo slug, actualizar `implementation-review.md` preservando evidencia todavía válida y corrigiendo estados obsoletos; usar Git como historial en vez de duplicar revisiones fechadas.

## Cierre

Antes de responder:

- confirmar la consistencia inicial o las desviaciones aceptadas;
- relacionar brechas aprobadas, RF, tareas, cambios y pruebas;
- indicar pruebas ejecutadas, omitidas y resultados;
- resumir riesgos, pendientes y posibles regresiones;
- indicar si se aplicaron los estándares de código y base de datos;
- indicar la revisión de calidad realizada;
- enlazar la arquitectura creada o explicar por qué no necesitó actualización;
- listar archivos modificados.
