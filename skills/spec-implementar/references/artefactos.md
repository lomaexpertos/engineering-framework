# Artefactos de implementación

## `implementation-review.md`

Usar como núcleo:

```markdown
# Implementation Review: <slug>

## Resumen de lo implementado
## RF y tareas cubiertos
## Brechas de implementación cubiertas
## Archivos principales modificados
## Decisiones y desviaciones
## Pruebas realizadas y omitidas
## Riesgos, pendientes y posibles regresiones
## Revisión de calidad
## Actualización de arquitectura
```

Agregar recomendaciones para code review humano cuando aporten acciones concretas. Referenciar rutas, tareas, RF y reportes existentes; no duplicar el reporte de `$branch-quality-review`.
Registrar las brechas mediante sus IDs `BR-###`. Mantener como contexto las desviaciones residuales contra Best Practice sin presentarlas como trabajo implementado cuando no formen parte del TO-BE.
Cuando existan SQL literales manuales, referenciar el paquete canónico bajo `database/`, su orden de ejecución, prechecks, validación y estrategia de rollback o roll-forward. No copiar el SQL dentro de la trazabilidad.

## `resumen-ejecutivo.md`

Crear si el cambio tiene impacto medio/alto, existe audiencia de negocio o el usuario lo solicita. Incluir qué cambió, impacto esperado, estado de pruebas y riesgos o pendientes relevantes. Mantenerlo breve.

## `resumen-extenso.md`

Crear si el cambio es complejo o transversal, de alto riesgo, o el usuario lo solicita. Relacionar contexto, plan, cambios por módulo, decisiones, desviaciones, pruebas, compatibilidad, riesgos y documentación arquitectónica actualizada.

## Artefactos condicionales

- `progreso.md`: ejecución extensa o por fases;
- `desviaciones-plan.md`: diferencias materiales contra el plan;
- `decisiones-implementacion.md`: decisiones técnicas no previstas;
- `pruebas.md`: evidencia que excede la revisión;
- `pendientes.md`: trabajo incompleto con siguiente acción.

Crear cada archivo sólo si mejora la trazabilidad. Evitar repetir contenido que ya tenga una fuente autoritativa.
