# UI consistency

## Requirements

1. Un cambio de UI **MUST** respetar el design system, componentes y convenciones
   documentadas del proyecto.
2. Estados equivalentes **SHOULD** usar patrones equivalentes de carga, vacío, error,
   éxito, confirmación y permisos.
3. Cambios visuales **MUST NOT** alterar flujos, navegación o contratos de datos sin
   alcance explícito.
4. Componentes interactivos **MUST** conservar semántica, navegación por teclado,
   foco y etiquetas accesibles aplicables.
5. El comportamiento **MUST** validarse en los tamaños de viewport y estados
   afectados por el cambio y sus interacciones. Una corrección de texto sin impacto
   visual material puede comprobar contenido; un cambio de CSS/layout requiere
   observación visual focalizada. **MUST NOT** imponer una matriz global para una
   modificación local ni omitir accesibilidad afectada. Cambios en componentes o
   superficies compartidas exigen al menos el recorrido estándar según
   [`proportional-delivery.md`](../ai-assisted-development/proportional-delivery.md).
6. Una nueva convención visual o de interacción **MUST** documentarse en la fuente
   canónica del proyecto.

Aplicar también
[`../ai-assisted-development/reuse-before-create.md`](../ai-assisted-development/reuse-before-create.md).
