# Agent instructions

Este archivo dirige al conocimiento aplicable; no reemplaza Policies ni documentación.

## Routing

- Reglas corporativas vendorizadas: `engineering/corporate/policies/README.md`.
- Arquitectura y realidad de este proyecto: `engineering/project/README.md`.
- Workflows corporativos para Codex: `.agents/skills/`.
- Workflows corporativos para Claude Code: `.claude/skills/`.

## Precedencia

1. Policies corporativas.
2. Restricciones del proyecto que sean más estrictas.
3. Arquitectura y convenciones existentes.
4. Preferencias del agente.

No debilites una Policy corporativa silenciosamente. Reporta conflictos y exige una
excepción documentada antes de continuar con la decisión afectada.
