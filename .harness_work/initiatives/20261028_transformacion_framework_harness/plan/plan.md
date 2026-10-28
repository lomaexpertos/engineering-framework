# Plan de transformación a harness

Fecha: 2026-10-28. Estado: aprobado; implementación en curso.
Autoridad funcional: [spec.md](../spec.md).

## 1. Enfoque y condiciones de entrada

Evolucionar el framework existente, no construir un producto paralelo. Reutilizar
políticas, skills, validadores, Docker y protecciones del sincronizador; extenderlos
para cubrir contexto, coordinación, continuidad, revisión y cierre.

Las decisiones del usuario ya integradas son `.harness/`, `.harness_work/`, `docs/`,
delegar siempre que sea posible y conservar expedientes cerrados 60 días. El plan
puede revisarse sin cambiar código. La ejecución empieza después de revisar su
alcance y resolver cualquier modificación material que solicite el usuario.

Este expediente se guarda directamente en la raíz de trabajo elegida por el usuario.
Es una decisión explícita de esta planeación, no evidencia de que el layout antiguo
ya haya sido migrado o de que los comandos nuevos estén disponibles.

## 2. Arquitectura y áreas afectadas

| Fuente existente | Resultado planeado |
| --- | --- |
| `policies/ai-assisted-development/` | Contratos ligeros de contexto, memoria, delegación, ciclo de vida y cierre; sustitución explícita del layout anterior. |
| `policies/development/`, `frontend/`, `security/`, `database/`, `infrastructure/` | Reutilizar reglas válidas y completar únicamente triggers/contratos faltantes. |
| `skills/` | Contratos de coordinación/cierre y evolución de specs, documentación, contexto y revisión; fuente común para los clientes. |
| `templates/project/` | Plantillas opcionales del consumidor con las tres raíces, ownership y routers. |
| `tooling/sync-consumer.mjs` | Sincronización al nuevo layout, inventario/hash, adaptación de skills y migración de managed paths. |
| `tooling/validate-framework.mjs` | Validar nuevos contratos sin mantener exigencias incompatibles con la spec aprobada. |
| `checks/` | Checks implementados y contratos de ejecución, no solo directorios reservados. |
| `Dockerfile`, `.dockerignore` | Entorno reproducible de validación y empaquetado del runtime distribuido. |
| `INSTALL.md`, `CONSUMER_STRUCTURE.md`, `docs/architecture/`, `docs/governance/` | Contrato vigente, uso real, migración y decisiones del harness después de validar. |
| `README.md`, `AGENTS.md`, `tooling/README.md`, routers de policies/skills/checks | Routing coherente y contexto mínimo. |

Los nombres y ubicación interna de módulos nuevos de tooling se decidirán por
responsabilidad durante la implementación. No es necesario mover las fuentes del
productor para que sus salidas usen `.harness/`.

## 3. Fases y entregables

### T001 — Contratos, autoridad y migración normativa

Requisitos: RF-001, RF-002, RF-003, RF-006, RF-010, RF-016, RF-017.

- Inventariar callers de rutas antiguas en policies, skills, tooling y plantillas.
- Definir ownership de cada path, regiones generadas y extensiones locales.
- Resolver en la fuente los cambios de `project-artifact-layout`, clasificación de
  ADR duradero y libertad de documentación por tema de `spec-documentar`.
- Formalizar ciclo de vida, fecha UTC, retención de 60 días y reapertura.
- Registrar decisiones de largo plazo con sucesores para los ADR afectados; no
  presentar propuestas como reglas ya publicadas antes de implementarlas.

Salida verificable: contrato de consumidor y decisiones de compatibilidad coherentes,
sin dos autoridades para un mismo tema ni migraciones implícitas.

### T002 — Layout, routers y schemas mínimos

Requisitos: RF-001, RF-002, RF-003, RF-004, RF-012, RF-017.
Dependencia: T001.

- Crear plantillas de `.harness/`, documentación, memoria y expediente, activadas por
  necesidad; no publicar árboles vacíos en cada consumidor.
- Definir schemas de `manifest.json`, config local y `state.json` con versión explícita.
- Establecer IDs de iniciativa/tarea, campos de ownership, revisión de estado,
  `closed_at`, `retain_until`, `hold` y motivos de transición.
- Mantener los slugs actuales `YYYYMMDD_nombre_descriptivo` para iniciativas nuevas;
  los consumidores legados conservan IDs reconocidos durante la transición.
- Diseñar `AGENTS.md` ≤100 líneas y adaptador Claude mínimo; incluir destinos para
  reglas, contexto estable, continuidad, trabajo, revisión y cierre.
- Comprobar el tamaño del AGENTS resultante antes de aplicar: el contenido local
  que exceda el límite requiere reconciliación separada, sin escrituras parciales.
