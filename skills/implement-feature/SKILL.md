---
name: implement-feature
description: "Usar para implementar una capacidad de producto de extremo a extremo cuando no exista una spec formal obligatoria. Coordina código, contratos, pruebas y documentación; deriva riesgos especializados a otras Skills."
---

# Implement Feature

Entregar comportamiento útil con el cambio mínimo completo y verificable.

## Contexto

1. Leer instrucciones, Policies y documentación del área afectada.
2. Inspeccionar implementación, contratos, datos, pruebas y convenciones similares.
3. Confirmar objetivo, alcance, criterios observables y compatibilidad requerida.
4. Clasificar riesgos: UI, datos, seguridad, integración distribuida, estado crítico,
   infraestructura y operación.

Si el cambio cruza áreas o su nivel de rigor no es evidente, leer
[references/risk-routing.md](references/risk-routing.md) antes de implementar.

Si existe una spec aprobada y planificada, usar `spec-implementar`. Para el componente
especializado del cambio, aplicar la Skill correspondiente sin duplicar su workflow.

## Workflow

1. Diseñar el cambio más pequeño que cubra caminos exitosos, errores y permisos.
2. Reutilizar abstracciones y patrones existentes antes de introducir otros.
3. Implementar verticalmente contratos, lógica, persistencia y presentación aplicables.
4. Mantener compatibilidad o documentar explícitamente el corte aprobado.
5. Añadir o actualizar pruebas proporcionales al riesgo y al defecto que evitarán.
6. Ejecutar validaciones focalizadas y después las suites razonablemente afectadas.
7. Actualizar documentación cuando cambien comportamiento, configuración o contratos.
8. Revisar el diff para eliminar cambios incidentales y datos sensibles.

## Cierre

Reportar comportamiento entregado, decisiones, archivos, pruebas, limitaciones y
validaciones no ejecutadas.
