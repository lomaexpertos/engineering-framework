# Implementación y auditoría de aceptación

Fecha: 2026-10-28. Resultado funcional: completo, listo para revisión/publicación local.
Fuente de requisitos: [spec.md](../spec.md). Plan: [plan.md](../plan/plan.md).
Código validado: `52498b356d17b6dd8b854eb0f015f2da205511d6`; las consolidaciones
documentales/cierre posteriores no cambian el código ejecutado por las pruebas.

## Evidencia final observada

- Suite Docker completa: exit 0; [salida](../evidence/final-validation.log).
  Incluye validador, gate real de cambio de versión, sintaxis JS/Bash, ShellCheck,
  shfmt, patrones de credenciales, distribución, publicación simulada, trabajo,
  checks, runners, perfiles y piloto extremo a extremo.
- Clientes CLI reales: exit 0; [salida](../evidence/final-clients.log).
  Codex 0.165.0 y Claude Code 2.1.312: instrucciones, metadata de skill local y cuerpo
  diferido verificados por peticiones reales al mock loopback, sin modelo externo.
- Seguridad de distribución: [revisión independiente](../reviews/security.md).
  SEC-001/002/004 corregidos y con regresiones; SEC-003 verificado con wrapper real
  desde worktree enlazado y metadata Git externa de solo lectura.
- Calidad de superficies ajenas al autor de distribución:
  [veredicto Entregable](../reviews/2026-10-28-0434-branch-quality-review.md).
  FQ-001 y FQ-002 corregidos y revalidados, sin bloqueantes/recomendaciones pendientes.
- Wrappers de instalación/update/check/work reales y origen local inmutable:
  [evidencia de distribución](../agents/distribution/result.md).
- Origen público comprobado por GET anónimo a GitHub REST sobre
  `lomaexpertos/engineering-framework`: `private:false`, `visibility:public`, rama
  por defecto `main`. No se publicó esta revisión local.

## Entregables del plan comprobados

| Tarea | Entrega actual |
| --- | --- |
| T001 | Contratos de ownership, precedencia, ciclo de vida y ADR sucesores vigentes. |
| T002 | Schemas, plantillas opcionales y routers con AGENTS limitado antes de escribir. |
| T003 | Coordinación, memoria y handoffs; workers/revisores reales de esta entrega y retoma reproducible por proceso nuevo. |
| T004 | Documentación temática, roadmap y cierre con consolidación semántica explícita. |
| T005 | Matriz de revisión, runner común, checks, linters y configuración extensible. |
| T006 | Núcleo empaquetado, bootstrap/update de una llamada, manifest, locking y recuperación probados. |
| T007 | Retención UTC, holds, referencias y purga por lote recuperable verificados. |
| T008 | Migración 1.x, wrappers/worktree reales, piloto completo y discovery de ambas CLI. |
| T009 | Documentación vigente, decisiones/invariantes, roadmap, backlog y cierre del expediente con evidencia. |

## Matriz de cumplimiento actual

