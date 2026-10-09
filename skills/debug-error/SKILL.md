---
name: debug-error
description: "Reproduce y aísla errores; si se solicita, implementa la corrección mínima con regresión. No usar para incidentes productivos activos."
---

# Debug Error

Entregar un diagnóstico comprobable; corregir únicamente cuando se solicite.

## Límites y convenciones

- Consultar `development/error-handling.md`, `testing.md` y el contexto del módulo.
  Respetar sus nombres, contratos y mecanismos de diagnóstico.
- No modificar código si el pedido es solo investigación. No ocultar síntomas,
  debilitar pruebas ni extender la corrección a un refactor no solicitado.
- Una corrección en una operación crítica debe conservar o completar el logging
  del flujo afectado según `development/logging.md`, dentro del mismo cambio.
- Incidentes productivos activos usan `investigate-production-incident`.
- El modelo decide cómo investigar; no exigir una secuencia de hipótesis o herramientas.

## Resultado esperado

Causa y evidencia, corrección autorizada si aplica, validación proporcional y
limitaciones. Distinguir una hipótesis de una causa confirmada.
