# Transformación del framework en un harness de proyectos

Fecha: 2026-10-28. Estado: propuesta completa para revisión; no implementada.
Iniciativa: `20261028_transformacion_framework_harness`.
Plan técnico: [plan/plan.md](plan/plan.md).

## 1. Resultado buscado

Convertir el framework en un sistema ligero de trabajo para agentes y personas:
orientar, coordinar, conservar conocimiento, verificar y cerrar iniciativas, además
de distribuir políticas y skills. Una sesión nueva debe poder entender qué es el
proyecto, qué reglas no puede romper, qué se está intentando y cómo continuar,
consultando solo el contexto que su tarea necesita.

El resultado principal es continuidad confiable del proyecto. La cantidad de agentes,
documentos, reglas o pasos ejecutados no es una medida de éxito.

## 2. Decisiones confirmadas y supuestos

### Confirmadas por el usuario

- Tres raíces: `.harness/`, `.harness_work/` y `docs/`.
- Harness actualizable separado del conocimiento y del trabajo del proyecto.
- Coordinador que delega siempre que la herramienta y las restricciones de la sesión
  lo permitan; encargos acotados, claros y con contexto suficiente.
- Memoria compartida de proyecto y de iniciativa, recuperable entre sesiones.
- Cierre con documentación duradera, decisiones, invariantes, avance y pendientes de
  alto nivel; evidencia minuciosa separada y descartable.
- Retención de expedientes temporales durante 60 días desde su cierre.
- Progressive disclosure en todos los niveles; `AGENTS.md` como entrada y un máximo
  de 100 líneas físicas, incluidas líneas vacías.
- Skills para Codex y Claude Code; metodología portable a otros agentes.
- Actualización mediante una llamada a un script `.sh` que obtiene el repositorio
  público del harness.
- Reglas ligeras: metodología y conocimiento organizacional que el agente no puede
  deducir, sin manuales de programación genéricos.
- Esta entrega comprende especificación y planeación, no implementación.

### Supuestos de diseño revisables

- Se conserva como origen el repositorio `lomaexpertos/engineering-framework`; no se
  presupone cambiar su nombre, permisos o visibilidad. El canal público deberá
  comprobarse durante la implementación.
- Git y Markdown son suficientes como almacenamiento compartido inicial; JSON se usa
  únicamente para contratos que necesiten comprobación automática.
- La retención se aplica con un comando explícito. No se instala un scheduler ni se
  borra automáticamente al cerrar o actualizar.
- El núcleo no requiere un servicio, una base de datos, una API de modelos ni una
  plataforma de orquestación propia.
- OpenCode y otros clientes reciben un contrato portable; un adaptador certificado
  adicional se desarrolla cuando exista un consumidor y una prueba de compatibilidad.

No quedan decisiones de estructura, delegación o retención sin respuesta. Los nombres
de comandos y detalles de implementación que siguen son contratos propuestos para
revisión, no capacidades que ya existan.

## 3. Situación actual comprobada

| Área | Estado observado | Cambio requerido |
| --- | --- | --- |
| Contexto | `AGENTS.md`, routers por dominio y políticas de progressive disclosure. | Límite verificable de 100 líneas y routing a continuidad, coordinación y cierre. |
| Distribución | `tooling/sync-consumer.mjs`, versión/SHA y preflight protector. | Distribuir núcleo, comandos y checks; manifest de integridad y recuperación. |
| Consumidor | `engineering/corporate/`, specs y revisiones en namespaces distintos. | Nuevo layout y migración explícita, sin tocar documentación propia al actualizar. |
| Documentación | `engineering/docs/<modulo>/README.md`; `spec-documentar` restringe la división. | Fuentes por tema/dominio, decisiones e invariantes duraderas y desacopladas. |
| Trabajo | Specs, planes y reportes; sin ciclo completo de continuidad y retención. | Expediente común, handoffs, estado, cierre, reapertura y purga segura. |
| Revisión | Skills de rama, seguridad e integridad; políticas de código y logging. | Routing de revisión por riesgo, UI/UX, comentarios y verificación de cierre. |
| Checks | Validador fuente y pruebas de distribución; compliance consumidor parcial. | Checks utilizables desde consumidores, estructura y ciclo de vida. |
| Entorno | Dockerfile con target `validation`, Node 22, Bash y Git. | Reutilizarlo; separar runners del harness y del código consumidor. |

Fuentes inspeccionadas: `AGENTS.md`, `INSTALL.md`, `CONSUMER_STRUCTURE.md`,
`docs/architecture/`, `docs/governance/`, `policies/ai-assisted-development/`,
`policies/development/`, `skills/spec-*`, `skills/branch-quality-review/`,
`tooling/validate-framework.mjs` y `tooling/sync-consumer.mjs`.

