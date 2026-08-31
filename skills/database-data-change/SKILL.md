---
name: database-data-change
description: "Implementa backfills, reparaciones, transformaciones o eliminaciones de datos con alcance, prechecks, validación y recuperación verificables."
---

# Database Data Change

Modificar datos existentes sin afectar filas fuera del conjunto previsto.

## Workflow

1. Identificar motor, tablas, volumen, owner, ventana y fuente de verdad.
2. Definir el conjunto objetivo mediante consultas read-only y resultados esperados.
3. Evaluar invariantes, FK, triggers, auditoría, concurrencia y consumidores activos.
4. Elegir operación set-based, lotes y frontera transaccional según el motor.
5. Proteger toda escritura masiva con filtros defensivos y conteos verificables.
6. Preparar SQL literal separado en prechecks, aplicación y validación.
7. Diseñar reanudación idempotente y roll-forward; no prometer rollback inseguro.
8. Probar con datos representativos y casos límite en un entorno autorizado.
9. No ejecutar contra una base compartida o productiva sin autorización explícita.

## Entrega

Proporcionar ruta del artefacto, orden, población esperada, duración/locks estimados,
validaciones, recuperación y evidencia no obtenida.