- Definir perfiles y configuración de checks como argv, sin `eval` ni dependencias
  de parsers instalados en el host.

Salida verificable: fixtures mínimos y completos validan; un proyecto pequeño no
necesita toda la estructura. Los enlaces corresponden a contenido existente.

### T003 — Coordinación, memoria y handoffs

Requisitos: RF-004, RF-005, RF-006, RF-018.
Dependencia: T002.

- Implementar contratos de encargo/resultado y responsabilidades del coordinador.
- Definir single-writer por archivo, integración y publicación de cambios en
  filesystem compartido o worktrees, según capacidades del cliente.
- Cubrir inicio/retoma, separación de hechos e hipótesis, presupuesto de contexto,
  tareas activas y limpieza de memoria general.
- Incorporar fallback sin subagentes y límites iniciales de una capa y dos
  trabajadores concurrentes, sin imponer nombres de herramientas/modelos.
- Evolucionar skills de implementación para que deleguen y mantengan continuidad
  sin duplicar el contrato en cada skill de dominio.

Salida verificable: un coordinador entrega dos encargos independientes y otro agente
puede retomar uno desde su handoff; un conflicto de ownership se detecta antes de editar.

### T004 — Documentación, roadmap y cierre

Requisitos: RF-003, RF-004, RF-008, RF-009, RF-018.
Dependencias: T002 y T003.

- Evolucionar `spec-documentar` y crear el contrato de cierre con autoridad para
  consolidar docs, decisiones, invariantes, roadmap y memoria.
- Definir revisión de promoción: conocimiento permanente actualizado, consolidado,
  no aplicable o pendiente; un pendiente obligatorio impide el cierre.
- Separar roadmap de resultado alto de planes técnicos; conservar contexto de
  producto y pendientes entendibles tras descartar los expedientes.
- Implementar diagnóstico y transición de cierre solo después de consolidación
  semántica; un script no genera automáticamente verdad de negocio.
- Probar cierre interrumpido, reanudación, cancelación, cambio de alcance y reapertura.

Salida verificable: una iniciativa cerrada deja un sistema comprensible y un roadmap
actualizado; eliminar su evidencia no elimina decisiones ni pendientes.

### T005 — Revisión por riesgo y checks del consumidor

Requisitos: RF-002, RF-007, RF-012, RF-014, RF-015, RF-018.
Dependencia: T002; puede avanzar en paralelo con T003/T004 si el ownership es disjunto.

- Implementar runner común con scope, aplicabilidad, timeout, resultados JSON/humanos
  y códigos de salida 0/1/2.
- Checks de estructura, schemas, enlaces/anclas, autoridad, límites de contexto,
  integridad y referencias de conocimiento permanente a trabajo temporal.
- Reutilizar revisión de ramas, seguridad e integridad y completar los triggers de
  UI/UX, comentarios y logging, sin abrir auditorías ajenas al cambio.
- Declarar adapters para los comandos existentes de cada stack en sus imágenes;
  comenzar con los stacks disponibles en el piloto, no una matriz universal ficticia.
- Incorporar sintaxis/análisis de shell y checks de texto/secretos pertinentes,
  declarando sus herramientas/versiones en imágenes Docker.

Salida verificable: fixtures inválidos fallan por la causa correcta; checks no
ejecutados no pasan como correctos; ningún runtime del producto se ejecuta en host.

### T006 — Empaquetado y actualización de una llamada

Requisitos: RF-001, RF-011, RF-012, RF-013, RF-015, RF-016.
Dependencias: T001/T002; integrar contenido de T003–T005 antes de cerrar la fase.

- Reutilizar `sync-consumer.mjs`, separando planificación de cambios y aplicación.
- Construir bundle con núcleo, runtime, schemas, plantillas, manifest y adaptadores.
- Distribuir wrappers `.harness/update.sh`, `check.sh` y `work.sh`; su shell de host
  solo orquesta infraestructura general, sin instalar Node u otros runtimes.
- Resolver snapshot inmutable, construir/validar imagen y soportar `--check`/`--ref`.
- Conservar salvaguardas de Git, worktrees, colisiones, symlinks, cambios ocultos,
  ownership y protección del contenido local.
- Añadir staging, journal, lock y recuperación comprobable de interrupciones,
  incluyendo fallo durante la autoactualización de wrappers.
- Registrar hashes/versiones y paridad de las copias de skills; no presentarlos como
  una firma del publicador.

Salida verificable: instalación nueva y actualización compatible con una llamada,
previsualización sin escrituras, idempotencia e interrupción recuperable.

### T007 — Retención y purga segura

Requisitos: RF-006, RF-008, RF-010, RF-014, RF-018.
Dependencias: T004/T005/T006.