El framework está en `1.2.0`. Los workflows de GitHub Actions están retirados por
decisión previa. Esta iniciativa no los reactiva ni restaura la publicación central.

## 4. Qué debe ser y qué queda fuera

Debe ser un contrato de trabajo portable, versionado, inspeccionable y usable sin
conexión después de instalarse. Debe funcionar en proyectos pequeños y grandes,
creando contenido por necesidad real y conservando una sola autoridad por tema.

Queda fuera:

- Un framework de aplicación, una arquitectura técnica universal o un runtime de IA.
- Un motor propio de agentes, una interfaz visual de gestión o un servicio de memoria.
- Enseñar técnicas generales que el agente ya conoce o imponer herramientas por moda.
- Requerir una spec extensa, todos los roles o todas las revisiones para cada cambio.
- Convertir transcripciones, reportes o listas de archivos en documentación permanente.
- Medir avance por commits, archivos cambiados, tokens o porcentajes inventados.
- Incluir dependencias del producto en el host o sustituir su entorno Docker.
- Desplegar, publicar, hacer commits/push, cambiar ramas o tocar producción implícitamente.
- Migrar documentos de consumidores, programar purgas o instalar infraestructura sin
  el alcance correspondiente.

## 5. Estructura del consumidor y ownership

Árbol de capacidades disponibles; no es un scaffold que deba crearse completo.

```text
<proyecto>/
├── AGENTS.md
├── CLAUDE.md                         # Adaptador mínimo cuando haga falta
├── .harness/
│   ├── README.md                     # Entrada del harness instalado
│   ├── update.sh                     # Obtención y actualización
│   ├── check.sh                      # Orquestación de validaciones
│   ├── work.sh                       # Estado, cierre y retención
│   ├── core/                         # Generado; no editar en consumidores
│   │   ├── README.md
│   │   ├── policies/
│   │   ├── skills/                   # Fuente instalada de skills comunes
│   │   ├── checks/
│   │   ├── schemas/
│   │   ├── templates/
│   │   ├── runtime/                  # Dockerfile y ejecutables del harness
│   │   └── manifest.json
│   └── project/                      # Propiedad del proyecto
│       ├── README.md
│       ├── config.json
│       ├── policies/<dominio>/
│       ├── skills/<nombre>/
│       └── checks/
├── docs/                             # Conocimiento permanente propio
│   ├── README.md
│   ├── product/
│   ├── system/
│   ├── domains/<dominio>/
│   │   ├── README.md
│   │   ├── rules.md
│   │   ├── flows.md
│   │   └── contracts.md
│   ├── decisions/
│   ├── invariants.md
│   └── roadmap/
│       ├── README.md
│       ├── milestones/
│       └── backlog.md
├── .harness_work/
│   ├── README.md                     # Routing operativo y trabajo activo
│   ├── memory/current.md             # Continuidad general resumida
│   ├── runtime/                      # Locks/estado local; ignorado en Git
│   └── initiatives/<id>/
│       ├── brief.md
│       ├── state.json
│       ├── resume.md
│       ├── spec.md                   # Solo si aporta definición necesaria
│       ├── plan/
│       ├── agents/<task-id>/
│       ├── reviews/
│       ├── evidence/
│       └── closure.md
├── .agents/skills/<nombre>/          # Adaptación para Codex
└── .claude/skills/<nombre>/          # Adaptación para Claude Code
```

### Límites de escritura

| Ubicación | Autoridad y actualización |
| --- | --- |
| `.harness/core/` y wrappers distribuidos | Administrados por el actualizador, con inventario y hashes. |
| `.harness/project/` | Reglas, skills y checks propios; una actualización no los sobrescribe. |
| `docs/` | Conocimiento, decisiones y planificación de alto nivel propios del proyecto. |
| `.harness_work/memory/` y expedientes | Continuidad y evidencia; no son autoridad del sistema. |
| Adaptadores y regiones administradas | Generados desde una fuente común; conservar regiones y skills locales. |
| Código, tests, SQL, assets e infraestructura | Permanecen en las ubicaciones productivas del proyecto. |

El repositorio productor conserva `policies/`, `skills/`, `checks/` y `tooling/` como
fuentes editables y sus `docs/` existentes como conocimiento del propio harness.
No se vendoriza a sí mismo ni se crean dos copias editables del núcleo. El árbol
anterior describe las salidas en consumidores; las pruebas usan consumidores aislados.

### Extensión por proyecto

Las extensiones se organizan por trigger: base de datos, seguridad, desarrollo,
frontend e infraestructura local/preview/producción, solo cuando exista una regla real.
El proyecto declara los perfiles y checks aplicables; la ausencia de un ambiente no
obliga a crear su estructura ni lo convierte en incumplimiento.

