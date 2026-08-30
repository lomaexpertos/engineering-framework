# Installed Skills capability audit

Fecha de revisión: 2026-08-30.

## Objetivo

Verificar que la migración preserve capacidades útiles sin conservar monolitos que
mezclen normas, procedimientos y documentación. La fuente auditada fue
`/home/aloranca/skills`; el resultado canónico vive en `policies/` y `skills/`.

## Resultado por fuente

| Fuente | Capacidades preservadas | Destino | Estado |
| --- | --- | --- | --- |
| `spec-definir` | expediente, AS-IS, Best Practice, TO-BE, brechas, RF/BR/P, checklist y readiness | `spec-definir`, `spec-analizar`, `research-best-practices` y referencias | Cubierto |
| `spec-clarificar` | respuestas trazables, clarificaciones, conflictos, actualización de estados y bloqueo de planeación | `spec-clarificar` y referencia de formatos | Cubierto |
| `spec-planear` | estrategia, `plan.md`, tareas Txxx, test plan, rollout y rollback | `spec-planear` y referencia de artefactos | Cubierto |
| `spec-implementar` | ejecución por tareas, evidencia, desviaciones, pruebas, review y actualización permanente | `spec-implementar`, Skills especializadas y `spec-documentar` | Cubierto |
| `spec-documentar` | línea base permanente de módulo, dominio, submódulo, proceso o flujo; índice, evidencia, snapshots e IDs | `spec-documentar` y dos referencias cargables | Cubierto; se corrigió el renombre incorrecto a `document-architecture` |
| `explorador-de-dominio` | tutoría, mapa, heurísticas, investigación, trazabilidad y evaluación de preparación | `explorador-de-dominio` y cuatro referencias; workflows focalizados para discovery e investigación | Cubierto |
| `engineering-code-standards` | arquitectura, calidad, errores, dependencias, dominio, seguridad, concurrencia, integración, performance, pruebas y observabilidad | Policies por dominio y Skills focalizadas de implementación/revisión | Cubierto sin restaurar el monolito |
| `database-engineering-standards` | naming, identificadores, auditoría, integridad, tipos, índices, SQL manual, layout, datos y rutinas | Policies de base de datos y cuatro Skills focalizadas | Cubierto sin restaurar el monolito |
| `branch-quality-review` | selección de base, routing de riesgo, radio de impacto, rigor, hallazgos trazables y reporte persistente | `branch-quality-review`, referencias y revisiones focalizadas | Cubierto |

## Descomposición de standards anteriores

### `engineering-code-standards`

| Capacidad anterior | Destino canónico |
| --- | --- |
| Routing de riesgo y rigor | `implement-feature/references/risk-routing.md` y `branch-quality-review` |
| Arquitectura, DDD y patrones | `policies/development/architecture-and-design.md` |
| Código limpio y errores | `code-quality.md` y `error-handling.md` |
| Dependencias y contratos externos | `dependencies.md`, `distributed-systems.md` e `implement-distributed-integration` |
| Invariantes, dinero, tiempo y estados | `domain-integrity.md` e `implement-critical-state-change` |
| Concurrencia e idempotencia | `concurrency-and-idempotency.md`, implementación y revisión focalizadas |
| Eventos, colas, webhooks y fallas parciales | `distributed-systems.md` e `implement-distributed-integration` |
| Frontend y UX | Policies frontend e `implement-ui-change` |
| Performance y resiliencia | `performance-and-resilience.md` y `optimize-performance` |
| Seguridad | Policies security y `security-review` |
| Pruebas y observabilidad | `testing.md`, `validation-before-completion.md` y `add-observability` |
| SQL de aplicación | Policies database y Skills de base de datos por efecto |

### `database-engineering-standards`

| Capacidad anterior | Destino canónico |
| --- | --- |
| Naming de tablas y entidad dominante | `schema-conventions.md` |
| PK, FK, relaciones, constraints y objetos | `relational-integrity.md` y `object-naming.md` |
| UUID, Nano ID y fallback | `schema-conventions.md` con la decisión aprobada vigente |
| Auditoría, `status` y borrado | `record-lifecycle.md` |
| Tipos, dinero, fechas, texto y JSON | `data-types.md` |
| Índices y planes | `indexes.md` y `optimize-database-query` |
| Migraciones, backfills y reparaciones | `sql-change-delivery.md`, `data-change-safety.md` y Skills por efecto |
| SQL manual y diferencias por motor | `manual-sql-execution.md` |
| Layout de artefactos | `sql-artifact-layout.md` |
| Funciones, procedimientos y triggers | `routine-safety.md` y `database-routine-change` |
| Compatibilidad de despliegue | `deployment-compatibility.md` y `database-schema-change` |

## Decisiones prevalecientes

- Tablas en español, plural, `snake_case` y con entidad dominante primero.
- UUIDv7 cuando exista generación validada; Nano ID de al menos 14 caracteres y
  alfabeto seguro como alternativa; autoincremento solo por compatibilidad justificada.
- Auditoría mediante `registro_autor_id`, `registro_fecha`,
  `actualizacion_autor_id` y `actualizacion_fecha` cuando aplique.
- Borrado lógico por `status`; borrado físico limitado a casos efímeros, obligaciones
  de eliminación o excepciones aprobadas.
- SQL literal manual como entrega predeterminada; migración en código solo cuando se
  solicite y conservando los mismos controles.

Estas decisiones sustituyen cualquier recomendación histórica incompatible, como usar
UUIDv4 automáticamente como fallback.

## Progressive disclosure verificado

1. `AGENTS.md` dirige a routers, no replica el contenido.
2. Los routers de Policies separan cada riesgo normativo por tema.
3. Las Skills conservadas tienen un trigger y una salida distinguibles.
4. Material condicional vive en `references/` y se carga desde la Skill aplicable.
5. `engineering-code-standards` y `database-engineering-standards` no se publican como
   Skills paralelas porque duplicarían Policies y activarían demasiado contexto.
6. Las Skills focalizadas no sustituyen la Policy: la aplican mediante su workflow.

## Límites de esta revisión

La auditoría confirma cobertura documental y routing. El enforcement ejecutable, el
artefacto vendorizado y la prueba real de descubrimiento en Codex y Claude Code
pertenecen a las fases de Distribution y Compliance.
