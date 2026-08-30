---
name: spec-implement
description: "Usar para ejecutar una spec que ya tiene TO-BE y plan aprobados, implementando tareas con trazabilidad, pruebas y actualización documental. No usar para resolver silenciosamente decisiones abiertas."
---

# Spec Implement

Ejecutar el plan aprobado hasta obtener comportamiento verificable.

## Workflow

1. Leer spec, plan, tareas, pruebas, Policies y arquitectura aplicable.
2. Confirmar alcance autorizado, estado inicial y preguntas no bloqueantes.
3. Implementar tareas en orden de dependencias y mantener cambios relacionados.
4. Reutilizar patrones existentes y evitar refactors fuera del plan.
5. Aplicar las Skills especializadas cuando el trabajo incluya UI, datos,
   infraestructura, integración distribuida o estados críticos.
6. Ejecutar pruebas proporcionales al riesgo y corregir causas raíz.
7. Registrar desviaciones del plan; obtener decisión antes de ampliar alcance.
8. Actualizar tareas y evidencia de validación conforme se completan.
9. Ejecutar `spec-documentar` cuando cambien materialmente procesos, contratos,
   estados, datos o dependencias permanentes.

## Cierre

Relacionar requisitos, cambios y pruebas; informar validaciones no ejecutadas, riesgos
restantes y cualquier diferencia entre el plan y la implementación final.