- Implementar selección/previsualización de expedientes elegibles y borrado explícito.
- Comprobar 60 días UTC, estado, cierre, holds, tareas/locks y cambios locales.
- Inspeccionar referencias entrantes de fuentes vigentes y expedientes retenidos;
  diferenciar referencias internas del lote que desaparece completo.
- Restringir paths y revalidar estado antes de la eliminación; no seguir symlinks.
- Preparar el lote de forma recuperable, con journal fuera de los destinos. Probar
  interrupción durante preparación/borrado, recuperación y reintentos idempotentes,
  incluyendo referencias entre expedientes del lote y ediciones posteriores.
- Evitar purgas por efectos secundarios de update/check/close y cualquier scheduler.
- Conservar código, tests, migraciones y artefactos operativos productivos.

Salida verificable: negativa antes del plazo, con referencias o reapertura; éxito
solo en expedientes cerrados/elegibles y sin pérdida de conocimiento permanente.

### T008 — Migración, piloto y compatibilidad real

Requisitos: RF-001, RF-005, RF-011, RF-013, RF-016, RF-017, RF-018.
Dependencias: T003–T007.

- Probar fixtures de instalación `1.x`, docs ya existentes, contexto extenso y skills
  locales; diferenciar migración administrada de reconciliación de contenido propio.
- Crear plan visible de MAJOR; no mover docs o reglas locales como parte silenciosa
  de instalar el harness.
- Verificar discovery de `AGENTS.md` y skills en Codex/Claude Code, anotando versiones
  efectivamente utilizadas y particularidades del adaptador.
- Ejecutar piloto completo en consumidor de prueba: definir, delegar, implementar,
  revisar, retomar en otra sesión, cerrar, simular reloj de retención y purgar.
- Probar fallback secuencial y demostrar que la documentación no depende de evidencia.
- Preparar instrucciones para un piloto real; ejecutarlo en un proyecto real solo
  cuando ese consumidor forme parte del alcance autorizado.

Salida verificable: evidencia de punta a punta, compatibilidad real distinguida de
fixtures y limitaciones sin ocultar.

### T009 — Documentación final y entrega

Requisitos: todos; especialmente RF-002, RF-003, RF-008, RF-009 y RF-018.
Dependencia: T008 y corrección de bloqueantes.

- Actualizar documentación canónica del harness con el comportamiento implementado:
  arquitectura, contratos, instalación, extensiones, coordinación, cierre y recuperación.
- Actualizar routers y ejemplos; retirar afirmaciones incompatibles y enlazar sucesores
  de decisiones históricas. Conservar los Actions y publicación central suspendidos.
- Crear/actualizar roadmap propio de alto nivel y backlog; no usar esta lista de
  tareas como sustituto del roadmap duradero.
- Ejecutar revisión independiente del diff integrado y criterios de aceptación.
- Preparar `VERSION` y notas de migración MAJOR en la entrega implementada, sin publicar
  un tag, push o release por iniciativa del agente.
- Cerrar este expediente solo cuando su resultado y consolidación se hayan cumplido;
  desde ese momento comienza su retención de 60 días.

Salida verificable: entrega revisable, documentación real y expediente elegible para
retención; cualquier publicación o adopción externa permanece separada.

## 4. Dependencias y división entre agentes

```text
T001 → T002 → T003 → T004 ─────────────┐
          ├→ T005 ────────────────────┤
          └→ T006 (integra T003–T005) ─┴→ T007 → T008 → T009
```

El coordinador asigna contratos y ownership antes de abrir tareas paralelas. Un
trabajador puede desarrollar metodología/memoria y otro checks o distribución si
no editan los mismos routers o contratos. Un único integrador mantiene schemas,
routers compartidos y documentación transversal. Revisores reciben el diff final
pertinente y fuentes normativas, no todo el historial de conversación.

No se asignan agentes permanentes por cada dimensión. El conjunto de roles depende
de las herramientas disponibles; una revisión independiente puede ejecutarse después
del trabajo de un único autor. No hay delegación recursiva por defecto.

## 5. Validación y escenarios de aceptación

