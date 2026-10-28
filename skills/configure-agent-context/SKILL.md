---
name: configure-agent-context
description: Inicializa, adelgaza o recablea AGENTS.md, READMEs e índices para progressive disclosure. Usar al crear o reparar routing o documentación ambigua. No edita contenido corporativo vendorizado.
---

# Configure Agent Context

Entregar routers y fuentes de contexto propios del proyecto, sin reescribir contenido corporativo.

## Contratos y límites

- Aplicar `ai-assisted-development/context-management.md`,
  `documentation-maintenance.md` y `skill-design.md` cuando se cambien Skills.
- En un consumidor, `.harness/core/`, las Skills corporativas en
  `.agents/skills/` y `.claude/skills/`, y los bloques administrados de `AGENTS.md`
  son read-only como fuente; dirigir divergencias al sincronizador.
- Preservar restricciones locales válidas, contenido único e historial; no inventar
  ownership ni resolver por preferencia conflictos de autoridad.
- Cada conocimiento estable debe tener una fuente canónica y routing por trigger.
  Specs, preguntas y reportes temporales no requieren índices permanentes.
- `AGENTS.md` tiene un máximo de 100 líneas físicas incluidas vacías. Comprobar el
  resultado completo; preservar reglas propias y resolver su recableado explícitamente.
- Leer [references/target-structure.md](references/target-structure.md) solo si se
  necesita el contrato de estructura de un consumidor.
- El modelo decide cómo inventariar, adelgazar o recablear. No repartir texto
  mecánicamente, crear carpetas vacías o imponer una tabla de trabajo universal.

## Resultado esperado

Routing breve y destinos válidos, sin pérdida de contratos ni ediciones a contenido
generado. Resumir fuentes consolidadas, movimientos/retiros, validación y pendientes.
Detener únicamente una decisión afectada por ownership o autoridad sin resolver.
