---
name: database-routine-change
description: "Crea o modifica funciones, procedimientos, triggers o rutinas SQL permanentes. No usar para consultas aisladas ni cambios solo de esquema."
---

# Database Routine Change

Mantener lógica de base de datos explícita, acotada y verificable.

## Workflow

1. Identificar motor, versión, invocadores, permisos y transacciones relacionadas.
2. Inspeccionar rutinas, triggers, convenciones y alternativas set-based existentes.
3. Confirmar que la lógica pertenece a la base y no duplica una fuente canónica.
4. Definir entradas, salidas, efectos, errores, reentrancia y comportamiento concurrente.
5. Preferir SQL estático; justificar control procedural o SQL dinámico.
6. Evitar efectos ocultos, recursión de triggers y privilegios mayores a los necesarios.
7. Preparar creación o reemplazo, grants, prechecks y validación como SQL literal.
8. Probar nulidad, duplicados, error intermedio, permisos y volumen esperado.
9. Documentar dependencias y orden de deployment sin ejecutar en producción.

## Entrega

Reportar contrato, efectos, permisos, artefactos, pruebas y estrategia de actualización o
retiro.
