---
name: implement-critical-state-change
description: "Usar para modificar pagos, saldos, inventario, folios, autorización u otro estado de negocio donde duplicados, concurrencia o pérdida de integridad tengan impacto material."
---

# Implement Critical State Change

Proteger invariantes y efectos únicos antes de optimizar conveniencia.

## Workflow

1. Identificar fuente de verdad, invariantes, estados permitidos y transiciones.
2. Mapear actores, permisos, fronteras transaccionales y efectos externos.
3. Analizar concurrencia, reintentos, duplicados, orden y recuperación parcial.
4. Definir idempotencia y unicidad en la capa que pueda garantizarla.
5. Aplicar autorización sobre el recurso y transición concretos, no solo sobre la ruta.
6. Mantener escritura de estado y registro del efecto en una frontera consistente.
7. Diseñar compensación o reconciliación cuando exista un sistema externo.
8. Incorporar auditoría y observabilidad sin exponer datos sensibles.
9. Probar carreras, doble envío, reintento, fallo intermedio y transición inválida.
10. Verificar que fallar sea seguro y que no se confirme éxito parcial.

## Entrega

Explicar invariantes protegidas, estrategia de concurrencia e idempotencia, evidencia
de pruebas y escenarios que aún requieren control operativo.
