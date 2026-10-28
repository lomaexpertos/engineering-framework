# Validación normativa y de contexto

El validador fuente comprueba estructura, rutas canónicas, enlaces, Policies
alcanzables desde su router, catálogo/discovery de skills y límite de AGENTS.
La misma fuente se valida desde Docker antes de distribuir un snapshot.

El runtime consumidor comprueba enlaces y anclas locales, presupuesto de contexto,
conocimiento alcanzable y dependencias a expedientes temporales desde docs. Una
referencia escrita en texto informal requiere revisión semántica adicional.

No existe inferencia automática de reglas de negocio ni prueba de que toda decisión
fue promovida. Metadata normativa universal de Policies y schema de excepciones
siguen sujetos a sus contratos específicos pendientes; no se presentan como controles
implementados por existir routers o enlaces.
