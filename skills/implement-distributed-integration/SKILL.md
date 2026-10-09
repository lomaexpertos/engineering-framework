---
name: implement-distributed-integration
description: "Implementa APIs entre servicios, webhooks, colas, eventos o integraciones externas con contratos, reintentos, idempotencia y fallas parciales."
---

# Implement Distributed Integration

Entregar una integración compatible con los contratos y límites operativos del proyecto.

## Contratos aplicables

- Consultar `development/distributed-systems.md`, `backwards-compatibility.md`,
  `concurrency-and-idempotency.md` y las Policies de seguridad pertinentes.
- Conservar nombres, versiones, autenticación y convenciones de mensajes existentes.
  Hacer explícitas las garantías de entrega, duplicados y recuperación que sí ofrece
  la integración; no prometer garantías que el proveedor no proporciona.
- Si transporta cálculos, facturas, correcciones, autorizaciones u otros efectos
  críticos, aplicar `development/logging.md` desde el cambio, incluida correlación
  entre participantes y resultados ambiguos o fallidos.
- No introducir mecanismos distribuidos por receta ni llamar servicios productivos
  o modificar configuración externa sin autorización específica.

## Resultado esperado

Contrato y comportamiento implementados, evidencia de compatibilidad y de los riesgos
relevantes, límites de responsabilidad y recuperación. El modelo decide la técnica.
