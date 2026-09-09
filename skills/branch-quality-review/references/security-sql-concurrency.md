# Security, SQL and concurrency review

Aplicar estos controles únicamente cuando el cambio toque la superficie correspondiente
y calibrarlos con el umbral de evidencia de la Skill.

## Seguridad

Comprobar autenticación, autorización semánticamente correcta, scoping por tenant o
owner y validación de entradas en fronteras no públicas. Seguir una entrada no confiable
hasta su uso antes de reportar injection, traversal, XSS, SSRF u otra vulnerabilidad.

## SQL y datos

Buscar interpolación de entradas, identificadores dinámicos sin allowlist, joins con
cardinalidad incorrecta, N+1, escrituras masivas sin alcance y migrations incompatibles
o destructivas. Relacionar rendimiento con una ruta y volumen plausibles; no exigir
índices ni paginación sin un patrón que los necesite.

## Concurrencia

Cuando una escritura dependa de estado susceptible a carrera, identificar invariante,
escritores plausibles y frontera atómica. Considerar como protecciones válidas:

- constraint;
- operación atómica condicionada;
- control optimista;
- lock de fila dentro de una transacción; o
- serialización equivalente.

`SELECT ... FOR UPDATE` no es una receta universal ni protege por sí solo filas
inexistentes. Reportar únicamente cuando la estrategia real no conserve la invariante
bajo un interleaving plausible.

Revisar idempotencia y recuperación cuando existan retries, jobs, webhooks o efectos
externos. Evitar exigir outbox, saga o coordinación durable si no existe una frontera
distribuida que lo justifique.
