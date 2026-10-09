---
name: spec-implementar
description: Ejecuta una especificación ya planeada bajo engineering/specs/, implementando y validando el comportamiento aprobado. Usar cuando el usuario pida implementar un slug existente; no usar para cambios ad hoc que no siguen este flujo de especificación.
---

# Spec Implementar

Entregar la spec aprobada y su plan dentro de las convenciones del proyecto.

## Entradas y límites

- Leer `engineering/specs/<slug>/spec.md` y `plan/plan.md`; otros artefactos y docs
  solo si son relevantes. Si falta una entrada, señalar su ruta antes de editar código.
- Respetar dependencias y contratos; el modelo decide cómo implementar y validar.
  Preservar cambios ajenos y no ampliar alcance funcional sin autorización.
- Aplicar `development/logging.md` a operaciones críticas desde el cambio, aunque
  la spec no enumere cada evento. No entregar el flujo dejando su logging para después.
- Un cambio material al comportamiento aprobado requiere resolver la decisión y
  actualizar definición/plan; una decisión técnica localizada no necesita reabrirlos.
- No activar una auditoría de rama o generar reportes auxiliares automáticamente.

## Trazabilidad y documentación

Guardar evidencia propia solo en `engineering/specs/<slug>/implementation/`.
Crear `implementation/implementation.md` únicamente por contrato, plan, complejidad
o solicitud; concentrar allí decisiones, validaciones y pendientes.

Después de validar, usar `spec-documentar` si el plan lo incluye, el usuario pide
documentación final o el cambio deja desactualizada la explicación canónica.
No documentar como vigente comportamiento no validado ni por cambios cosméticos.

## Resultado esperado

Comportamiento aprobado y evidencia proporcional, incluido logging crítico.
Declarar validaciones omitidas, desviaciones y pendientes sin afirmar una entrega completa
si falta un requisito. Informar documentación y archivos afectados.
