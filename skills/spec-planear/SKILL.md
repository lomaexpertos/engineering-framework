---
name: spec-planear
description: Convierte una especificación existente bajo .harness_work/initiatives/ en un plan técnico proporcional y verificable. Usar cuando el usuario pida planear, aterrizar o descomponer la implementación de un slug antes de modificar código.
---

# Spec Planear

Entregar un plan del comportamiento aprobado, sin imponer una receta de diseño.

## Ubicación y autoridad

- Leer `.harness_work/initiatives/<slug>/spec.md`; escribir solo en su carpeta `plan/`.
  Crear `plan/plan.md`; `tasks.md` y `test-plan.md` separados solo si aportan utilidad.
- `spec.md` gobierna comportamiento futuro y `docs/` el estado vigente.
  No modificar código ni documentación canónica en esta etapa.
- Si falta la spec o una decisión material, señalar la ruta o bloqueo; no inventar
  la entrada ni presentar el plan como listo.

## Contrato del plan

Cubrir enfoque y RF, áreas/contratos afectados, dependencias, compatibilidad,
recuperación, validación y supuestos pertinentes. El modelo decide diseño y
descomposición; tareas por resultado verificable, no por cantidad de archivos.
IDs `T001`, `T002` solo cuando faciliten ejecución/trazabilidad.

Para operaciones críticas, incluir implementación y validación del logging requerido
por `development/logging.md` en la misma entrega. Respetar contratos especializados
sin copiarlos ni redefinir rutas. No convertir recomendaciones externas no aprobadas
en tareas ni generar una plataforma de observabilidad por defecto.

Si cambian materialmente reglas, flujos, estados, contratos o configuración, incluir
actualización final con `spec-documentar` después de implementar y validar.

## Resultado esperado

Plan verificable del alcance aprobado, archivos y decisiones pendientes explícitos.