Una regla local puede precisar o endurecer la base; no debilitarla silenciosamente.
Las excepciones documentan alcance, motivo, riesgo, owner, aprobación, compensaciones
y revisión/expiración. Un dominio nuevo puede añadirse sin modificar el router raíz
si es descubrible desde el router local correspondiente.

## 6. Arquitectura del conocimiento y progressive disclosure

### Documentación duradera

- `product/`: propósito, usuarios, alcance, lenguaje y razones de negocio.
- `system/`: arquitectura transversal, límites, dependencias y operación real.
- `domains/`: comportamiento vigente por dominio. Un README puede bastar; separar
  reglas, flujos o contratos solo cuando tengan consulta y autoridad independientes.
- `decisions/`: problema, decisión confirmada, razón, consecuencias, estado y sucesor.
  No es una bitácora del desarrollo ni un inventario de opciones exploradas.
- `invariants.md`: índice de invariantes transversales y referencias a su fuente.
  Una invariante de dominio se explica una sola vez en su documentación canónica.
- `roadmap/`: dirección futura y resultados de alto nivel, claramente separados del
  comportamiento vigente. No convierte una intención en funcionalidad existente.

La documentación explica qué hace el sistema, por qué y qué debe preservarse. Puede
contener diagramas y ejemplos de contratos útiles; no exige nombres de clases,
archivos revisados, ramas, commits, comandos de pruebas o una spec para entenderla.
Los detalles de implementación se incluyen solo si explican un contrato estable.

La fecha de revisión y el estado de vigencia pueden ser metadata de mantenimiento.
La evidencia minuciosa de verificación vive en el expediente, no en el cuerpo canónico.
Los ADR vigentes forman parte del conocimiento duradero, aunque una decisión anterior
se marque reemplazada. No se eliminan como si fueran reportes temporales.

### Recorrido de lectura

1. `AGENTS.md`: ownership, precedencia, invariantes universales y destinos por trigger.
2. Router del tema o iniciativa actual: escoger solo las fuentes pertinentes.
3. Documento, policy o skill que resuelve la decisión actual.
4. Referencias y evidencia únicamente cuando hagan falta.

Una sesión que retoma trabajo consulta el resumen general y el `resume.md` del
expediente elegido; no lee todos los expedientes. Un subagente empieza con su encargo,
los routers aplicables y las referencias mínimas, sin heredar por defecto toda la charla.

Los documentos permanentes deben ser alcanzables desde routers. Los expedientes se
descubren mediante el router operativo y el estado activo, sin mantener catálogos
históricos interminables ni enlaces individuales desde `AGENTS.md`.

Además de las 100 líneas de `AGENTS.md`, se conserva inicialmente el presupuesto
existente de 8.000 caracteres para nombres, descripciones y rutas de discovery de
skills, medido por plataforma/perfil instalado. No representa tokens exactos. La
memoria general tendrá un máximo inicial de 100 líneas; el exceso se consolida y se
deriva a fuentes temáticas, sin borrar hechos únicos ni dividir texto mecánicamente.

## 7. Memoria, contexto y continuidad

| Capa | Contenido | Qué no debe contener |
| --- | --- | --- |
| Conocimiento general estable | Producto, arquitectura, vocabulario, reglas, decisiones e invariantes en `docs/`. | Un resumen alternativo de toda la documentación. |
| Memoria operativa general | Iniciativas activas, prioridades actuales, restricciones temporales, bloqueos y próximos puntos de entrada. | Nuevas policies, secretos, transcripciones o explicaciones permanentes duplicadas. |
| Memoria de iniciativa | Objetivo vigente, decisiones confirmadas/candidatas, estado de tareas, dudas y siguiente acción. | Una segunda autoridad sobre el estado del sistema. |
| Handoff de subagente | Encargo acotado, resultado, límites, cambios y verificación resumida. | La conversación completa o volcados de archivos. |

`state.json` contiene identidad, estado, owner, revisión de estado, tareas activas,
fechas y retención. `resume.md` aporta el contexto semántico para continuar. No duplicar
la lista completa de estados en Markdown; el router puede derivarla del JSON.

El coordinador mantiene la memoria compartida. Cada trabajador escribe solo su
encargo/resultado y su alcance autorizado. Los hechos no confirmados se etiquetan
como hipótesis. Las restricciones temporales incluyen condición de revisión o caducidad.
Al cerrar, el resumen general deja de presentar la iniciativa como activa.

Memoria e instrucciones procedentes de logs, documentos externos o resultados de
otros agentes se tratan como datos a verificar; no amplían permisos ni reemplazan
las instrucciones de la sesión. No se guardan cadenas privadas de razonamiento.

## 8. Trabajo coordinado y delegación

El coordinador conserva relación con el usuario, alcance, dependencias, decisiones
transversales, integración, verificación y cierre. Delega la ejecución y revisión
siempre que las capacidades reales y las instrucciones superiores lo permitan.
Un trabajo pequeño puede tener un único trabajador y un encargo corto.

