# Architecture and design

## Requirements

1. La arquitectura documentada y las fronteras existentes **MUST** inspeccionarse antes de decidir una estructura nueva.
2. Un cambio **SHOULD** usar la solución más simple que preserve invariantes, mantenibilidad y operabilidad.
3. DDD, patrones, capas o abstracciones adicionales **MAY** utilizarse cuando el dominio o la variación real los justifique; **MUST NOT** introducirse por preferencia estética.
4. Las reglas de negocio **MUST** residir en una autoridad canónica identificable y **MUST NOT** duplicarse de forma divergente entre controladores, UI, jobs o integraciones.
5. Una modificación material de límites, contratos o decisiones arquitectónicas **MUST** actualizar la documentación canónica aplicable.
