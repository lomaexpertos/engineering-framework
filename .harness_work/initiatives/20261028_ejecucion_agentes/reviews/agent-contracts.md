# Revisión de contratos y cobertura del ejecutor

Revisor: agent-docs. Fecha: 2026-10-28.

Independencia: revisión de código runtime, perfiles y distribución escrita por otros
agentes. Este revisor escribió docs/policies/skills/schemas; su comprobación de esos
archivos es autoevaluación y no se presenta como revisión independiente.

Estado: hallazgos de runtime corregidos y suite enfocada aprobada en Docker tras
reinspección. La aceptación de los dos recorridos mixtos y la auditoría integral
siguen registrándose por el coordinador; esta revisión no sustituye esa evidencia.

## Cobertura de los 17 requisitos

| Requisito | Evidencia inspeccionada | Estado observado |
| --- | --- | --- |
| 1. CLI nativo ligero | `tooling/harness-agents.mjs`, wrapper `templates/project/.harness/agents.sh` | Implementado en fuente; sin servidor/BD/dependencias npm. |
| 2. Capas y ownership | `agent-profiles.mjs`, distribución de `agent-*` y wrapper en `sync-consumer.mjs` | Implementado; perfiles XDG fuera del inventario del consumidor. |
| 3. Setup/doctor/operaciones | `agent-profiles.mjs` y dispatch CLI | Setup asistido, diagnóstico y backups; operaciones presentes. Prueba de cliente no se confunde con autenticación. |
| 4. Perfiles y autoridad | `validatePersonal`, `validateProject`, `readConfiguration`, `doctor` | Límites con mínimo, roles explícitos y allowlists. Gate de lanzamiento añadido durante revisión. |
| 5. Adaptadores | `agent-adapters.mjs`, fuentes oficiales en metadata y docs | Tres adaptadores; OpenCode V2, permisos/argv explícitos. Evidencia de CLI real reportada por autor en `evidence/agent-clients.log`, sin certificar modelos reales. |
| 6. Contratos | `validateTask`, `validateResult`, `validateWorkflow`, `schemas/agent-*.schema.json` | Formatos y rechazo de campos desconocidos presentes; esquema de escalamiento alineado. |
| 7. Arranque mínimo | `contextPrompt`, snapshots y capabilities | Historial omitido, contexto acotado, workspace/repositorio comprobado; permisos cliente diferenciados del OS. |
| 8. Workflow completo | `agent-workflow.mjs` | Etapas, gates, correcciones y escalamiento presentes; verificación exige pruebas del último writer sobre baseline final. |
| 9. Preguntas/respuestas | `needs_input`, CLI `--answers`, archivos `answers-<token>.json` | Persistencia y dependencia explícita de definición/último writer; índice de rutas permite consultar detalles fuera del presupuesto del prompt. |
| 10. Cinco revisiones | `reviews`, applicability UI/UX y policies | Roles funcional, seguridad, logging, UI y UX presentes; observación visual sigue responsabilidad verificable del coordinador. |
| 11. Baseline y ownership | snapshots, solapamiento de ownership, conflicto lector/escritor, rounds | Protecciones implementadas; consolidación semántica de hallazgos corresponde al coordinador. |
| 12. Procesos/recuperación | supervisor, `/proc` identity, timeout/cancel, status, collect | Recuperación consulta/espera/recoge sin relanzar completed/running; suite enfocada incluye rejoin, cancelación y timeout. |
| 13. Checkpoints memoria | policy memory-and-continuity y coordinate-work | Obligación metodológica explícita; no se afirma consolidación semántica automática. |
| 14. Cierre integrado | `assertNoOpenAgents`, `harness-work.mjs`, sync preflight | Workers no recogidos y workflow abierto bloquean cierre/update. Retención existente preservada. |
| 15. Policies/skills/docs | ADR0016, arquitectura, routers y skills | Fuente estructural validada en Docker; evaluación semántica propia de documentación. |
| 16. Validación | tests perfiles/clientes/ejecución/integración y suite | Archivos presentes/en integración. Evidencia final de suite y dos recorridos mixtos corresponde al coordinador. |
| 17. Alcance/commits | historial Git y arquitectura | Entregas lógicas presentes; Pi/servidor/UI/BD/selección autónoma quedan fuera del alcance inicial aprobado. |

