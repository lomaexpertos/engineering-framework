# Database record lifecycle

## Audit columns

Una tabla persistente y mutable de negocio **MUST** incluir por defecto:

- `registro_autor_id`;
- `registro_fecha`;
- `actualizacion_autor_id`; y
- `actualizacion_fecha`.

La omisión es válida cuando la tabla sea efímera, inmutable, puramente técnica o el
motor imponga una limitación documentada. Los identificadores de autor deben conservar
un tipo compatible con el contrato de identidades del proyecto.

## Logical deletion

1. Los registros de negocio **MUST** utilizar borrado lógico mediante `status` durante
   su operación normal.
2. `status` **SHOULD** representar únicamente existencia lógica mediante valores
   equivalentes a `activo` y `eliminado`. Estados del proceso **MUST** usar un campo
   semántico como `status_pago`, `status_venta` o el contexto correspondiente.
3. El borrado físico **MAY** utilizarse para tablas temporales, cargas efímeras o datos
   cuyo ciclo de vida exija eliminación real.
4. Cualquier otro borrado físico **MUST** tener una necesidad explícita, alcance
   verificable y evaluación de integridad y recuperación.
5. El borrado lógico **MUST NOT** sustituir obligaciones legales de eliminación de
   datos cuando estas apliquen.
