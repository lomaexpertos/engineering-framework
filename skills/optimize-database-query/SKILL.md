---
name: optimize-database-query
description: "Optimiza consultas mediante planes, cardinalidad, índices y medición. No cambia resultados funcionales ni crea índices por intuición."
---

# Optimize Database Query

Entregar menor costo medible preservando resultados y contratos de datos.

## Restricciones y entrega

- Consultar las Policies de `database/indexes.md`, `data-types.md` y
  `development/performance-and-resilience.md`; mantener naming y convenciones del proyecto.
- Entregar cambios persistentes de índices o esquema por el contrato SQL corporativo;
  no crear un segundo mecanismo de migraciones.
- No ejecutar `EXPLAIN ANALYZE` ni cargas contra producción sin autorización.
- Conservar precisión, consistencia y logging crítico; no optimizar descartando evidencia.
- El modelo decide qué planes, consultas o herramientas necesita, sin un checklist
  universal de joins, N+1 o tipos de índice.

El resultado debe incluir evidencia comparable antes/después, equivalencia funcional
y efectos relevantes sobre escritura o mantenimiento. Declarar límites de la medición.
