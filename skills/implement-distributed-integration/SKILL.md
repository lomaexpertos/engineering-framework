---
name: implement-distributed-integration
description: "Implementa APIs entre servicios, webhooks, colas, eventos o integraciones externas con contratos, reintentos, idempotencia y fallas parciales."
---

# Implement Distributed Integration

Diseñar para duplicados, demoras y fallas parciales como condiciones normales.

## Contexto

1. Identificar productor, consumidor, owner, contrato y fuente de verdad.
2. Inspeccionar integraciones, autenticación, observabilidad y convenciones existentes.
3. Definir semántica de entrega, orden, timeout, reintentos y compatibilidad.
4. Clasificar datos sensibles y efectos críticos producidos por el mensaje.

## Workflow

1. Versionar o evolucionar el contrato de forma compatible.
2. Validar autenticidad, autorización, esquema y límites antes de producir efectos.
3. Definir una clave de idempotencia y persistir el resultado cuando sea necesario.
4. Hacer explícitos deduplicación, reintentos, backoff y condición terminal.
5. Proteger transiciones concurrentes y evitar dobles efectos.
6. Diseñar compensación, dead-letter o intervención manual para fallas parciales.
7. Incorporar logs correlacionables, métricas y alertas sin secretos.
8. Probar duplicados, desorden, timeout, respuesta tardía y reintento después de éxito.

## Cierre

Documentar contrato, garantías reales, idempotencia, límites de responsabilidad,
recuperación y evidencia de pruebas.
