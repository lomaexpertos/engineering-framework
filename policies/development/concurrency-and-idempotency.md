# Concurrency and idempotency

## Applicability

Aplica a operaciones que puedan repetirse, competir o producir efectos únicos o costosos.

## Requirements

1. La operación **MUST** declarar su invariante, fuente de verdad y frontera de atomicidad.
2. La estrategia de concurrencia **MUST** apoyarse en controles efectivos como constraints, locks, control optimista o serialización; una comprobación previa aislada **MUST NOT** considerarse garantía.
3. Una operación reintentable con efecto material **MUST** definir una clave de idempotencia, alcance, persistencia del resultado y comportamiento ante parámetros incompatibles.
4. Pagos, saldos, inventarios, reservas y folios **MUST** impedir doble efecto y pérdida silenciosa ante carreras.
5. La consistencia con un sistema externo **MUST** incluir reconciliación, compensación o intervención operativa explícita cuando no exista atomicidad distribuida.
6. Las pruebas **MUST** cubrir los interleavings y reintentos relevantes, no solo ejecuciones secuenciales.
7. La estrategia **SHOULD** ser el control efectivo más sencillo para la invariante.
   Locks, colas, outbox, sagas o serialización adicional **MUST NOT** imponerse sin un
   conflicto o frontera distribuida que los justifique.
