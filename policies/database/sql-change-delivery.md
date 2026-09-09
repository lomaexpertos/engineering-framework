# SQL change delivery

## Default delivery

1. Una migración, backfill, reparación o cambio DDL/DML **SHOULD** entregarse como SQL
   literal, versionado y ejecutable manualmente, incluso si el proyecto dispone de un
   framework de migraciones.
2. El artefacto **MUST** separar prechecks, aplicación y validación posterior, e
   indicar el resultado esperado de las comprobaciones.
3. El SQL **SHOULD** ser estático, directo y adecuado para el motor y versión reales.
4. El artefacto **MUST NOT** ejecutarse contra una base compartida o productiva sin
   autorización explícita.

## Automated migrations

Una migración implementada mediante código o un framework **MAY** prepararse cuando el
usuario la solicite explícitamente o el contrato de despliegue vigente del proyecto la
requiera. Esa forma de entrega **MUST** conservar los mismos controles de integridad,
compatibilidad, validación y trazabilidad que el SQL manual.

El agente **MUST NOT** generar simultáneamente SQL manual y una migration de framework
para el mismo cambio salvo solicitud explícita y una razón operativa documentada.