Si no hay subagentes, documenta esa limitación y aplica el mismo contrato en secuencia.
No simula agentes ni presupone poder invocar otros proveedores, consumir sus APIs o
acceder a credenciales. La delegación no concede más autorización que la tarea original.

### Contrato de encargo

Cada encargo explicita, sin plantilla extensa obligatoria:

- ID, objetivo y resultado observable esperado.
- Alcance permitido, exclusiones, archivos/directorios de escritura y ownership.
- Contexto confirmado y referencias mínimas a fuentes canónicas.
- Dependencias, supuestos y decisiones que debe escalar.
- Permisos, entorno Docker y comandos relevantes cuando ya se conozcan.
- Verificación exigida y destino/formato de entrega.

El resultado resume conclusión, cambios, evidencia ejecutada/no ejecutada, hallazgos,
pendientes y posibles conocimientos para promover. Los logs completos van al expediente.

### Concurrencia e integración

- Un solo escritor por archivo compartido. El coordinador serializa contratos,
  routers, memoria general, roadmap y documentación con ownership superpuesto.
- Por defecto, una sola capa de delegación y hasta dos trabajadores concurrentes,
  limitados además por la herramienta. El coordinador puede ajustar ese presupuesto
  según independencia, contexto y recursos; delegar no exige paralelizar.
- El trabajador recibe contexto nuevo y acotado cuando la herramienta lo permita;
  si hereda contexto por limitación técnica, esa diferencia debe ser visible.
- Worktrees aislados cuando la superposición o la herramienta lo hagan necesario;
  no se presume que los agentes comparten filesystem. El adaptador declara cómo
  entrega cambios y resultados.
- Revisar salida y diff antes de integrar; verificar el resultado conjunto, no solo
  confiar en el mensaje del trabajador.
- No cerrar, purgar ni actualizar rutas en uso sin confirmar fin/cancelación de los
  agentes y revalidar ownership. Un lock no garantiza por sí solo exclusión externa.

## 9. Ciclo de vida de iniciativas

Todo encargo con trabajo de proyecto tiene un expediente proporcional. El mínimo es
un brief, estado legible por herramientas y un punto de reanudación; para un trabajo
pequeño, el brief puede ser breve y servir también como contexto de reanudación.
Spec y plan detallados se usan cuando hay ambigüedad, riesgo o coordinación que resolver.

Estados propuestos:

```text
draft → ready → active → validating → closing → closed
                   ↔ blocked
draft/ready/active/blocked → closing → cancelled
closed/cancelled → active (reapertura explícita)
```

`blocked` registra estado previo, causa y siguiente desbloqueo. Un rechazo de validación
devuelve a `active`. `ready` exige alcance y aceptación suficientes; `validating`
exige integración terminada; `closing` exige revisiones aplicables resueltas.
`closed` exige validación y consolidación completas. `cancelled` exige cierre de
aprendizajes y pendientes sin declarar entregado el alcance cancelado.

La pausa solicitada por el usuario se representa como `blocked` con motivo `paused`
y solo se reanuda por instrucción correspondiente; el sistema no la interpreta como
abandono ni como cierre. Implementado, validado, cerrado y desplegado son estados
distintos: cerrar no afirma que esté disponible en producción.

Una iniciativa grande contiene tareas/subiniciativas con ownership y resultados;
no es obligatorio mantener un expediente independiente por cada acción del agente.
La autoridad de alcance se concentra en el brief/spec, no en los handoffs.

## 10. Revisión de código, seguridad, UI y UX

Cada cambio recibe triage de riesgos y revisión del diff integrado. Se conserva el
criterio actual de separar defectos bloqueantes demostrados, recomendaciones y mejoras
opcionales. No convertir preferencias estéticas en bloqueos ni pasar por alto una
validación requerida por declarar la revisión terminada.

| Dimensión | Trigger y resultado requerido |
| --- | --- |
| Código e integración | Código nuevo/modificado: corrección, contratos, regresiones, compatibilidad y pruebas relevantes. |
| Seguridad | Auth, permisos, secretos, datos sensibles, entradas no confiables o supply chain: amenazas afectadas, controles y fallos relevantes. |
| Integridad de datos | Esquema, escrituras críticas, concurrencia, reintentos: invariantes, idempotencia y recuperación. |
| UI | Interfaz visible: coherencia existente, estados, responsive y accesibilidad pertinente. |
| UX | Flujos o interacciones: comprensión, feedback, errores, vacíos, recuperación y consecuencias de la acción. |
| Comentarios | Código modificado: razones, invariantes y límites no evidentes; evitar narración literal, comentarios caducos o secretos. |
| Logging | Operaciones críticas/diagnóstico: conservar la policy actual; eventos útiles, correlación, resultados y fallos, sin datos indebidos. |
| Documentación y cierre | Cambios materiales: fuentes vigentes, decisiones, invariantes, roadmap, pendientes y ausencia de dependencias temporales. |

