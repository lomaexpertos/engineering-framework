# Organizational Skills and critical logging reconciliation

Fecha: 2026-10-09. Versión resultante: `1.2.0`.

## Criterio aplicado

La Skill define nuestras restricciones, el resultado esperado y las nomenclaturas,
convenciones o formas de realizar el trabajo propias del estilo organizacional.
El modelo decide cómo alcanzarlo dentro de ellas. La autoridad normativa es
[`skill-design.md`](../../../policies/ai-assisted-development/skill-design.md).

Se conservan los **28 nombres de Skills**: no se retira una capacidad invocable ni
se cambia el layout consumidor. Se depuran sus cuerpos y se retiran 13 referencias.
No se movieron tutoriales genéricos a Policies ni se tocaron Skills personales del host.

## Reducción de contexto

Medición en bytes UTF-8 contra el estado de trabajo inmediatamente anterior a esta
depuración, no contra una release publicada. Excluye el catálogo `skills/README.md`.

| Material | Antes | Después |
| --- | ---: | ---: |
| 28 archivos `SKILL.md` | 76 303 | 44 559 |
| Referencias (15 antes, 2 después) | 41 879 | 2 693 |
| Total | 118 182 | 47 252 |

Reducción aproximada: **60 %**. Esto mide tamaño, no desempeño del modelo.

## Contenido retirado de los cuerpos

| Skills | Retiro | Qué permanece |
| --- | --- | --- |
| `explorador-de-dominio` | Curso de tutoría, modos pedagógicos, tarjetas, examen de comprensión, cantidad de preguntas, matriz 0/1/2, frase obligatoria de cierre y listas generales de caja, inventarios, suscripciones o manufactura. | Referente propuesto por la IA, contraste AS-IS/referente/TO-BE, decisión del negocio, preguntas materiales, evidencia y transferencia a specs/documentación cuando se solicite. |
| `implement-feature`, `implement-ui-change` | Secuencias generales de implementación vertical, inventario UI y checklist universal de estados/teclado/responsive. | Arquitectura, design system, contratos, reutilización, alcance y aceptación de las Policies; no activar auditorías ni artefactos adicionales por defecto. |
| `debug-error` | Receta de reproducción, hipótesis, una variable a la vez y búsqueda de primera divergencia. | Diagnóstico con evidencia, edición solo si se pidió corregir, pruebas proporcionales y separación de incidentes productivos. |
| `optimize-performance`, `optimize-database-query` | Secuencia fija de profiling, listas de CPU/I/O/N+1/joins/cardinalidad y cambio de una dimensión por turno. | Mejora medible, equivalencia funcional, convenciones SQL, límites de acceso productivo y protección del logging crítico. |
| `research-best-practices` | Checklist universal de búsqueda y comparación; obligación implícita de llevar todo TO-BE a una spec. | Evidencia vigente/autoridad, distinción de obligación y recomendación, decisión responsable; transferencia a spec solo si la investigación pertenece a una iniciativa. |
| `implement-critical-state-change`, `implement-distributed-integration` | Recetas de transacciones, idempotencia, retries, compensaciones y listas de escenarios. | Invariantes y garantías exigidas por Policies, técnica libre sin locks/outbox/sagas por receta, autorización y logging crítico con evidencia. |
| `database-schema-change`, `database-data-change`, `database-routine-change` | Tutoriales de modelado, PK/FK, índices, lotes, SQL set-based, control procedural y secuencias de pruebas. | Naming/auditoría corporativos, un SQL literal por cambio, rutas, prechecks/aplicación/validación, excepciones para migrations nativas, recuperación y autorización de ejecución. |
| `add-observability` | Workflow universal de 12 pasos y exigencia de alertas, dashboards y runbooks incluso cuando solo se necesitan logs. | Contrato crítico, correlación/datos permitidos, salida productiva, desacoplamiento y señales adicionales cuando realmente correspondan al alcance. |
| `branch-quality-review`, `security-review`, `data-integrity-review` | Checklists generales de vulnerabilidades, frontend, SQL, interleavings y pasos fijos de auditoría. | Alcance focalizado, evidencia concreta, clasificación, límites read-only, reporte/veredictos de rama y escenarios requeridos por Policies. |
| `configure-agent-context`, `audit-agent-context` | Secuencias de inventario, matrices de recableado y checklist duplicado de auditoría. | Grafo canónico, triggers, autoridad, ownership, fuentes longevas vs temporales, validación y formato/severidad de hallazgos. |
| `infra-change`, `infra-adopt-framework`, `implement-deployment-automation` | Inspecciones y pasos técnicos repetidos, tabla duplicada de subcomandos y receta de selección de estrategia/Bash. | Layout, perfil Bash de servidor fijo, interfaz, matriz/plan de adopción, decisiones responsables, runtime, locks, salud, rollback y límites operativos de las Policies. |
| `manage-secrets` | Secuencia repetida de edición/activación. | SOPS/age, contratos exactos, recipients, acceso nuevo antes de retiro, plaintext efímero permitido, protección de valores y autorización. |
| `investigate-production-incident` | Receta general de investigación y priorización de hipótesis. | Investigación read-only, timeline/zonas horarias/fuentes, responsables reales, mitigaciones propuestas y no ejecución sin autorización. |
| `gitcommit` | Procedimiento paso a paso de agrupación, inspección y repetición de commits. | Conventional Commits, idioma, rama protegida, unidad lógica, staging inspeccionado, límites sobre historia/push/PR y estado final comprobado. |
| Las cuatro `spec-*` | Prosa general de cómo investigar, diseñar y validar. | Rutas, slugs, español, RF/IDs útiles, autoridades, etapas, artefactos opcionales, README canónico único y documentación de AS-IS validado. |

