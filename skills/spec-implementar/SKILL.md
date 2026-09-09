---
name: spec-implementar
description: Ejecuta una especificación ya planeada bajo engineering/specs/, implementando y validando el comportamiento aprobado. Usar cuando el usuario pida implementar un slug existente; no usar para cambios ad hoc que no siguen este flujo de especificación.
---

# Spec Implementar

Implementar el cambio completo más sencillo que cumpla la spec y su plan, preservando
el alcance, la arquitectura y las convenciones del repositorio.

## Entradas y límites

- Leer `engineering/specs/<slug>/spec.md` y `plan/plan.md`; leer los demás artefactos
  del slug sólo cuando existan y sean relevantes.
- Consultar `engineering/docs/` para entender el estado vigente del módulo y detectar
  qué documentación quedará desactualizada.
- Si falta la spec o el plan, reportar la ruta esperada antes de modificar código.
- Preservar cambios ajenos y no ampliar el alcance funcional sin autorización.
- Guardar cualquier trazabilidad propia únicamente en
  `engineering/specs/<slug>/implementation/`.

Si la implementación revela que el comportamiento aprobado debe cambiar
materialmente, no esconderlo como desviación técnica: resolver primero la decisión y
actualizar la definición y el plan correspondientes. Una decisión técnica localizada
puede registrarse sin reabrir la spec cuando no altera su comportamiento observable.

## Implementar y validar

1. Confirmar el estado del repositorio y las áreas directamente afectadas.
2. Implementar las tareas respetando sus dependencias y las convenciones
   especializadas aplicables al código o los datos.
3. Mantener compatibilidad, seguridad, integridad y operación en proporción al riesgo
   real.
4. Ejecutar las validaciones relevantes del plan y ampliar la revisión sólo cuando un
   fallo o el riesgo lo justifiquen.
5. Registrar las pruebas omitidas, pendientes y desviaciones materiales sin declarar
   completa una entrega incompleta.

No activar automáticamente una auditoría completa de rama ni generar reportes
adicionales. Esas revisiones corresponden cuando el usuario prepara una entrega, las
solicita o una Policy externa las exige.

## Trazabilidad y documentación final

Crear `implementation/implementation.md` sólo cuando el repositorio, el plan, la
complejidad o el usuario requieran evidencia persistente. Concentrar allí cambios
principales, decisiones técnicas, validaciones y pendientes; no repartir la misma
narrativa entre múltiples resúmenes y bitácoras.

Después de validar el comportamiento, actualizar la documentación canónica con
`$spec-documentar` cuando:

- el plan incluya esa tarea;
- el usuario solicite la documentación final del módulo; o
- el cambio deje desactualizada una explicación vigente de negocio o técnica en
  `engineering/docs/`.

No hacerlo por cambios cosméticos o internos sin efecto documentable y no presentar
como vigente comportamiento que aún no esté implementado o validado.

Al cerrar, resumir el resultado, las validaciones ejecutadas, los riesgos o pendientes
reales, la documentación canónica actualizada y los archivos modificados.
