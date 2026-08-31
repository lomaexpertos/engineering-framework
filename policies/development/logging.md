# Logging

## Application output

1. En producción, la aplicación **MUST** emitir su flujo principal de logs por
   `stdout` y `stderr`; **MUST NOT** depender de archivos internos, montajes o de un
   backend específico para entregar logs.
2. Eventos informativos **SHOULD** emitirse por `stdout` y errores por `stderr` cuando
   el framework permita diferenciarlos sin fragmentar el contrato.
3. La aplicación **MUST NOT** depender directamente de Grafana Alloy, Loki ni otro
   collector o backend para cumplir su contrato base de logging. La recolección y el
   transporte son responsabilidades del runtime y de la infraestructura.
4. Local y preview **MAY** agregar formatos o destinos para facilitar el desarrollo,
   siempre que el comportamiento productivo pueda probarse.

## Operational and business events

1. Los logs **MUST** describir eventos operativos o de negocio útiles; **MUST NOT**
   usarse como volcado indiscriminado de estado ni como traza de cada línea de código.
2. Una operación crítica o un cálculo de varios pasos **MUST** producir eventos
   correlacionados suficientes para reconstruir su inicio, decisiones relevantes,
   resultados intermedios, resultado final y falla.
3. Los checkpoints **MUST** corresponder a pasos semánticos del dominio. Nómina,
   cotizaciones, ventas, facturación, pagos y procesos equivalentes **MUST** registrar
   las reglas, bases, tasas, redondeos o resultados que expliquen el cálculo cuando
   sean relevantes.
4. Cada flujo correlacionado **SHOULD** incluir identificador de operación, entidades
   afectadas, actor o sistema iniciador, versión de regla cuando exista, timestamps,
   duración, estado y motivo de fallo.
5. Nombres de evento, campos, severidad y estructura **MUST** ser estables y seguir
   las convenciones existentes. Los errores **SHOULD** registrarse una vez en la
   frontera que tenga contexto suficiente.

## Data boundaries

1. Datos de negocio necesarios para reconstruir una operación **MAY** registrarse de
   forma explícita. Identificadores o resúmenes **SHOULD** preferirse cuando conservan
   el mismo valor diagnóstico.
2. Secretos, credenciales, tokens, llaves privadas, cadenas de conexión y sesiones
   **MUST NOT** registrarse. Datos personales o payloads no necesarios **MUST NOT**
   añadirse por conveniencia.
3. Acceso, retención y protección del sistema de logs **MUST** corresponder a la
   sensibilidad de los datos de negocio que contiene.
4. Datos controlados por usuarios **MUST** codificarse o sanitizarse para evitar
   inyección y falsificación de eventos, sin eliminar los hechos diagnósticos.
5. Los logs son evidencia operativa y **MUST NOT** sustituir el estado transaccional,
   un ledger o un registro de auditoría durable cuando el dominio los requiera.

## Reliability and cost

1. El logging obligatorio de operaciones críticas **MUST NOT** poder desactivarse
   silenciosamente en producción.
2. Una falla de logging **MUST NOT** corromper el efecto de negocio. Si la pérdida de
   evidencia es material, **MUST** ser detectable y existir un mecanismo durable o de
   reconciliación separado.
3. Volumen, cardinalidad y retención **MUST** evaluarse antes de añadir campos o
   eventos de alta frecuencia.

## Reference

- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
