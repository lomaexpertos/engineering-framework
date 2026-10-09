---
name: audit-agent-context
description: Audita en modo read-only AGENTS.md, READMEs, índices y Skills para detectar contexto excesivo, routing ambiguo, duplicados, huérfanos, enlaces rotos o divergencia Codex/Claude. No modifica archivos; las reparaciones usan configure-agent-context.
---

# Audit Agent Context

Entregar un diagnóstico de descubrimiento y autoridad, sin modificar archivos.

## Contratos y alcance

- Aplicar `ai-assisted-development/context-management.md`,
  `documentation-maintenance.md`, `skill-design.md` y precedencia.
- Examinar routers, Skills y fuentes relacionadas con el alcance solicitado;
  no cargar dominios irrelevantes ni confundir tamaño con defecto.
- Comprobar routing, autoridad única, referencias y, cuando haya instalación,
  versión/procedencia y paridad de las dos copias corporativas.
- Evaluar si las Skills conservan restricciones, resultados y convenciones propias,
  sin manuales genéricos ni procedimientos que amplíen el encargo.
- No crear reportes persistentes por defecto ni proponer reparar copias generadas;
  dirigir esas reparaciones a la fuente y al sincronizador.
- El modelo decide cómo inspeccionar; no exigir un checklist fijo de auditoría.

## Clasificación y resultado

**Bloqueante:** router corporativo roto, conflicto normativo sin precedencia, contenido
generado alterado como fuente o fuente crítica inalcanzable.
**Alta:** manuales obligatorios en el router, duplicación
contradictoria o divergencia corporativa entre agentes. **Media:** routing ambiguo,
verbosidad material u ownership confuso sin contradicción demostrada.
**Baja:** concisión u organización sin impacto sobre la decisión.

Entregar hallazgos con archivo, evidencia, impacto y reparación, seguidos por tamaños
de routers, alcance/profundidad del routing, fuentes huérfanas, paridad cuando sea
observable, comprobaciones omitidas y riesgos residuales. Separar artefactos temporales
de fuentes longevas. Una corrección posterior usa `configure-agent-context`.