No se exige un agente por dimensión: un revisor puede cubrir varios triggers con
alcance explícito. El revisor será distinto del autor cuando haya capacidad; cambios
de alto riesgo requieren revisión independiente o declarar que siguen pendientes.
La autoevaluación no se presenta como independencia. Las revisiones ocurren antes de
integrar cambios irreversibles y su evidencia se conserva solo en el expediente.

La revisión de UI/UX no afirma observación visual si solo leyó código. Si falta un
entorno o captura necesaria, informa la limitación y no marca esa aceptación como pasada.
No se crean nuevos comentarios/logs en cada función para satisfacer una cuota.

## 11. Cierre, consolidación y retención

### Contrato de cierre

El coordinador debe completar estas condiciones antes de `closed`:

1. Confirmar alcance entregado y validaciones/revisiones aplicables; no hay trabajadores
   activos ni bloqueantes pendientes sobre el resultado declarado.
2. Actualizar el comportamiento vigente y sus razones en las fuentes canónicas.
3. Registrar decisiones confirmadas con consecuencias y actualizar invariantes;
   consolidar en fuentes existentes antes de crear nuevas.
4. Actualizar el milestone/resultado de alto nivel, su estado real y próximos pasos.
   Trasladar pendientes de producto, riesgo o capacidad al backlog de alto nivel;
   conservar tareas minuciosas solo si otra iniciativa activa las necesita.
5. Limpiar la memoria operativa y crear un cierre temporal que indique dónde se
   consolidó cada categoría o por qué no aplicó. No inventar documentos para llenar casillas.
6. Verificar que el conocimiento permanente sea entendible sin el expediente, no
   tenga enlaces al trabajo temporal ni referencias necesarias a specs, tests aplicados,
   archivos revisados, ramas o commits.
7. Marcar estado y `closed_at` UTC; calcular `retain_until = closed_at + 60 × 24 horas`.

Los pendientes bloqueantes del alcance no se convierten en backlog para fingir cierre.
Un cambio real de alcance debe quedar acordado. Las iniciativas canceladas también
consolidan decisiones/pendientes y tienen `closed_at` sin afirmar capacidad entregada.

El cierre es reanudable e idempotente: una interrupción conserva `closing`, no marca
éxito parcial como cierre ni duplica decisiones o milestones al reintentarlo.

### Retención y purga

- Se conservan los expedientes completos 60 días. El plazo es un mínimo de elegibilidad,
  no una orden automática de borrado al cumplirse.
- La purga requiere comando explícito con ID o selección de expedientes elegibles y
  ofrece previsualización. No se ejecuta como efecto de `update`, `check` o `close`.
- Debe comprobar estado `closed/cancelled`, plazo cumplido, cierre completo, ausencia
  de agentes activos, retenciones especiales y referencias entrantes desde fuentes
  vigentes, memoria o iniciativas que sigan necesitando ese expediente.
- Los enlaces entre expedientes que se purgan en el mismo lote pueden desaparecer
  juntos; una referencia desde contenido retenido bloquea la purga o requiere consolidación.
- Antes del borrado definitivo se prepara un lote recuperable y un registro de
  operación fuera de sus destinos, bajo `.harness_work/runtime/`. Una interrupción
  debe permitir completar o restaurar la preparación sin perder identidad/estado
  de los expedientes ni dejar referencias retenidas rotas. No se declara éxito
  parcial como purga terminada; el reintento es idempotente y protege ediciones ajenas.
- La eliminación se restringe a expedientes identificados, con paths normalizados,
  sin seguir symlinks, y comprueba de nuevo su estado antes de borrar.
- Trabajo activo, cierre ambiguo, cambios locales no resueltos o un lock ajeno bloquean
  la purga; no se fuerza por antigüedad. Un `hold` justificado aplaza la eliminación.
- Reabrir conserva el contexto, invalida el cierre anterior para retención y comienza
  un nuevo plazo cuando vuelva a cerrarse.
- La purga puede preparar eliminaciones de archivos versionados, pero nunca hace commit,
  push, reset ni reescribe historial. Git puede conservar versiones antiguas: purgar
  del árbol no es borrado seguro de información sensible.

El escenario de aceptación esencial es borrar un expediente elegible y comprobar que
otra sesión puede comprender el sistema y seguir el roadmap sin recuperar ese expediente.

## 12. Roadmap y progreso de alto nivel

Cada milestone expresa resultado/capacidad, motivo, prioridad, dependencias relevantes,
estado, alcance entregado y siguiente paso. Puede agrupar múltiples iniciativas sin
depender de sus reportes para explicar el resultado.

