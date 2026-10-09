---
name: database-routine-change
description: "Crea o modifica funciones, procedimientos, triggers o rutinas SQL permanentes. No usar para consultas aisladas ni cambios solo de esquema."
---

# Database Routine Change

Entregar rutinas SQL bajo el naming y contrato de artefactos corporativos.

## Restricciones y convenciones

- Consultar `database/object-naming.md`, `routine-safety.md` y los contratos existentes
  de permisos, invocadores, transacciones y efectos.
- Preparar por defecto un único SQL literal en `database/routines/`, conforme a
  `sql-artifact-layout.md` y `sql-change-delivery.md`, con creación/reemplazo, grants,
  prechecks y validación aplicables.
- No duplicar lógica canónica, ampliar privilegios ni ejecutar en producción sin
  autorización. Conservar dependencias y orden de deployment verificables.
- Si la rutina realiza cálculos, correcciones u otros efectos críticos, definir dónde
  se produce el logging requerido por `development/logging.md`: aplicación o una
  frontera confiable del proyecto, no un `PRINT` indiscriminado ni un volcado de filas.

## Resultado esperado

Contrato, artefacto y evidencia de los efectos y permisos relevantes, con actualización
o retiro seguros. El modelo decide SQL y técnica dentro de esas restricciones.
