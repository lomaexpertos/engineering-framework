# Database schema conventions

## Applicability

Esta Policy aplica a tablas e identificadores nuevos. Los objetos existentes
**MUST NOT** renombrarse ni convertir su identificador únicamente para homogeneizarlos
fuera del alcance de una migración aprobada.

## Table names

1. Las tablas **MUST** nombrarse en español, plural, minúsculas ASCII y `snake_case`.
2. El nombre **MUST** comenzar por la entidad o agregado dominante para conservar
   valor semántico y agrupación predecible.
3. Palabras subordinadas como `detalles`, `historiales`, `bitacoras` o `logs`
   **MUST NOT** encabezar el nombre cuando exista una entidad principal clara. Por ejemplo,
   se usa `pago_detalles`, no `detalle_pago`.

## Identifiers

1. UUIDv7 **SHOULD** ser el identificador predeterminado cuando el motor y el proyecto
   dispongan de generación validada.
2. Cuando UUIDv7 no sea razonable, un Nano ID **MAY** utilizarse con al menos 14
   caracteres, un alfabeto seguro para sus consumidores y una restricción de unicidad.
3. La longitud y el alfabeto **MUST** revisarse contra el volumen esperado y el riesgo
   de colisión; 14 caracteres es un mínimo, no una garantía universal.
4. Un identificador autoincremental **SHOULD NOT** utilizarse salvo que las opciones
   anteriores no sean viables y la razón quede documentada.
5. La autorización **MUST NOT** depender de que un identificador sea difícil de
   adivinar. Si existe un autoincremento interno, **MUST NOT** exponerse como único
   control de acceso en URLs o contratos externos.