| Escenario | Evidencia esperada |
| --- | --- |
| Consumidor nuevo mínimo | Instala sin crear dominios/ambientes vacíos; AGENTS ≤100 líneas. |
| Misma versión/SHA guardada | Segunda sincronización sin diff. |
| Update con extensiones y documentación propias | Conserva su contenido; cambia solo managed paths. |
| Colisión, symlink, path ignorado o metadata incoherente | Falla antes de escribir y explica qué resolver. |
| Update interrumpido, con/sin edición posterior | Recupera solo cambios propios o detiene recuperación ante conflicto. |
| Dos operaciones/editores sobre el mismo scope | Serializa o rechaza; no mezcla resultados silenciosamente. |
| Contexto con fuente huérfana, ancla rota o AGENTS extenso | Check falla sin truncar contenido. |
| AGENTS local válido que excedería 100 líneas tras update | Preflight rechaza antes de escribir; conserva instrucciones y resto de la instalación. |
| Delegación y retoma | Encargos claros, resultados verificables y siguiente sesión capaz de continuar. |
| Revisión de seguridad/UI/UX/comentarios/logging | Triggers observados, evidencia proporcional y limitaciones explícitas. |
| Cierre incompleto o bloqueante sin resolver | Permanece abierto/closing; no declara capacidad entregada. |
| Cierre completo/cancelación | Promueve lo necesario y actualiza estado/roadmap con semántica correcta. |
| 59 días, exactamente 60 días y fecha UTC | Elegibilidad determinista sin esperar 60 días reales. |
| Retención con hold, referencia entrante o tarea activa | Purga rechazada; no pierde el contexto retenido. |
| Reapertura | Invalida elegibilidad anterior; nuevo plazo tras el siguiente cierre. |
| Purga exitosa | Docs, decisiones, invariantes, roadmap y tests productivos intactos. |
| Purga por lote interrumpida, con enlaces internos | Operación identificable y recuperable; no queda éxito parcial ni referencias retenidas rotas. |
| Codex/Claude y fallback sin subagentes | Discovery real probado; capacidades ausentes reportadas. |
| Adopción `1.x` y docs heredadas | Plan MAJOR visible y contenido propio conservado hasta reconciliación separada. |

Reutilizar y ampliar `tooling/test-distribution.mjs` y `test-publication.mjs`; mantener
el canal central simulado sin reactivarlo. Añadir pruebas de ciclo de vida, referencia
y purga donde existan nuevas reglas; no crear tests que solo copien el texto de la policy.

### Ejecución aislada

Validación base existente:

```bash
docker build --target validation -t engineering-harness-validation:plan-20261028 .
docker run --rm engineering-harness-validation:plan-20261028
```

Durante la implementación se evolucionará esa imagen con dependencias de checks
declaradas y fijadas. Las pruebas del consumidor usarán sus Dockerfiles/Compose,
servicios separados y recursos con nombres por repositorio/worktree/sesión.
No ejecutar código de proyecto en host ni montar el socket Docker en contenedores.

Para esta entrega de planeación, ejecutar el validador estructural existente desde
la imagen es suficiente: no se han modificado sincronizador ni código productivo.
No atribuir a esa comprobación evidencia de que las capacidades futuras funcionan.

## 6. Compatibilidad y recuperación

La transformación se prepara como MAJOR por cambios de layout, autoridad y contratos.
No actualizar `VERSION` en la planeación. Mantener fixtures `1.x` y documentar las
condiciones de migración; no prometer que consumidores no inspeccionados migrarán
automáticamente.

La reversión de una actualización usa journal e inventario propio, preservando edición
posterior y contenido local. La reversión de documentación reconciliada requiere el
diff de esa operación separada; no mezclarla con la actualización del harness.

Fallos de checks, falta de Docker, fuente no accesible o metadata ambigua se reportan
sin instalar dependencias en el host, desactivar controles ni elegir otro origen
implícitamente.

## 7. Orden de adopción y criterio de salida

Primero contratos y fixtures; después continuidad/revisión, distribución y purga;
finalmente piloto y documentación del estado real. Las capacidades incompletas no se
publican como disponibles. No es necesario estimar fechas artificiales: cada fase
termina al demostrar su salida verificable.

La iniciativa se considera cumplida cuando:

- Los RF tienen evidencia y no quedan bloqueantes materiales.
- Una sesión nueva retoma trabajo sin reconstruir toda la conversación.
- La delegación se observa con encargos acotados y verificación de integración.
- Una actualización conserva extensiones, documentación y trabajo del proyecto.
- Cerrar consolida conocimiento y progreso, sin afirmar despliegues inexistentes.
- Tras 60 días simulados se puede purgar un expediente elegible sin perder información
  duradera ni romper referencias vigentes.
- El harness sigue ligero, con AGENTS ≤100 líneas y discovery dentro del presupuesto.

## 8. Pendientes de ejecución, no de definición

Quedan por obtener durante la implementación: versiones reales probadas de clientes,
acceso público al origen, medición de discovery por perfil, elección de herramientas
de análisis declaradas en Docker y evidencia del piloto. No bloquean esta planeación;
sí condicionan afirmar compatibilidad o declarar lista la release futura.

No se incluyen en el alcance actual publicación, scheduler de purga, instalación en
consumidores reales, restauración de Actions ni infraestructura de producción.
