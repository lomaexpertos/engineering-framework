# Agent instructions

Este archivo dirige al conocimiento aplicable; no reemplaza Policies ni documentación.

<!-- engineering-framework:start -->
## Corporate engineering framework

- Reglas corporativas: `engineering/corporate/policies/README.md`.
- Skills corporativas para Codex: `.agents/skills/`.
- Skills corporativas para Claude Code: `.claude/skills/`.
- Layout de documentación, specs y revisiones del proyecto:
  `engineering/corporate/policies/ai-assisted-development/project-artifact-layout.md`.
- Cambios a `AGENTS.md`, READMEs, índices o routing documental: consulta
  `engineering/corporate/policies/ai-assisted-development/context-management.md` y
  usa `configure-agent-context`; para revisión read-only usa `audit-agent-context`.

## Precedencia

1. Policies corporativas.
2. Restricciones del proyecto que sean más estrictas.
3. Arquitectura y convenciones existentes.
4. Preferencias del agente.

No debilites una Policy corporativa silenciosamente. Reporta conflictos y exige una
excepción documentada antes de continuar con la decisión afectada.
<!-- engineering-framework:end -->
