# Logging

## Criticality and delivery

1. Una operación **MUST** tratarse como crítica si calcula importes o resultados de
   negocio con impacto material, emite/cancela facturas, corrige o reconcilia datos relevantes, decide o
   aplica autorizaciones, modifica saldos/inventario/folios, o produce un efecto
   financiero, fiscal, de seguridad o de integridad material. Esto incluye motores
   de cálculo, nómina, cotizaciones, pagos y sus jobs, rutinas e integraciones.
2. El agente **MUST** evaluar esa aplicabilidad antes de implementar. Una operación
   crítica nueva o modificada **MUST** incorporar o conservar logging suficiente
   **en la misma entrega**, sin esperar un error ni un pedido separado de logs.
   El tamaño del diff no determina la criticidad.
3. Una spec, plan o revisión que cubra ese flujo **MUST** incluir su trazabilidad
   como aceptación/validación. La ausencia de logging requerido **MUST** impedir
   declarar completa la entrega; no se registra solo como mejora futura.
4. No es necesario instrumentar cambios cosméticos, helpers triviales o tareas sin
   un efecto crítico o valor diagnóstico. Cambiar una operación no crítica **MUST NOT**
   crear logging por cada función ni una plataforma nueva de observabilidad.
   Una corrección pequeña en un motor de cálculo sigue siendo crítica.
   Mostrar un resultado existente sin alterar su cálculo ni una decisión crítica
   no exige nuevos logs.
5. El cambio **MUST** reutilizar logger, eventos y correlación del proyecto cuando
   existan. En un sistema legado, cubrir el flujo afectado **MUST NOT** convertirse
   en una instrumentación general del repositorio sin alcance aprobado.

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
2. Una operación crítica, incluidos cálculos de negocio de varios pasos, **MUST**
   producir eventos correlacionados suficientes para reconstruir su inicio, decisiones relevantes,
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
6. Correcciones y autorizaciones **MUST** permitir reconstruir recurso/operación,
   decisión o resultado, motivo conocido y actor o sistema responsable; incluir
   cambio anterior/nuevo solo cuando sea necesario y permitido por su sensibilidad.
   Rechazos, fallas y resultados parciales o ambiguos **MUST** ser distinguibles.
7. Un SQL manual de reparación crítica **MUST** prever evidencia de ejecución
   controlada con alcance, responsable, motivo, conteos y resultado, sin volcar filas
   ni secretos. Preparar ese artefacto no autoriza ejecutarlo contra datos compartidos.

## Acceptance evidence

1. La validación del flujo crítico **MUST** demostrar con fixtures sanitizados que
   sus eventos correlacionados permiten reconstruir un éxito y el rechazo/fallo
   relevante, incluidas decisiones o resultados de cálculo necesarios.
   Usar cobertura existente cuando ya pruebe el contrato; no crear pruebas duplicadas.
2. Reintentos, concurrencia y fallas parciales **MUST** cubrirse cuando sean posibles
   en el flujo afectado. El mecanismo de validación lo decide el modelo dentro del
   entorno aislado y las restricciones del proyecto.
3. Evidencia pendiente **MUST** declararse como tal. No afirmar que la operación es
   diagnosticable solo porque existen llamadas al logger o una definición de eventos.

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
