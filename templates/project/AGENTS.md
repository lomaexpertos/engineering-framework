# Agent instructions

Este archivo dirige al conocimiento aplicable; no reemplaza Policies ni documentación.

<!-- engineering-framework:start -->
## Harness de ingeniería

- Reglas corporativas: `.harness/core/policies/README.md`.
- Compilar, preparar, probar o ejecutar el proyecto: Docker, conforme a
  `.harness/core/policies/infrastructure/project-isolation.md`.
- Desarrollo o corrección de operaciones críticas: aplicar desde el mismo cambio
  `.harness/core/policies/development/logging.md` y validar su trazabilidad;
  no esperar un incidente ni una petición separada de logs.
- Skills corporativas para Codex: `.agents/skills/`.
- Skills corporativas para Claude Code: `.claude/skills/`.
- Layout de documentación, specs y revisiones del proyecto:
  `.harness/core/policies/ai-assisted-development/project-artifact-layout.md`.
- Cambios a `AGENTS.md`, READMEs, índices o routing documental: consulta
  `.harness/core/policies/ai-assisted-development/context-management.md` y
  usa `configure-agent-context`; para revisión read-only usa `audit-agent-context`.
- Conocimiento duradero y roadmap: `docs/README.md`, si existe.
- Continuidad y expedientes: `.harness_work/README.md`, si existe.
- Extensiones propias: `.harness/project/README.md`, si existe.
- Delega la ejecución y revisión siempre que las capacidades y permisos lo permitan;
  conserva responsabilidad de integración, verificación y cierre.
- Antes de cerrar, consolida conocimiento duradero y progreso de alto nivel.
- No edites el núcleo generado. Valida con `bash .harness/check.sh`.

## Precedencia

1. Policies corporativas.
2. Restricciones del proyecto que sean más estrictas.
3. Arquitectura y convenciones existentes.
4. Preferencias del agente.

No debilites una Policy corporativa silenciosamente. Reporta conflictos y exige una
excepción documentada antes de continuar con la decisión afectada.
<!-- engineering-framework:end -->
