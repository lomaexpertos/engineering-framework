# Distributed systems

## Requirements

1. APIs, eventos, colas y webhooks **MUST** definir contrato, owner, autenticación, compatibilidad, timeout y semántica de entrega.
2. Los consumidores **MUST** asumir duplicados y reintentos cuando el transporte no garantice exactly-once.
3. Orden, deduplicación, backoff, condición terminal y dead-letter **MUST** definirse cuando afecten corrección o recuperación.
4. La publicación de un evento asociada a una escritura local **MUST** usar un mecanismo que evite perder uno de los dos efectos, como outbox o una garantía equivalente.
5. Un webhook **MUST** verificar autenticidad antes de aplicar efectos y **SHOULD** responder rápidamente, delegando trabajo largo de forma durable.
6. Los cambios incompatibles **MUST** incluir versionado o transición coordinada de productores y consumidores.