Estados de alto nivel: `planned`, `in_progress`, `blocked`, `delivered`, `cancelled`.
La disponibilidad en un ambiente se informa aparte cuando importe. No se actualiza
el roadmap por cada comando o prueba. Un pendiente indica problema/resultado deseado,
prioridad, estado y dependencia conocida; no copia el plan técnico completo.

Los enlaces pueden ir del trabajo al milestone. El milestone conserva conocimiento
propio y no necesita enlazar expedientes descartables. El backlog no duplica reglas
del sistema ni convierte riesgos desconocidos en hechos confirmados.

## 13. Skills y adaptadores

Se conserva una sola fuente editable en `skills/`. La release genera el contenido
instalado y las copias completas para `.agents/skills/` y `.claude/skills/`; ninguna
es una variante manual. Las diferencias de metadata, rutas o capacidades pertenecen
al adaptador y deben probarse. Evitar symlinks como atajo al contrato existente.

Se revisan las 28 skills actuales para reutilizar y consolidar antes de añadir nombres.
Capacidades metodológicas que deben quedar cubiertas:

| Capacidad | Tratamiento propuesto |
| --- | --- |
| Descubrir contexto y configurar routers | Evolucionar `configure-agent-context` y `audit-agent-context`. |
| Definir y planear | Evolucionar `spec-definir`/`spec-planear` al nuevo expediente. |
| Coordinar y retomar trabajo | Contrato coordinador y handoff, con skill propia si aporta trigger distinguible. |
| Ejecutar iniciativas | Evolucionar `spec-implementar`, manteniendo proporción para cambios pequeños. |
| Documentar estado real | Evolucionar `spec-documentar` para fuentes temáticas duraderas. |
| Revisar | Evolucionar revisión de rama, seguridad e integridad; cubrir UI/UX según trigger. |
| Consolidar y cerrar | Skill de cierre que coordine docs, decisiones, invariantes, roadmap y memoria. |

No añadir una skill por cada regla, fase o rol si solo repetiría una policy. Los
perfiles de instalación evitan cargar todos los dominios; el núcleo metodológico y
los contratos críticos aplicables no se omiten para reducir el catálogo.

