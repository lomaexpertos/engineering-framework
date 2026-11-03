# Documentation gardening

Las fuentes normativas son
[`context-management.md`](../../policies/ai-assisted-development/context-management.md)
y
[`documentation-maintenance.md`](../../policies/ai-assisted-development/documentation-maintenance.md).
Este documento no las duplica; registra el enfoque de mantenimiento y enforcement.

## Maintenance workflow

- Auditar periódicamente routing, fuentes huérfanas, duplicación y vigencia con
  `audit-agent-context`.
- Aplicar consolidación, adelgazamiento y recableado con `configure-agent-context`.
- Mantener ownership y revisión proporcionales a la autoridad del documento.
- Mantener validación automática de enlaces, rutas, tamaños orientativos y paridad de
  Skills; incorporar metadata normativa conforme se formalice su contrato.

La validación fuente ya cubre enlaces, referencias alcanzables, catálogo, rutas
retiradas, contratos canónicos seleccionados y presupuesto agregado de discovery. La
metadata normativa sigue pendiente. Los consumidores ejecutan checks de instalación,
contexto, documentación, trabajo y extensiones mediante wrappers con Node.js 22 o 24
nativo, Bash y Git; los checks declarados del producto conservan runners Docker.
La imagen de validación de la fuente es opcional. La consolidación semántica sigue
requiriendo revisión del coordinador.

La automatización detectará estructura y divergencias deterministas. La autoridad,
ambigüedad semántica y calidad del routing seguirán requiriendo revisión contextual.
