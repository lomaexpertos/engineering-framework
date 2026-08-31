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
- Incorporar validación automática de enlaces, rutas, metadata, tamaños orientativos y
  paridad de Skills durante la fase Compliance.

La automatización detectará estructura y divergencias deterministas. La autoridad,
ambigüedad semántica y calidad del routing seguirán requiriendo revisión contextual.
