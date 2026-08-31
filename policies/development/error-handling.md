# Error handling

## Requirements

1. Los errores **MUST** clasificarse de forma suficiente para distinguir entrada inválida, autorización, conflicto, indisponibilidad y defecto interno cuando aplique.
2. Una excepción **MUST NOT** capturarse sin una acción explícita: traducir, enriquecer, compensar, reintentar de forma segura o registrar y propagar.
3. Los errores **MUST NOT** revelar secretos, credenciales, datos personales innecesarios ni detalles internos explotables.
4. Un fallo **MUST NOT** confirmarse como éxito ni dejar una transacción en un estado parcialmente aceptado sin mecanismo de recuperación visible.
5. Reintentos **MUST** estar acotados, responder a errores transitorios y ser compatibles con idempotencia.
