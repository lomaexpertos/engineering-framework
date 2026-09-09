---
name: implement-feature
description: "Implementa una capacidad de producto de extremo a extremo sin spec formal obligatoria; coordina código, contratos, pruebas y Skills de riesgo."
---

# Implement Feature

Entregar comportamiento útil con el cambio mínimo completo y verificable.

Dentro de las Policies aplicables y el alcance autorizado, priorizar el objetivo del
usuario, después seguridad, datos, invariantes y contratos, y finalmente la solución
correcta más directa dentro de la arquitectura y convenciones existentes.

## Contexto

1. Leer instrucciones, Policies y documentación del área afectada sin cargar dominios
   que el cambio no toque.
2. Inspeccionar implementación, contratos, datos, pruebas y convenciones similares
   sólo hasta comprender el flujo y evitar una solución incompatible o incompleta.
3. Confirmar objetivo, alcance, criterios observables y compatibilidad requerida.
4. Clasificar riesgos: UI, datos, seguridad, integración distribuida, estado crítico,
   infraestructura y operación.

Si el cambio cruza áreas o su nivel de rigor no es evidente, leer
[references/risk-routing.md](references/risk-routing.md) antes de implementar.

Si existe una spec aprobada y planificada, usar `spec-implementar`. Para el componente
especializado del cambio, aplicar la Skill correspondiente sin duplicar su workflow.

## Workflow

1. Diseñar el cambio completo más sencillo que cubra caminos exitosos, errores y
   permisos directamente relacionados.
2. Reutilizar abstracciones y patrones existentes antes de introducir otros.
3. Implementar verticalmente contratos, lógica, persistencia y presentación aplicables.
4. Mantener compatibilidad o documentar explícitamente el corte aprobado.
5. Añadir o actualizar pruebas proporcionales al riesgo y al defecto que evitarán.
6. Ejecutar validaciones focalizadas y ampliar suites sólo cuando el riesgo, el plan o
   un fallo relacionado lo justifiquen.
7. Actualizar documentación canónica sólo cuando cambien materialmente comportamiento,
   configuración o contratos.
8. Revisar el diff para eliminar cambios incidentales y datos sensibles.

No activar automáticamente una auditoría completa de rama ni generar checklists o
documentos auxiliares. Usar una revisión especializada cuando el usuario prepare una
entrega, la solicite o una Policy aplicable la exija.

## Cierre

Reportar comportamiento entregado, validaciones ejecutadas y riesgos reales
pendientes. No exponer checklists internos ni generar resúmenes persistentes salvo
solicitud o contrato del proyecto.
