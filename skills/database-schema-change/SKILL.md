---
name: database-schema-change
description: "Crea o modifica tablas, columnas, relaciones, constraints, índices o vistas con integridad, compatibilidad y entrega SQL controlada."
---

# Database Schema Change

Evolucionar estructura preservando integridad y compatibilidad.

## Contexto

1. Leer Policies de esquema, ciclo de vida, entrega SQL y compatibilidad.
2. Identificar motor, versión, cliente, esquema actual y mecanismo de migraciones.
3. Inspeccionar objetos, datos, consultas y versiones de aplicación consumidoras.

## Workflow

1. Modelar entidad dominante, cardinalidad, nulabilidad, ciclo de vida e invariantes.
2. Resolver nombres e identificadores conforme a las Policies y contratos existentes.
3. Definir PK, FK, restricciones, acciones referenciales, auditoría e índices.
4. Evaluar locks, volumen, defaults, backfill y coexistencia entre versiones.
5. Separar expansión, adopción y retiro cuando un cambio no sea compatible en un paso.
6. Preparar SQL literal con prechecks, aplicación y validación; usar migración en código
   solo por solicitud explícita.
7. Definir roll-forward, respaldo y recuperación para cambios no reversibles.
8. Validar sintaxis y estructura contra el motor real sin ejecutar en producción.

## Entrega

Indicar orden, resultados esperados, compatibilidad, riesgos de lock, validaciones y
operaciones no ejecutadas.