## Archivos retirados: lista completa

Todos pertenecían a `skills/`; sus instrucciones organizacionales conservadas están
en la Skill correspondiente o en las Policies vigentes, no en una segunda copia.

1. `explorador-de-dominio/references/metodologia-de-tutoria.md`
2. `explorador-de-dominio/references/heuristicas-de-exploracion.md`
3. `explorador-de-dominio/references/plantillas-de-trabajo.md`
4. `explorador-de-dominio/references/investigacion-y-evidencia.md`
5. `branch-quality-review/references/review-workflow.md`
6. `branch-quality-review/references/security-sql-concurrency.md`
7. `branch-quality-review/references/frontend-ux-review.md`
8. `add-observability/references/business-operation-logging.md`
9. `add-observability/references/production-log-output.md`
10. `audit-agent-context/references/audit-checklist.md`
11. `configure-agent-context/references/rewiring-method.md`
12. `implement-deployment-automation/references/script-contract.md`
13. `implement-deployment-automation/references/strategy-selection.md`

Quedan dos referencias, compactadas por su aporte organizacional: el contrato de
estructura de contexto y el routing de riesgo. No se retiró ninguna Policy existente.
Los snapshots históricos de transformaciones anteriores conservan su relato; no son
catálogos vigentes de referencias ni autoridad sobre esta versión.

## Controles que no se eliminaron

- Naming, rutas y artefactos de specs, documentación, revisión, SQL e infraestructura.
- Perfil de deploy Bash, interfaz, runtime, estrategias y seguridad de ejecución.
- Integridad, concurrencia, idempotencia, compatibilidad, autorización y pruebas.
- SOPS/age, límites de datos sensibles y separación entre logs, ledger y auditoría.
- Ownership de generado, progressive disclosure y fuentes canónicas.
- Protección de cambios ajenos, Git no destructivo y separación entre commit y publicación.
- Calidad de evidencia, rechazo de hallazgos especulativos y límites de alcance.

## Logging desde el desarrollo

La autoridad es [`logging.md`](../../../policies/development/logging.md).
Se añadió clasificación por impacto, obligación en el mismo cambio y aceptación con
evidencia para motores de cálculo, facturación, correcciones, autorizaciones y otros
efectos críticos. Un cambio cosmético/helper trivial no exige logs; un diff pequeño
que cambie facturación sí. No se impone una plataforma, ni un log por función, ni una
instrumentación general del legado al modificar un flujo.

El contrato se descubre desde el bloque consumidor de `AGENTS.md`, conducta/validación
del agente, specs, implementación, SQL y revisiones. Correcciones/autorizaciones dejan
evidencia suficiente y las reparaciones SQL manuales prevén un registro controlado
de ejecución, sin volcar filas. Preparar SQL no autoriza ejecutarlo.

La revisión y pruebas de distribución verifican fuentes, routing, igualdad de copias
y retiro de referencias obsoletas. No demuestran por sí solas cumplimiento de cada
aplicación futura ni una mejora medida del modelo. Los retiros versionados se recuperan
de Git; esta nota conserva la decisión y su alcance, no una copia de los tutoriales.

## Validación ejecutada

- Las 28 Skills pasan `quick_validate.py` de `skill-creator`.
- La imagen `engineering-framework-validation:organizational-skills`, construida
  desde el target `validation`, pasa `validate-framework.mjs`,
  `test-distribution.mjs` y `test-publication.mjs` sin acceso de red en ejecución.
- Las pruebas de distribución comprueban paridad de contenido con la fuente,
  destinos normativos del bloque consumidor de `AGENTS.md` y retiro de referencias
  dentro de una Skill conservada en ambas plataformas, preservando Skills locales.
- No se instaló ni publicó esta versión en un consumidor real como parte de esta
  tarea; las pruebas usan repositorios Git temporales dentro del contenedor.
