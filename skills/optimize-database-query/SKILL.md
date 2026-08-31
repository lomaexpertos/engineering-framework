---
name: optimize-database-query
description: "Optimiza consultas mediante planes, cardinalidad, índices y medición. No cambia resultados funcionales ni crea índices por intuición."
---

# Optimize Database Query

Reducir costo medible preservando semántica y consistencia.

## Workflow

1. Capturar consulta real, parámetros representativos, motor, versión y síntoma.
2. Confirmar resultados esperados y restricciones de consistencia.
3. Obtener baseline y plan de ejecución en un entorno seguro.
4. Revisar cardinalidad, filtros, joins, sorts, agregados, N+1 y estimaciones erróneas.
5. Inspeccionar índices existentes, selectividad, costo de escritura y duplicación.
6. Formular una hipótesis y cambiar una dimensión principal a la vez.
7. Comparar plan, latencia, filas procesadas y variabilidad con el baseline.
8. Probar equivalencia de resultados, nulidad, duplicados y parámetros extremos.
9. Documentar efectos sobre escrituras, almacenamiento y mantenimiento.

No ejecutar `EXPLAIN ANALYZE` ni cargas contra producción sin autorización. Entregar
evidencia antes/después y limitaciones del experimento.
