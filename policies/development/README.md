# Development policies router

Consulta este dominio para decisiones generales de implementación y calidad.

## Routing

- Estructura, patrones y autoridad de reglas: [`architecture-and-design.md`](architecture-and-design.md).
- Mantenibilidad y alcance del cambio: [`code-quality.md`](code-quality.md).
- Clasificación, propagación y exposición de errores: [`error-handling.md`](error-handling.md).
- Paquetes y proveedores incorporados al código: [`dependencies.md`](dependencies.md).
- Invariantes, dinero, tiempo e identificadores: [`domain-integrity.md`](domain-integrity.md).
- Carreras, reintentos y efectos únicos: [`concurrency-and-idempotency.md`](concurrency-and-idempotency.md).
- APIs, eventos, colas y webhooks: [`distributed-systems.md`](distributed-systems.md).
- Latencia, carga, caché y degradación: [`performance-and-resilience.md`](performance-and-resilience.md).
- Evolución y retiro de contratos: [`backwards-compatibility.md`](backwards-compatibility.md).
- Eventos de log, correlación y datos permitidos: [`logging.md`](logging.md).
- Pruebas y evidencia de validación: [`testing.md`](testing.md).

Los contratos específicos de un proyecto pueden ser más estrictos, pero no debilitar
estas garantías sin una excepción documentada.
