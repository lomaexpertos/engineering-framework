# ADR-0005: Initial database conventions

- Status: Accepted
- Date: 2026-08-30

## Decision

1. Las tablas nuevas se nombran en español, plural y `snake_case`, comenzando por la
   entidad que aporte mayor valor semántico. Por ejemplo, `pago_detalles` prevalece
   sobre `detalle_pago`.
2. El identificador preferido es UUIDv7 cuando el motor y el proyecto lo soporten de
   forma validada. Nano ID de al menos 14 caracteres es la alternativa; debe usar un
   alfabeto seguro para los consumidores. El autoincremento es el último recurso.
3. Las tablas persistentes y mutables que lo ameriten incorporan por defecto
   `registro_autor_id`, `registro_fecha`, `actualizacion_autor_id` y
   `actualizacion_fecha`.
4. Los registros de negocio utilizan borrado lógico mediante `status`. El borrado
   físico se reserva para datos efímeros, tablas temporales o una necesidad explícita
   y justificada.
5. Los cambios de base de datos se entregan como SQL literal ejecutable manualmente
   por defecto, aunque exista un framework de migraciones. Una migración automatizada
   en código puede prepararse cuando se solicite explícitamente.

## Consequences

Estas reglas se publican como Policies separadas por trigger. Las Skills de base de
datos describirán el procedimiento para aplicarlas, sin duplicar su contenido
normativo.
