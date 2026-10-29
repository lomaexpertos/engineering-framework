# Agent instructions

Este archivo dirige al conocimiento aplicable; no reemplaza Policies ni documentación.

<!-- engineering-framework:start -->
## Harness de ingeniería

- Preguntas de negocio, otros sistemas o deber ser: conversación normal, sin
  workflows por defecto. Para analizar y documentar un módulo del repositorio actual,
  usa `.harness/core/skills/spec-documentar/SKILL.md`; respeta «solo analiza» o
  «sin archivos». Intención y alcance:
  `.harness/core/policies/ai-assisted-development/domain-documentation.md`.
  Antes de cambiar comportamiento, contrasta las fuentes del área y el código vigente.
- Reglas corporativas: `.harness/core/policies/README.md`.
- Recorrido mínimo, estándar o reforzado según riesgo e incertidumbre:
  `.harness/core/policies/ai-assisted-development/proportional-delivery.md`.
- Compilar, preparar, probar o ejecutar la aplicación: Docker. Las herramientas
  transversales del harness usan Node.js 22 o 24 nativo, Bash y Git, conforme a
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
- Para coordinar o delegar, sigue `.harness/core/skills/coordinate-work/SKILL.md`.
  Mínimo permite ejecución directa sin expediente ni perfiles; antes de usar el
  ejecutor, usa `doctor --roles` con los roles del recorrido según esa Skill.
- Conserva integración, verificación y cierre proporcional al recorrido; actualiza
  conocimiento y continuidad cuando cambien, sin crear documentos por casilla.
- No edites el núcleo generado. Ejecuta checks aplicables según
  `.harness/core/checks/README.md`; conserva los checks requeridos del proyecto y CI.

## Precedencia

1. Policies corporativas.
2. Restricciones del proyecto que sean más estrictas.
3. Arquitectura y convenciones existentes.
4. Preferencias del agente.

No debilites una Policy corporativa silenciosamente. Reporta conflictos y exige una
excepción documentada antes de continuar con la decisión afectada.
<!-- engineering-framework:end -->
