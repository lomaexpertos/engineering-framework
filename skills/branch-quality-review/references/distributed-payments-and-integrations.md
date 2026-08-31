# Pagos, webhooks e integraciones distribuidas

## Contenido

1. Modelar la operación
2. Separar fronteras
3. Webhooks y eventos
4. Pagos y saldos
5. Resiliencia y recuperación
6. Contratos y evidencia

## 1. Modelar la operación

Distinguir intención, solicitud al proveedor, aceptación, resultado definitivo, efecto local, documento, saldo y conciliación. No asumir que una respuesta HTTP equivale al resultado final del negocio.

Identificar:

- identificador interno de la operación;
- identificadores del proveedor;
- estados locales, estados externos y traducción entre ambos;
- punto de no retorno;
- autoridad para declarar éxito, rechazo, pendiente o estado desconocido.

## 2. Separar fronteras

No asumir atomicidad entre base local, proveedor, broker o segunda base. Revisar:

- llamada externa dentro de transacción o con locks abiertos;
- commit local seguido de publicación no durable;
- efecto externo exitoso seguido de fallo local;
- timeout con resultado remoto desconocido;
- compensación, saga, outbox/inbox o reconciliación;
- reintentos que repiten efectos no idempotentes.

Usar estados intermedios explícitos cuando la realidad distribuida no permita una decisión inmediata.

## 3. Webhooks y eventos

Verificar:

- firma sobre el payload correcto, timestamp, audiencia y secreto apropiado;
- protección contra replay;
- allowlist de tipos necesarios;
- deduplicación atómica por evento u operación lógica;
- duplicados simultáneos y eventos distintos que representan el mismo efecto;
- entrega fuera de orden y consulta del estado vigente cuando corresponda;
- no asumir que el timestamp del evento es una versión monotónica del objeto sin una garantía oficial explícita;
- procesamiento asíncrono durable y respuesta rápida al proveedor;
- ack sólo después de registrar trabajo o efecto durable;
- versión del contrato y compatibilidad;
- reenvío manual, replay y reconciliación.

## 4. Pagos y saldos

Separar:

- autorización, captura, cobro, factura, devolución, disputa y depósito;
- dinero esperado, confirmado, disponible y conciliado;
- importe, moneda, escala, redondeo y comisión;
- cargo original y devoluciones acumuladas;
- ledger fuente y saldo materializado.

Buscar doble cobro, doble devolución, aplicación duplicada al saldo, actualización desde webhook y request síncrono, cancelación concurrente y decisiones basadas en estado obsoleto.

No almacenar únicamente un booleano `pagado` cuando existan estados pendientes, acciones requeridas, reversos o resultados inciertos relevantes.

## 5. Resiliencia y recuperación

Confirmar:

- timeout explícito;
- clasificación de fallos transitorios, permanentes y de negocio;
- retry acotado con backoff y jitter dentro de un deadline;
- idempotencia compatible con retry;
- circuit breaker sólo si aporta frente al patrón real;
- DLQ o estado recuperable;
- métricas, alertas, correlación y runbook;
- proceso de conciliación que detecte y repare divergencias.

Una DLQ sin monitoreo ni replay no constituye recuperación.

## 6. Contratos y evidencia

Revisar SDK y documentación oficial de la versión usada cuando la semántica del proveedor sea crítica. No inferir garantías de entrega, orden o idempotencia.

Exigir pruebas de duplicado, orden inverso, timeout, respuesta inválida, retry y fallo parcial. Preferir un fake o servidor controlado en la frontera sin reimplementar internamente toda la lógica del proveedor.

Marcar bloqueante si un efecto financiero puede duplicarse, perderse o quedar sin reconciliación; si la firma o autorización del webhook es insuficiente; o si la lógica confunde rechazo con fallo técnico o estado pendiente.
