# Application security

## Requirements

1. Autenticación **MUST NOT** sustituir autorización; cada efecto protegido **MUST** validar actor, recurso, acción y tenant o alcance aplicable.
2. Toda entrada no confiable **MUST** validarse antes de alcanzar intérpretes, filesystem, red, persistencia o renderizado.
3. Consultas, comandos y plantillas **MUST** parametrizarse o escapar mediante APIs seguras; concatenar entrada no confiable **MUST NOT** ser el mecanismo normal.
4. Uploads, URLs, callbacks y deserialización **MUST** limitar tipo, tamaño, destino y comportamiento permitido.
5. Los permisos **MUST** seguir least privilege y los defaults **SHOULD** ser seguros.
6. Controles de rate limiting, antifraude o abuso **SHOULD** aplicarse donde una operación tenga costo o impacto material.
7. Las excepciones de seguridad **MUST** ser explícitas, acotadas, aprobadas y trazables.
