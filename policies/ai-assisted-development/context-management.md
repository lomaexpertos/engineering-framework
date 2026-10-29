# Context management

## Purpose

Mantener una arquitectura de instrucciones que permita descubrir solo el conocimiento
necesario para la tarea actual, sin perder autoridad, alcance ni trazabilidad.

## Document roles

- `AGENTS.md`: invariantes universales, precedencia y routing; no es un manual.
- README o índice de dominio: mapa de temas y condiciones de lectura.
- Policy: regla normativa corporativa.
- Skill: contrato de trabajo reusable con trigger, restricciones y resultado propios;
  su diseño se rige por [`skill-design.md`](skill-design.md).
- Documentación del proyecto: descripción verificable del sistema real.
  Su jerarquía e investigación AS-IS siguen
  [`domain-documentation.md`](domain-documentation.md).
- ADR vigente: conocimiento duradero con razones y sucesor; reportes e historial de trabajo: evidencia temporal.

## Requirements

1. `AGENTS.md` **MUST** funcionar como router compacto y **MUST NOT** duplicar manuales, catálogos completos o procedimientos extensos.
2. El agente **MUST** cargar primero el router más cercano y después únicamente las Policies, documentación y Skills relevantes para la tarea.
3. Cada entrada de routing **MUST** expresar una condición reconocible y un destino canónico; frases como “consulta la documentación relevante” **MUST NOT** sustituir routing concreto.
4. Un README de dominio **MUST** mantener routing por tipo de cambio y enlazar la fuente canónica de cada tema.
5. Un directorio con varios documentos vigentes **SHOULD** tener un README o índice cuando el nombre de los archivos no permita descubrir de forma inequívoca cuál aplica.
6. Cada documento **MUST** tener un propósito, alcance y autoridad distinguibles. Un mismo archivo **SHOULD NOT** mezclar normas corporativas, realidad del proyecto, procedimientos e historial.
7. Una regla o explicación canónica **MUST NOT** copiarse en varios routers. Los routers **MUST** resumir el propósito y enlazar la fuente.
8. Una fuente vigente y de larga vida —Policy, estándar, Skill, router, documentación
   canónica o ADR— **MUST** quedar alcanzable desde un router canónico en el mismo
   cambio.
9. Material condicional, ejemplos extensos, plantillas y checklists **SHOULD** vivir en referencias cargables y consultarse solo cuando apliquen.
10. Dos documentos vigentes **MUST NOT** reclamar autoridad canónica sobre el mismo contrato sin una precedencia explícita.
11. Nombres genéricos como `misc.md`, `notes.md`, `important.md`, `new-rules.md` o `final.md` **MUST NOT** utilizarse como fuentes permanentes.
12. El contenido vendorizado bajo `.harness/core/`, `.agents/skills/` y `.claude/skills/`, así como cualquier región de `AGENTS.md` marcada como generada, **MUST NOT** editarse como fuente desde el repositorio consumidor.
13. Las Skills corporativas para Codex y Claude Code **MUST** provenir de la misma release; diferencias o faltantes **MUST** corregirse mediante el proceso de distribución, no mediante copias manuales locales.
14. Enlaces rotos, rutas obsoletas y referencias a documentos retirados **MUST** corregirse en el mismo cambio que mueve o elimina contenido.
15. La descripción de una Skill **MUST** comenzar por su caso de uso y distinguir límites relevantes con el mínimo texto suficiente para activación fiable.
16. El catálogo **SHOULD** validar el costo agregado de nombres, descripciones y rutas contra el presupuesto de descubrimiento del agente soportado; medir solo las descripciones **MUST NOT** considerarse evidencia suficiente.

17. Las guías necesarias para operar el harness **MUST** estar distribuidas y
    alcanzables desde sus Skills/routers. Nuevas rutas, contratos y ejemplos **MUST**
    incorporarse al control operativo de `check` y a su prueba de consumidor; el
    checkout del productor **MUST NOT** ser un prerrequisito de uso normal.

## Artefactos sin routing permanente

Specs, planes, preguntas, trazabilidad de implementación, reportes de revisión,
auditorías, notas de investigación y timelines de incidentes **MAY** permanecer sin un
enlace desde los routers permanentes mientras sean evidencia temporal, tengan una
ubicación conocida y no reclamen autoridad vigente.

Estos artefactos **MUST NOT** obligar a mantener catálogos acumulativos. Cuando una
decisión o explicación temporal se convierta en conocimiento estable, su contenido
vigente **MUST** trasladarse o resumirse en la Policy, estándar, ADR o documentación
canónica correspondiente y quedar enlazado desde su router.

## Size guardrails

1. Todo `AGENTS.md` **MUST** tener como máximo 100 líneas físicas, incluidas vacías; concentrarse en información universal del alcance. El preflight verifica el resultado antes de escribir, sin truncar contenido local.
2. Un README usado principalmente como router **SHOULD** mantenerse por debajo de 8 KiB.
3. Superar un límite **MUST NOT** provocar división mecánica. El contenido debe separarse por trigger, dominio o autoridad, y cada nuevo documento debe quedar correctamente cableado.
4. Cumplir el límite de tamaño **MUST NOT** justificar lenguaje ambiguo, pérdida de una invariante o eliminación de contexto necesario.

## Ambiguity controls

1. Términos como “cuando corresponda”, “adecuado” o “seguir estándares” **SHOULD** acompañarse de la condición, autoridad o router que permite resolverlos.
2. Cuando dos fuentes discrepen, el agente **MUST** identificar ambas, aplicar precedencia y detener únicamente la decisión material que no pueda resolverse.
3. Un índice **MUST NOT** declarar cobertura completa si existen áreas conocidas sin documentar; los vacíos deben quedar visibles.
