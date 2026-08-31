# Domain integrity

## Requirements

1. Cada cambio de negocio **MUST** identificar invariantes, estados válidos y la autoridad que los aplica.
2. Validar formato en la frontera **MUST NOT** sustituir la validación semántica en la capa que controla la regla.
3. Dinero **MUST** manejar moneda, escala, redondeo y signo de forma explícita; **MUST NOT** usar representación binaria imprecisa para cálculos monetarios.
4. Tiempo **MUST** distinguir instante, zona horaria, fecha civil y periodo cuando su semántica difiera.
5. Identificadores opacos **MUST NOT** tratarse como controles de autorización.
6. Reglas legales, fiscales o regulatorias **MUST NOT** inventarse; requieren fuente vigente y alcance aplicable.
