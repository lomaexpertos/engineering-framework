# Artefactos de planeación

## `plan.md`

Incluir como núcleo:

- enfoque técnico y límites;
- RF cubiertos;
- brechas de implementación cubiertas y desviaciones residuales relevantes;
- módulos o archivos afectados, confirmados o por verificar;
- entidades, estados e invariantes;
- compatibilidad con datos y procesos existentes;
- riesgos técnicos y rollback;
- orden de implementación;
- casos borde y supuestos pendientes.

Agregar cuando apliquen: datos y migraciones, API, eventos, integraciones, UI, permisos, observabilidad, despliegue gradual y actualización de arquitectura.

## `tasks.md`

```markdown
- [ ] T001 <Categoría>: <resultado concreto>.
  RF: RF-001
  Depende de: ninguna
  Paralelizable: sí
  Ruta esperada: <sólo cuando aporte precisión>
  Criterio de terminado: <evidencia verificable>.
```

Usar sólo categorías pertinentes: backend, frontend, base de datos, integraciones, pruebas, calidad y documentación. No usar `plan/tasks.md` como bitácora de ejecución.
Relacionar cada tarea con RF y, cuando aporte trazabilidad, con IDs `BR-###`. No crear tareas sólo porque una recomendación aparezca en `best-practices.md`.
Para SQL literal manual, usar `Ruta esperada: database/<categoria>/<YYYYMMDD_nombre_descriptivo>/` y elegir entre `migrations`, `backfills`, `repairs` o `routines` conforme a la Policy `database/sql-artifact-layout.md` y la Skill de base de datos correspondiente.

## `test-plan.md`

Incluir:

- casos borde detectados;
- pruebas por capa y contrato;
- seguridad y permisos;
- datos, migración y compatibilidad;
- regresiones y smoke tests;
- datos de prueba;
- comandos o validaciones sugeridas;
- criterios mínimos de aprobación;
- revisión final proporcional al riesgo.

No limitarse a copiar la spec. Añadir escenarios capaces de romper invariantes o procesos vecinos.
