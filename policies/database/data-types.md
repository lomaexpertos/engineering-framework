# Database data types

## Requirements

1. El tipo **MUST** representar la semántica y rango reales, no solo el ejemplo actual.
2. Dinero **MUST** usar tipos decimales con precisión y escala explícitas; `float` y `double` **MUST NOT** usarse para importes exactos.
3. Instantes **SHOULD** conservar zona horaria o normalización UTC; fechas civiles **MUST NOT** convertirse innecesariamente en timestamps.
4. Texto sin límite **SHOULD NOT** utilizarse cuando exista un máximo contractual útil para validación e índices.
5. JSON **MAY** usarse para estructura variable, pero **MUST NOT** ocultar relaciones, restricciones o campos consultados regularmente que requieren modelo explícito.
6. Tipos y defaults **MUST** verificarse contra el motor y versión reales.