| RF | Evidencia de resultado, no solo intención | Estado |
| --- | --- | --- |
| 001 | Distribución conserva docs, extensiones, skills ajenas, HEAD e índice; rechaza ownership desconocido. Fixtures y revisión de seguridad. | Cumplido |
| 002 | Validador exige AGENTS ≤100 líneas; preflight rechaza también el resultado combinado; routing y presupuestos comprobados. | Cumplido |
| 003 | Plantillas por dominio/tema y docs reales del productor; piloto conserva contenido duradero idéntico tras purga. | Cumplido |
| 004 | Memoria general, brief/resume/handoff y estado estructurado; proceso nuevo reconstruye contexto desde encargo y resultado acotados. | Cumplido |
| 005 | Skills/policy de coordinación con ownership; ejecución real de esta entrega por trabajadores y revisores separados. Piloto comprueba contrato de handoff; fallback secuencial documentado sin inventar agentes. | Cumplido |
| 006 | Runtime y regresiones de estados, bloqueo/pausa, cancelación, cierre/reapertura, cronología y contradicciones. | Cumplido |
| 007 | Matriz por riesgo y revisiones independientes de código/integración/seguridad. No hay UI gráfica que requiera captura; UX operativa se verifica mediante errores/estados y su contrato queda distribuido. | Cumplido |
| 008 | close exige ocho categorías, fuentes existentes, ausencia de bloqueantes/tareas y documentación sin enlaces temporales, incluidos enlaces de referencia codificados. | Cumplido |
| 009 | Roadmap/backlog permanentes de alto nivel, decisiones e invariantes actuales; piloto verifica supervivencia sin expediente. | Cumplido |
| 010 | Pruebas 59/60 días UTC, hold, reapertura, referencias entrantes, cambios Git y lote interrumpido/restaurado; nada se purga automáticamente. | Cumplido |
| 011 | Wrappers reales obtienen snapshot, validan y aplican; idempotencia, --check, --repair, MAJOR, recuperación y proceso interrumpido probados. | Cumplido |
| 012 | Config/runners locales, perfiles y adaptadores project-*; fuentes/referencias propias sobreviven update y retiro de perfiles. | Cumplido |
| 013 | Fuente única y paridad de adaptadores; discovery real de ambas CLI con metadata diferida. No se confunde con certificación de modelos/subagentes. | Cumplido |
| 014 | Runners Docker con argv literal, timeout real exit124, limpieza por label y ledger de configuración; fallos/sin evidencia en los cinco scopes incorporados nunca dan éxito. | Cumplido |
| 015 | Dockerfiles versionados, runtime sin socket/red host ni credenciales, pruebas con imágenes declaradas; invariante distribuida explícitamente. | Cumplido |
| 016 | Fixture 1.2.0 requiere MAJOR explícito, conserva docs heredadas y rechaza colisiones; worktree real y symlink ajeno preservados. | Cumplido |
| 017 | Árbol opcional, 30 skills, discovery dentro de 8.000 caracteres por plataforma, memoria ≤100 líneas, sin directorios vacíos obligatorios. | Cumplido |
| 018 | Estados no ejecutado/no aplicable/fallido separados, false greens corregidos; cierre, validación, publicación y despliegue se distinguen. | Cumplido |

## Entorno y comandos usados en validación final

Imagen principal: `engineering-harness-validation:2.0.0`, target `validation`.
ID inmutable en [validation-image.id](../evidence/validation-image.id).
Contenedor efímero: `engineering-harness-validation-final-20261028`, sin red.

```bash
docker build --target validation -t engineering-harness-validation:2.0.0 .
docker run --rm --network none engineering-harness-validation:2.0.0
```

La ejecución observada usó el ID capturado mediante `--iidfile`, montó únicamente
`changed-files.txt` readonly y definió `VALIDATION_CHANGED_FILES_PATH` para verificar
el cambio de versión contra la base `019c35b`, sin el skip de ejecución manual.

Imagen de clientes: `engineering-harness-client-compatibility:20261028`, Dockerfile
propio sin target adicional. ID en [client-image.id](../evidence/client-image.id).
Contenedor: `engineering-harness-clients-final-20261028`, sin red/mounts de credenciales.

```bash
docker build -f tooling/client-compatibility/Dockerfile -t engineering-harness-client-compatibility:20261028 .
docker run --rm --network none engineering-harness-client-compatibility:20261028
```

No se instalaron dependencias del proyecto en host. Los servicios HTTP del smoke
escucharon exclusivamente en loopback del contenedor. No hay servicios persistentes
del proyecto; se conservan imágenes/cachés útiles para siguientes verificaciones.

## Decisiones consolidadas y límites

Las razones permanentes viven en ADR-0013/0014, arquitectura, invariantes y políticas;
este expediente conserva solo evidencia y trazabilidad descartables.

- Productor: fuentes visibles y trabajo oculto, sin vendorizarse a sí mismo.
- Consumidor: núcleo/extensiones separados de docs y expedientes.
- Perfiles limitan discovery, sin ocultar fuentes normativas; namespace local project-*.
- Actualizaciones atómicas por archivo y recuperación que preserva ediciones ajenas.
- Imágenes operativas se ejecutan por ID; el cierre conserva responsabilidad semántica.

No hay dudas funcionales bloqueantes pendientes. Próxima iteración: adopción real
con modelos/proyectos, adaptadores adicionales, autenticidad de releases y contratos
especializados según demanda; constan en el backlog/gobernanza permanentes.

No se realizó push, publicación/tag, despliegue, scheduler ni adopción sobre proyectos
reales. La actualización pública de esta versión requiere publicar/integrar la entrega.
