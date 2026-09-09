# Relational integrity

## Requirements

1. PK y FK relacionadas **MUST** usar tipos y representaciones compatibles.
2. Una relación requerida **MUST** protegerse con `NOT NULL`, FK, unicidad u otra constraint efectiva cuando el motor lo permita.
3. `ON DELETE RESTRICT` y `ON UPDATE RESTRICT` **SHOULD** ser el default para relaciones nuevas. `CASCADE`, `SET NULL` o una alternativa **MAY** utilizarse cuando el ciclo de vida del dominio la justifique y su impacto haya sido revisado.
4. Una relación muchos-a-muchos puramente asociativa **SHOULD** usar el prefijo `rel_` seguido de entidades plurales; una entidad con comportamiento propio **MUST NOT** modelarse como puente incidental.
5. Los identificadores de auditoría `registro_autor_id` y `actualizacion_autor_id` **MAY** omitir FK para evitar acoplamiento y ruido, manteniendo el tipo compatible con identidades.
6. Invariantes que la base pueda garantizar de forma estable **SHOULD** expresarse como constraints, no solo como validación de aplicación.
