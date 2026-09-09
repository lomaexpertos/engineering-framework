# Code quality

## Applicability

Aplica a código productivo nuevo o modificado, independientemente del lenguaje.

## Requirements

1. El cambio **MUST** respetar las convenciones, límites y abstracciones existentes del proyecto antes de introducir otras nuevas.
2. El código **MUST** mantener separadas las responsabilidades de dominio, aplicación, infraestructura y presentación cuando el proyecto ya establezca esos límites.
3. Las funciones y módulos **SHOULD** tener una responsabilidad identificable, nombres semánticos y dependencias explícitas.
4. Un refactor no relacionado **MUST NOT** incorporarse a un cambio funcional sin alcance y justificación visibles.
5. Una duplicación **MAY** mantenerse temporalmente cuando abstraerla o eliminarla ampliaría el riesgo; la abstracción **SHOULD** responder a una variación real, no hipotética.
6. Advertencias, errores del compilador o del analizador y validaciones existentes **MUST NOT** silenciarse únicamente para completar la entrega.
7. Los nombres nuevos **SHOULD** usar el lenguaje del dominio y el idioma dominante
   del módulo, preservando términos técnicos estándar y contratos existentes.
8. Los comentarios **SHOULD** explicar decisiones, invariantes o restricciones no
   evidentes y **SHOULD NOT** limitarse a narrar el código.