## Hallazgos y seguimiento

### B1 — Restricciones del equipo omitidas al lanzar

Observación inicial: `runTask` usaba `readConfiguration` sin aplicar allowlists de
adaptadores/modelos comprobadas por `doctor`. Era posible saltar el diagnóstico y
lanzar una combinación no admitida. Corregido en fuente: `runTask` llama a `doctor`
y rechaza diagnóstico fallido. Reinspeccionado tras corrección; suite enfocada aprobada.

### B2 — Respuestas efímeras y continuidad entre etapas

Observación inicial: `--answers` solo quedaba en runtime/launch.json y era eliminado
al terminar. Corregida persistencia en fuente mediante `answers-<token>.json`.
Reinspección: contexto de dependencias incluye respuestas versionadas y el workflow
mantiene definición y último writer como dependencias de las etapas posteriores.

### B3 — Dependencias sin contexto de entrega

Observación inicial: el prompt contenía únicamente IDs de dependencia. Corregido en
fuente: `contextPrompt` incorpora resultados de dependencias, etiquetados como
evidencia no confiable. Reinspección: índice completo de rutas a entregas/respuestas
fuera del texto limitado permite progressive disclosure de lo truncado.

### B4 — Verificación final readonly y evidencia de pruebas

Claude/OpenCode readonly no tienen shell. El objetivo de verificación se ajustó para
contrastar evidencia heredada cuando no puedan ejecutar pruebas. El gate actual
aceptaba una declaración passed con evidencia textual. Reinspección: exige además
prueba pasada del último writer y coincidencia de su final_snapshot con la versión
entregada. Docs distinguen evidencia heredada de ejecución propia del revisor.

### B5 — Recuperación de workflow intentaba relanzar tareas terminadas

Observación inicial: `runWorkflow` invocaba `runTask` para completed sin collect o
running, que rechaza esos estados. Corregido en fuente: espera running y recoge
completed sin relanzar. Suite enfocada de procesos incluye rejoin de sesión viva.

### B6 — Esquemas y validadores de campos adicionales

Los esquemas prohíben campos adicionales. Reinspección: runtime rechaza campos
task/result y objetos anidados verification/findings; workflow se valida con su
esquema al leer/guardar. El esquema incluye decisiones de hallazgo y escalamiento.

### B7 — Workflow incompleto permitía cierre

Observación inicial: assertNoOpenAgents aceptaba un objeto con solo stage
ready_to_close. Corregido en fuente: valida esquema completo y exige historia final
de definición, implementación, revisión y verificación. Fixture de integración ya
usa un workflow válido y cancelación explícita, sin fabricar una aprobación incompleta.

### R1 — Enlace de documentación distribuida

El README de checks enlazaba a docs de fuente que no se distribuyen en el core.
Corregido durante integración a destinos de skill/schema distribuidos. El validador
estructural pasó; el coordinador ejecuta además el piloto del consumidor.

## Comprobaciones de esta revisión

- Inspección de fuentes de ejecución, workflow, perfiles, adaptadores, distribución y lifecycle.
- `git diff --check`: sin errores observados.
- `docker run --rm --network none --mount type=bind,src=/home/aloranca/engineering-framwork,dst=/workspace,readonly engineering-harness-validation:2.0.0 node tooling/validate-framework.mjs`: exit 0; estructura, links, skills, routing y contratos canónicos aprobados. Repo actual montado readonly, imagen usada como entorno Node22.
- No se ejecutaron modelos reales ni se usaron credenciales desde esta revisión.
- Revalidación posterior en el mismo entorno Docker, encadenada: `node tooling/test-agent-execution.mjs && node tooling/test-agent-integration.mjs && node tooling/validate-framework.mjs`, exit 0. Incluye agentes simulados, preguntas/respuestas, cinco revisores, corrección, timeout/cancelación, rejoin, ownership y gates de lifecycle/distribución.
- `node tooling/test-agent-profiles.mjs` en el mismo entorno, exit 0.
- Se inspeccionó `evidence/agent-clients.log`: clientes reales con transporte HTTP local determinista y credenciales ficticias; esa evidencia distingue integración de CLI de calidad de modelos.
