# Logging

## Requirements

1. Los logs **MUST** describir eventos operativos o de negocio útiles para diagnóstico, auditoría o alertamiento; **MUST NOT** usarse como volcado indiscriminado de estado.
2. Secretos, credenciales, tokens, payloads sensibles y datos personales innecesarios **MUST NOT** registrarse.
3. Eventos correlacionados **SHOULD** incluir identificadores de solicitud, operación o entidad que permitan seguir el flujo sin revelar información sensible.
4. Severidad y estructura **MUST** seguir las convenciones existentes y distinguir comportamiento esperado de fallas accionables.
5. Errores **SHOULD** registrarse una vez en la frontera que tenga contexto suficiente; duplicarlos en cada capa **SHOULD NOT** ser el comportamiento normal.
6. Volumen, cardinalidad y retención **MUST** evaluarse antes de añadir campos o eventos de alta frecuencia.