Codex reconoce `AGENTS.md` y descubre skills de repositorio en `.agents/skills/`.
Fuentes oficiales: [instrucciones](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
y [skills](https://learn.chatgpt.com/docs/build-skills).

Claude Code dispone de instrucciones propias y soporte de `AGENTS.md` dependiente
del entorno; un `CLAUDE.md` mínimo con importación `@AGENTS.md` es una vía documentada
de compatibilidad. Sus skills de proyecto usan `.claude/skills/`.
Fuentes: [memoria e instrucciones](https://code.claude.com/docs/en/memory)
y [skills](https://code.claude.com/docs/en/skills).

La delegación y sus diferencias de contexto/permisos se resuelven por capacidades
reales; no se promete equivalencia entre clientes. Referencia específica:
[subagentes de Claude Code](https://code.claude.com/docs/en/sub-agents).
La implementación deberá registrar las versiones efectivamente probadas.

## 14. Interfaz de comandos y actualización

Interfaz propuesta, ejecutable mediante Bash; los wrappers del host solo orquestan
herramientas generales y contenedores. La lógica del harness y los checks se ejecutan
en su imagen; el código del consumidor se valida en las imágenes del consumidor.

```bash
bash .harness/update.sh
bash .harness/update.sh --check
bash .harness/update.sh --ref <version-o-sha>
bash .harness/check.sh
bash .harness/check.sh --scope <dominio>
bash .harness/work.sh status
bash .harness/work.sh close <id> --check
bash .harness/work.sh close <id>
bash .harness/work.sh purge --eligible --check
bash .harness/work.sh purge --eligible
```

`work.sh close` valida y registra un cierre ya consolidado por el coordinador; no
inventa documentación semántica ni solicita una API de IA para generarla.

### Actualización normal

1. Obtener la referencia del repositorio público configurado; resolverla una sola vez
   a SHA completo e inmutable. Canal inicial: `main`, compatible con el actual.
2. Descargar ese snapshot a un contexto temporal acotado, construir/reutilizar su
   imagen y validar su fuente antes de escribir en el consumidor.
3. Comprobar compatibilidad, estado Git, ownership, hashes, regiones administradas y
   locks; preparar el conjunto completo de cambios y su manifest.
4. Aplicar solo contenido administrado y verificar integridad/paridad final.
5. Informar versión/SHA, cambios, checks y posibles acciones de migración separadas.

Una llamada normal descarga, valida y actualiza sin que un agente clone manualmente
el repositorio. `--check` no escribe en el consumidor. La primera instalación usa un
bootstrap descargado como archivo inspeccionable desde una referencia explícita;
no se requiere `curl | sh` ni instalar runtimes en el host.

La metadata incluye schema, versión, origen, SHA, compatibilidad y manifest de paths,
ownership y hashes. Los hashes detectan divergencias, no autentican por sí solos al
publicador. El origen es confiable por configuración explícita y transporte seguro;
no se ejecutan instrucciones de un repositorio alternativo elegido por contenido externo.

Reejecutar el mismo snapshot en una instalación guardada produce diff vacío. Los
MAJOR requieren decisión explícita y preflight de migración; no se aceptan downgrades
implícitos. El wrapper no hace commit/push/checkout ni altera el índice.

No se prometen escrituras multiarchivo atómicas. Debe existir staging y un journal
de recuperación: tras interrupción se detectan los cambios propios de la operación,
se permite finalizar o restaurarlos si no hubo edición posterior y se preserva trabajo
ajeno. Sin `git reset`, limpieza global ni restauración ciega. Un lock impide dos
actualizaciones simultáneas; la autoactualización del wrapper se aplica desde el
snapshot temporal, no modificando el código que continúa ejecutándose.

## 15. Validaciones y estándares automáticos

| Familia | Comprobaciones automáticas |
| --- | --- |
| Instalación | Metadata, versión, hashes, ownership, rutas seguras y paridad de adaptadores. |
| Contexto | `AGENTS.md` ≤100 líneas, routers alcanzables, enlaces locales/anclas válidas, discovery y rutas retiradas. |
| Documentación | Fuentes permanentes con autoridad clara y sin enlaces a expedientes temporales. |
| Trabajo | Schemas, estados, transiciones, IDs, fechas, retención, cierres incompletos y locks. |
| Extensiones | Perfiles, schemas de config, colisiones y checks requeridos declarados. |
| Shell y texto | Sintaxis, higiene y análisis de scripts; herramientas fijadas en Docker. |
| Código consumidor | Adaptadores para ejecutar sus linters, pruebas y analizadores en su entorno Docker. |
| Seguridad | Higiene de secretos y controles pertinentes al cambio; revisión semántica cuando proceda. |

Cada check declara ID, scope, condición de aplicación, severidad, comando como argv,
runner/imagen, timeout y evidencia esperada. Los comandos no se evalúan mediante
interpolación de texto no confiable. Salidas humana y JSON, con exit codes estables:
`0` satisfactorio, `1` incumplimiento, `2` error de configuración/ejecución.

El estándar transversal es la interfaz y el nivel de exigencia. No existe un linter
único que entienda todos los lenguajes; se reutilizan herramientas de cada stack y
se añaden adaptadores por necesidad demostrada. Un check requerido omitido o que no
pudo ejecutarse no se transforma en éxito. Un check no aplicable informa su motivo.

La automatización comprueba estructura y dependencias declaradas. No puede demostrar
que toda razón de negocio fue promovida, que una explicación es correcta o que una
captura es usable: el cierre incluye revisión semántica además de checks.

## 16. Entorno, seguridad y aislamiento

Toda compilación, prueba, linter y ejecución del harness o del proyecto se realiza
en imágenes Docker reproducibles con versiones explícitas y dependencias declaradas.
Los wrappers del host pueden invocar Git/Docker/shell como infraestructura general.

Reutilizar el target `validation` existente y evolucionarlo sin instalar Node u otros
runtimes en el host. Las dependencias y servicios del consumidor permanecen en sus
imágenes, redes y volúmenes aislados. La imagen del harness no sustituye su runtime.

Contenedores sin privilegios innecesarios, con usuario no root cuando sea viable,
sin socket Docker montado, sin red host y con mounts limitados. Nombres de recursos
derivados de repositorio/worktree/sesión. Solo se limpian recursos de ownership verificado.
Los agentes no comparten secretos en memoria, briefs, logs ni evidencia.

La actualización requiere acceso de red al origen; el trabajo cotidiano y los checks
de estructura funcionan offline con imágenes disponibles. Los checks que necesiten
red lo declaran y reportan su indisponibilidad.

## 17. Compatibilidad y migración

El cambio de layout y de contratos requiere una release MAJOR, previsiblemente
`2.0.0`; este expediente de planeación no cambia `VERSION`.

- Detectar instalaciones `1.x` mediante su metadata actual y conservar su procedencia.
- Migrar contenido administrado de `engineering/corporate/` a `.harness/core/` solo con
  ownership comprobado y un plan de migración explícito para el MAJOR.
- `FRAMEWORK_VERSION` y metadata anteriores se retiran solo cuando la nueva autoridad
  quedó verificada; no mantener dos versiones instaladas que reclamen vigencia.
- Las actualizaciones no trasladan ni reescriben `engineering/docs/`, specs, revisiones
  o un `docs/` existente. Esa reconciliación es una operación de contenido separada,
  autorizada y revisable; no crear una segunda documentación canónica paralela.
- En `AGENTS.md`, preservar contenido local y calcular el archivo final durante el
  preflight. Si ya supera 100 líneas o las superaría al integrar la región administrada,
  detener antes de escribir y preparar su recableado como operación autorizada;
  no truncar ni mover reglas propias silenciosamente. Una adopción completa exige resolverlo.
- Preservar skills locales y detectar nombres homónimos también en scopes globales
  cuando el cliente permita observarlos. No desinstalar copias del usuario implícitamente.
- Los ADR históricos no se reescriben; registrar sucesores y actualizar contratos
  vigentes, callers, plantillas y validadores en la implementación.

## 18. Requisitos verificables

| ID | Requisito | Aceptación observable |
| --- | --- | --- |
| RF-001 | Separación y ownership. | Update modifica únicamente paths administrados; conserva docs, extensiones y trabajo propio. |
| RF-002 | Contexto progresivo. | AGENTS ≤100 líneas; fuentes vigentes alcanzables; lectura dirigida sin expedientes históricos obligatorios. |
| RF-003 | Conocimiento duradero escalable. | Un dominio crece por temas sin duplicar autoridad; docs siguen explicando el sistema tras purgar trabajo. |
| RF-004 | Memoria de proyecto e iniciativa. | Sesión nueva identifica objetivo, restricciones, estado y siguiente acción desde routers y resumen acotado. |
| RF-005 | Coordinador y delegación. | Encargos explícitos, ownership sin colisiones y resultados integrados/verificados; fallback declarado si no hay subagentes. |
| RF-006 | Ciclo de vida. | Transiciones inválidas fallan; pausa, cancelación, cierre y reapertura preservan su semántica. |
| RF-007 | Revisión por riesgo. | Matriz de triggers cubierta, hallazgos objetivos y revisión independiente cuando se requiere. |
| RF-008 | Cierre y promoción. | No se cierra con bloqueantes o promoción pendiente; docs/decisiones/invariantes quedan vigentes y sin dependencia temporal. |
| RF-009 | Roadmap y pendientes. | Cierre refleja capacidad realmente entregada y pendientes de alto nivel sin copiar bitácoras técnicas. |
| RF-010 | Retención y purga. | A los 59 días se rechaza; al cumplir 60 exige cierre completo, sin referencias/holds ni tareas activas; un lote interrumpido se recupera sin pérdida de coherencia. |
| RF-011 | Actualización de una llamada. | Snapshot público fijado, dry-run, aplicación protegida, idempotencia y diagnóstico/recuperación de interrupción. |
| RF-012 | Extensibilidad. | Un dominio/check local se añade sin editar core ni perderse en el siguiente update. |
| RF-013 | Skills multiplataforma. | Una fuente produce discovery y contenido coherente para Codex/Claude, sin borrar skills locales. |
| RF-014 | Checks reutilizables. | Runner entrega estados coherentes, aplica scopes y no ejecuta código consumidor en el host. |
| RF-015 | Aislamiento. | Build, pruebas y checks ocurren en imágenes declaradas, sin dependencias de proyecto instaladas en host. |
| RF-016 | Migración compatible. | Fixture `1.x` migra solo managed paths autorizados; colisiones y docs heredadas quedan visibles y protegidas. |
| RF-017 | Ligereza. | No se crean carpetas vacías ni skills redundantes; discovery respeta presupuesto; el flujo pequeño sigue siendo breve. |
| RF-018 | Honestidad operativa. | Pendiente/no ejecutado/no aplicable son distinguibles de aprobado; cerrado no equivale a desplegado. |

## 19. Riesgos y límites

| Riesgo | Respuesta de diseño |
| --- | --- |
| Convertir metodología en burocracia. | Expedientes proporcionales, capacidades condicionales y políticas que expresen contratos propios. |
| Memoria obsoleta o contradictoria. | Ownership, límites, hipótesis explícitas y consolidación al cerrar. |
| Delegación más cara que el resultado. | Encargos cortos, una capa inicial, concurrencia limitada y salida resumida; medir costo antes de expandir. |
| Purga con pérdida de conocimiento. | Promoción semántica, grafo de referencias, 60 días, holds y simulación de eliminación. |
| Actualización parcial o concurrente. | Staging, journal, locks y revalidación; preservar cambios posteriores. |
| Extensión que debilite una policy. | Precedencia y excepciones explícitas; no presentar checks estructurales como auditoría semántica. |
| Diferencias entre clientes. | Adaptadores por capacidades, pruebas con versiones registradas y fallback visible. |
| Confundir roadmap con realidad. | TO-BE separado de AS-IS; cierre y disponibilidad se informan por separado. |
| Migración que pise documentación existente. | Inventario y reconciliación separados del actualizador. |

La implementación está pendiente de la revisión de esta propuesta. No se ha autorizado
por esta planeación una instalación en consumidores, publicación de release, scheduler,
deployment o cambio administrativo del repositorio.
