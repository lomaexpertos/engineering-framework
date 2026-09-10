# Database deployment compatibility

## Purpose

Evitar que una migración o restauración invalide versiones coexistentes, rollback o
capacidades requeridas por el runtime.

## Requirements

1. Todo servicio capaz de modificar esquema **MUST** declarar si sus migraciones son
   inexistentes, externas o automatizadas en el manifest de deployment.
2. Un deployment con coexistencia de versiones **MUST** usar cambios compatibles con
   todas las versiones que puedan ejecutar durante rollout y rollback.
3. Un cambio que retire o renombre estructura consumida **MUST** separar adopción y
   eliminación en fases compatibles.
4. Migraciones destructivas o no reversibles **MUST** documentar respaldo, recuperación
   y estrategia de avance correctivo antes del deployment.
5. La automatización **MUST** detenerse ante el primer error de migración o restore; no
   debe convertirlo en advertencia ni publicar éxito parcial.
6. Cuando un dump requiera extensiones, tipos, operadores o clases de operadores, el
   ambiente destino **MUST** proveer versiones compatibles y reproducibles.
7. Las capacidades requeridas **MUST** validarse en el catálogo antes de restaurar y
   verificarse nuevamente al finalizar.
8. Una comprobación de conectividad del motor **MUST NOT** considerarse evidencia de
   migración o restauración exitosa.
9. Un estado parcial **MUST** marcar la operación como fallida y conservar diagnóstico
   suficiente para recuperación explícita.

Las reglas generales de diseño, integridad y cambios destructivos se definen en
[`schema-conventions.md`](schema-conventions.md),
[`relational-integrity.md`](relational-integrity.md) y
[`data-change-safety.md`](data-change-safety.md).
