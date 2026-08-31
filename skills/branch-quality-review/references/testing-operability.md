# Pruebas, validación y operabilidad

## Diseñar evidencia por riesgo

Buscar pruebas proporcionales:

| Riesgo | Evidencia esperada |
|---|---|
| Invariante o cálculo | límites, inválidos, precisión y transiciones |
| Transacción | éxito, conflicto, rollback y commit parcial |
| Concurrencia | operaciones coordinadas en paralelo y estado final |
| API y permisos | contrato, permitido, denegado, tenant y campos |
| Evento o webhook | firma, duplicado, orden distinto, retry y fallo permanente |
| Migración o backfill | apply, compatibilidad, reanudación y conteos |
| Frontend crítico | doble submit, loading, error, stale response y accesibilidad |
| Corrección de bug | regresión que falle antes del arreglo |

No aceptar pruebas que sólo repitan detalles internos o mocks que reproduzcan la misma lógica defectuosa.

## Concurrencia determinista

Preferir barreras, latches o coordinación explícita para abrir la ventana de carrera. Evitar sleeps arbitrarios y pruebas que pasan por casualidad. Ejecutar contra el motor, aislamiento y constraints representativos cuando la garantía dependa de ellos.

Comprobar la invariante y los efectos externos después de todas las operaciones.

## Validación ejecutable

Usar los comandos oficiales del repositorio en un entorno aislado. Ejecutar primero checks enfocados y después ampliar según riesgo:

- pruebas relevantes;
- análisis estático y tipos;
- lint y build;
- integración con base representativa;
- smoke de migraciones;
- SAST, SCA o secret scanning disponibles;
- planes de consulta cuando el volumen lo amerite.

No degradar configuración ni modificar código para obtener verde. Registrar comando, resultado y limitación.

## Operabilidad

Revisar en flujos críticos:

- logs estructurados, correlación y causación;
- métricas de éxito, error, latencia, retry, duplicado y backlog;
- alertas accionables;
- DLQ con monitoreo y replay;
- reconciliación de estado distribuido;
- runbook, reparación y auditoría;
- feature flags, rollout, compatibilidad y rollback/roll-forward.

Un comportamiento no observable ni reparable mantiene riesgo aunque el camino feliz tenga pruebas.

## Resultado

Separar:

- validado mediante ejecución;
- inspeccionado estáticamente;
- inferido;
- no verificable con el entorno disponible.

No presentar una validación no ejecutada como aprobada.
