---
name: audit-agent-context
description: Audita en modo read-only AGENTS.md, READMEs, índices y Skills para detectar contexto excesivo, routing ambiguo, duplicados, huérfanos, enlaces rotos o divergencia Codex/Claude. No modifica archivos; las reparaciones usan configure-agent-context.
---

# Audit Agent Context

Evaluar si un agente puede descubrir la fuente correcta con el mínimo contexto
necesario. Esta Skill informa problemas; no reescribe archivos.

## Alcance y autoridad

1. Leer `AGENTS.md`, `FRAMEWORK_VERSION` y los routers corporativos y de proyecto.
2. Aplicar `context-management.md`, `documentation-maintenance.md` y precedencia.
3. Mantener la inspección read-only. No crear reportes persistentes por defecto.
4. No tratar tamaño o cantidad de Markdown como defecto por sí solos.
5. No proponer editar archivos generados; dirigir su reparación al framework o bot.

Leer [references/audit-checklist.md](references/audit-checklist.md) para la revisión
completa. Cargar contenido hoja únicamente cuando el router, metadata o una posible
contradicción lo haga necesario.

## Workflow

1. Inventariar rutas Markdown, tamaños, encabezados y ubicaciones de Skills.
2. Reconstruir el grafo de descubrimiento desde `AGENTS.md` y routers intermedios.
3. Verificar que Policies, documentación del proyecto y Skills mantengan roles y
   ownership distintos.
4. Muestrear tareas representativas y comprobar que cada una llega a contexto concreto
   sin exigir leer dominios irrelevantes.
5. Detectar duplicación semántica, autoridad ambigua, instrucciones contradictorias,
   fuentes longevas huérfanas y routing circular o excesivamente profundo. No tratar
   artefactos temporales como huérfanos por carecer de un índice permanente.
6. Comprobar enlaces, rutas retiradas, nombres genéricos y consistencia de índices.
7. Comparar inventarios de `.agents/skills/` y `.claude/skills/`, versión y archivos;
   estimar además el costo agregado de nombres, descripciones y rutas para discovery.
   No interpretar diferencias generadas como permiso para sincronizar manualmente.
8. Clasificar hallazgos por impacto sobre corrección y descubrimiento.

## Severidad

- **Bloqueante:** ausencia o ruptura del router corporativo, conflicto normativo sin
  precedencia, contenido generado modificado o fuente crítica inalcanzable.
- **Alta:** `AGENTS.md` obliga a cargar manuales extensos, duplicación contradictoria,
  Skill faltante en una plataforma o documentación vigente imposible de descubrir.
- **Media:** routing ambiguo, índice incompleto, verbosidad sustancial o ownership poco
  claro sin contradicción demostrada.
- **Baja:** naming, organización o concisión mejorable sin afectar la decisión actual.

## Salida

Entregar primero los hallazgos, cada uno con severidad, archivo, evidencia, impacto y
reparación esperada. Después resumir:

- tamaño y función de routers principales;
- fuentes longevas alcanzables y huérfanas, separadas de artefactos temporales;
- profundidad máxima observada del routing;
- paridad Codex/Claude;
- validaciones no ejecutadas; y
- riesgos residuales.

Si el usuario solicita corregir, transferir los hallazgos a
`configure-agent-context`; no duplicar allí la investigación ya realizada.
