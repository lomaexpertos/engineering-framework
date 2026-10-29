# Documentation maintenance

## Requirements

1. Un cambio material de comportamiento, contrato, arquitectura, operación o configuración **MUST** actualizar la fuente documental canónica afectada.
2. El agente **MUST** actualizar el documento existente antes de crear variantes como `v2`, `nuevo`, `final` o `actualizado`.
3. Un documento reemplazado **MUST** eliminarse o marcarse como histórico/deprecado con sucesor y vigencia visibles.
4. Routers e índices **MUST** actualizarse en la misma revisión que agrega, mueve o retira una fuente documentada.
5. El agente **MUST NOT** reescribir evidencia histórica como si siempre hubiera descrito el estado nuevo.
6. Documentación, decisiones, invariantes y roadmap **MUST NOT** actualizarse por
   casilla. Aplicar [proportional-delivery.md](proportional-delivery.md): cambiar
   fuentes afectadas por conocimiento significativo o continuidad real, sin crear
   specs, reportes ni páginas de progreso para un cambio local ya explicado.
