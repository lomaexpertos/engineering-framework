---
name: implement-ui-change
description: "Crea o modifica pantallas, componentes, layouts, formularios o navegación reutilizando patrones UI existentes antes de introducir otros."
---

# Implement UI Change

Entregar la interfaz solicitada dentro del lenguaje visual y funcional del proyecto.

## Convenciones y límites

- Consultar `frontend/ui-consistency.md`, `ai-assisted-development/reuse-before-create.md`
  y el design system vigente. Reutilizarlo o extenderlo; una preferencia estética no
  autoriza sustituirlo.
- Conservar contratos de datos, navegación y convenciones de interacción fuera del
  cambio autorizado. No inventar endpoints ni requisitos de negocio.
- Documentar una convención visual nueva o una extensión material en la fuente
  canónica del proyecto, no en otro catálogo corporativo.
- Si la UI participa en autorización, facturación, corrección u otra acción crítica,
  verificar el logging requerido por `development/logging.md` en la frontera
  responsable; no sustituir evidencia confiable por logs de cada clic.
- El modelo decide composición y técnica; no imponer una receta de componentes.

## Resultado esperado

Evidencia del comportamiento, accesibilidad y estados afectados según la Policy.
Explicar únicamente lo reutilizado o creado, su razón y las validaciones relevantes.
