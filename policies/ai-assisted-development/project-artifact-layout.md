# Project artifact layout

## Purpose

Separar metodología distribuida, conocimiento duradero y trabajo descartable.

## Ownership

| Ruta del consumidor | Autoridad |
| --- | --- |
| `.harness/core/` y wrappers administrados | Salida generada; actualizar desde la fuente, no editar localmente. |
| `.harness/project/` | Policies, skills, configuración y checks propios del proyecto. |
| `docs/` | Conocimiento y planificación de alto nivel del proyecto. |
| `.harness_work/memory/` | Continuidad operativa general. |
| `.harness_work/initiatives/<id>/` | Alcance, estado, handoffs, revisiones y evidencia temporal. |
| `.harness_work/runtime/` | Locks y journals locales; ignorados en Git. |
| `.agents/skills/`, `.claude/skills/` administradas | Adaptaciones generadas desde la misma release. |

## Requirements

1. El actualizador **MUST NOT** sobrescribir documentación, memoria, expedientes o
   extensiones locales. Retirar contenido requiere ownership demostrado.
2. `docs/README.md` **MUST** dirigir al conocimiento vigente. Se permiten fuentes
   temáticas por producto, sistema o dominio; un README basta para un dominio pequeño.
3. `docs/decisions/` conserva decisiones duraderas, razones, consecuencias, estado y
   sucesor. Los ADR no se clasifican como evidencia descartable.
4. `docs/invariants.md` **SHOULD** ser un índice de fuentes canónicas, sin repetir
   explicaciones de invariantes de dominio. `docs/roadmap/` describe resultados
   futuros, avance y pendientes altos; no presenta TO-BE como comportamiento vigente.
5. Un expediente nuevo **MUST** usar `YYYYMMDD_nombre_descriptivo` ASCII. Las tareas
   relacionadas reutilizan la iniciativa y mantienen IDs internos de tarea.
   Su necesidad y contenido siguen [proportional-delivery.md](proportional-delivery.md);
   un mínimo directo no exige expediente.
6. Spec, plan, evidencia, reportes y resultados delegados **MUST** vivir dentro del
   expediente. No requieren índices históricos permanentes ni enlaces desde docs.
7. Código, tests, SQL, assets e infraestructura ejecutables **MUST** permanecer en las
   rutas productivas del proyecto, no dentro de un expediente descartable.
8. No se deben crear carpetas o documentos vacíos para capacidades no utilizadas.
9. Migrar contenido heredado es una operación autorizada separada del update.
   **MUST NOT** producir dos fuentes canónicas ni borrar el contexto heredado por edad.
10. El productor **MAY** mantener fuentes visibles en `policies/`, `skills/`, `checks/`
    y `tooling/`, con conocimiento propio en `docs/`; no debe vendorizarse a sí mismo.

Para continuidad, consultar [memory-and-continuity.md](memory-and-continuity.md);
para cierre y retención, [initiative-lifecycle.md](initiative-lifecycle.md).
Las rutas SQL e infraestructura siguen en sus Policies especializadas.
