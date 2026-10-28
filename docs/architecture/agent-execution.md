# Ejecución uniforme de agentes

## Responsabilidades y autoridad

La sesión principal del integrante actúa como coordinador. El ejecutor resuelve un
rol, prepara un proceso y conserva su entrega; el coordinador decide alcance,
preguntas al usuario, integración, aceptación y cierre. La metodología compartida
es independiente del cliente desde el que se inicia el trabajo.

La configuración se divide en tres autoridades:

| Capa | Contenido | Ubicación |
| --- | --- | --- |
| Núcleo | Ejecutores, adaptadores, esquemas y contratos | `.harness/core/` |
| Equipo/proyecto | Roles requeridos, adaptadores/modelos admitidos y límites | `.harness/project/agents.json` |
| Persona | Perfiles, modelos, ejecutables y asignaciones de roles | `${XDG_CONFIG_HOME:-$HOME/.config}/harness/profiles.json` |

El núcleo es actualizable; el resto conserva ownership propio. Configuración
personal y requisitos compartidos cumplen los esquemas
[personal](../../schemas/agent-profiles.schema.json) y
[proyecto](../../schemas/agent-project.schema.json). Cada perfil declara `adapter`,
`model` y, opcionalmente, `executable`, `permission`, `client_profile` y
`shell_allowlist`. Un perfil puede cubrir varios roles. Los nombres de perfiles no
se incluyen en la metodología: cada persona decide sus asignaciones.
`client_profile` pertenece exclusivamente a Codex; `shell_allowlist` pertenece a
Claude/OpenCode. OpenCode identifica modelos como `provider/model`. Los comandos
permitidos para unattended deben declararse explícitamente y respetar el entorno
del producto; en Claude/OpenCode un perfil de lectura conserva denegado shell.

El equipo puede restringir adaptadores/modelos y límites. Las restricciones se
combinan conservando la más estricta; una elección personal no elimina una revisión
requerida. La capacidad de razonamiento es una selección evaluada del equipo, no
una propiedad inferida del precio o nombre comercial de un modelo.

## Preparar el entorno personal

Desde un consumidor instalado:

```bash
bash .harness/agents.sh setup
bash .harness/agents.sh doctor
```

`setup` crea o completa la configuración personal mediante un asistente o una
entrada explícita. No instala clientes ni inventa modelos. El formato incluye
`schema_version`; una migración válida conserva una copia anterior. El diagnóstico
comprueba forma, asignaciones, requisitos del proyecto y ejecutables compatibles.
Una configuración incompleta puede guardarse; los roles faltantes siguen pendientes.

Las credenciales permanecen en mecanismos soportados por cada cliente. El harness
no las copia a encargos ni las centraliza. Encontrar un ejecutable o consultar su
versión no demuestra autenticación, disponibilidad del modelo ni calidad de su
respuesta. Una ejecución mínima real es evidencia diferente del diagnóstico local.

## Encargo y entrega

El [encargo](../../schemas/agent-task.schema.json) identifica iniciativa, rol,
objetivo, alcance, exclusiones, ownership, referencias, dependencias, permisos,
workspace y aceptación. El coordinador entrega contexto mínimo y las rutas
pertinentes, sin copiar toda la conversación. Una respuesta del usuario que cambie
la tarea se incorpora a una nueva versión antes de relanzar.

El expediente guarda encargos y entregas bajo `agents/<task-id>/`. El estado de
procesos, locks y recuperación vive en `.harness_work/runtime/`, ignorado en Git.
El [resultado](../../schemas/agent-result.schema.json) distingue `completed`,
`needs_input` y `failed`, e incluye cambios, verificaciones, hallazgos, preguntas,
pendientes y candidatos a conocimiento duradero. Una salida de proceso exitosa sin
entrega válida no prueba finalización.

Las verificaciones distinguen `passed`, `failed` y `not_run`; cada hallazgo incluye
identidad, dimensión, ubicación, evidencia, impacto, condición de resolución,
severidad y estado. El coordinador contrasta esas declaraciones con evidencia real.
Un resultado es información a verificar, nunca una nueva autorización.

## Conversación, workspace y permisos

Una sesión nueva tiene tres dimensiones independientes: historial recibido,
filesystem compartido o aislado, y permisos efectivos del cliente. El adaptador
declara sus capacidades y límites. El arranque omite deliberadamente reanudación
de conversaciones; las instrucciones y memoria que el propio cliente cargue siguen
siendo parte del contexto efectivo y deben considerarse.

Los encargos de revisión son de lectura y evalúan una misma versión identificada.
Un escritor mantiene cada archivo compartido. Cuando hay superposición o el cliente
no comparte filesystem, se prepara un worktree o una entrega separada. Dar ownership
en un prompt no equivale a restringir técnicamente todo acceso al host.

Los adaptadores usan argv literal y configuración por proceso. No modifican la
configuración global del cliente, instalan dependencias ni amplían la autorización
de la iniciativa. Los comandos del producto conservan su entorno reproducible;
el permiso de lanzar una herramienta transversal no autoriza ejecutar una aplicación
con runtimes del host.

## Flujo de trabajo

| Etapa | Perfil | Resultado |
| --- | --- | --- |
| Definición | Alto razonamiento evaluado | Especificación, hechos, preguntas y aceptación resueltos. |
| Implementación | Worker rápido y competente | Cambio y pruebas pertinentes, con escalamiento si encuentra contradicciones. |
| Revisión | Perfiles evaluados para revisión | Hallazgos sobre la misma versión, sin editarla. |
| Corrección | Worker | Defectos corregidos y comprobaciones actualizadas. |
| Verificación | Coordinador y revisores afectados | Aceptación y hallazgos contrastados con la versión integrada. |
| Cierre | Coordinador | Conocimiento, roadmap, pendientes y memoria consolidados. |

Los roles son `definition`, `implementation`, `functional`, `security`, `logging`,
`ui` y `ux`. Corrección funcional cubre comportamiento, contratos, datos y pruebas;
seguridad cubre vulnerabilidades y permisos; logging incluye comentarios útiles y
protección de información. UI cubre presentación, estados y accesibilidad; UX cubre
recorridos, comprensión, errores y recuperación. UI/UX no aplicables conservan motivo.
Inspección de código de interfaz no se presenta como observación de UI ejecutándose.

La corrección funcional puede asumirla el coordinador en cambios pequeños;
los riesgos altos requieren independencia. Los revisores pueden compartir modelo
y ejecutarse por turnos según recursos, manteniendo encargos independientes.

El coordinador agrupa preguntas y actualiza el encargo con las respuestas.
Información indispensable ausente bloquea el paso. Consolida hallazgos duplicados o
contradictorios antes de devolver un lote al worker. Después de corrección revisa
los hallazgos afectados y el impacto de la nueva versión. El límite inicial es dos
rondas; agotarlo exige escalamiento explícito.

## Operar un workflow

Primero crear una iniciativa mediante `work.sh`. Preparar un JSON de entrada con
`id`, `initiative`, `objective`, `scope`, `exclusions`, `ownership`, `references`,
`acceptance` y `applicability`; las listas scope/ownership/acceptance deben tener
contenido. `workspace` es opcional. Por ejemplo, para un cambio interno sin UI:

```json
{
  "id": "mejora-interna",
  "initiative": "20261028_mejora_interna",
  "objective": "Corregir el comportamiento descrito en el brief aprobado",
  "scope": ["Comportamiento y regresiones de la operación afectada"],
  "exclusions": ["Cambios en otros dominios"],
  "ownership": ["src/operacion"],
  "references": ["AGENTS.md"],
  "acceptance": ["Cumplir los criterios del brief y ejecutar las pruebas pertinentes"],
  "applicability": {
    "ui": {"applies": false, "reason": "La operación no tiene interfaz visible"},
    "ux": {"applies": false, "reason": "No modifica recorridos de interacción"}
  }
}
```

Los nombres de iniciativa, rutas y criterios se sustituyen por los del proyecto.
El estado completo se conserva en `workflow.json` conforme al
[esquema de workflow](../../schemas/agent-workflow.schema.json).

```bash
bash .harness/agents.sh workflow create --input /ruta/al/workflow-input.json
bash .harness/agents.sh workflow next 20261028_mejora_interna
bash .harness/agents.sh workflow run 20261028_mejora_interna
bash .harness/agents.sh workflow status 20261028_mejora_interna
bash .harness/agents.sh workflow advance 20261028_mejora_interna --confirm --reviewer coordinador
```

`next` prepara los encargos de la etapa; `run` los ejecuta dentro de los límites
configurados. El coordinador inspecciona resultados/diffs antes de `advance`.
`--confirm` registra esa revisión; no la realiza automáticamente. Se repite la
secuencia según el estado siguiente. El registro de decisiones sobre recomendaciones
se entrega con `--decisions archivo.json`. Un estado `ready_to_close` habilita la
consolidación habitual; el cierre sigue siendo una operación separada.

Para un encargo individual, `prepare --input archivo.json` valida el formato;
`run <initiative> <task>` ejecuta, `status <initiative> <task>` observa,
`collect <initiative> <task>` valida/recoge y `cancel <initiative> <task>` cancela.
`run --background` permite consultar posteriormente. `--config` selecciona una
configuración personal explícita y `--root` otra raíz de proyecto.

## Operación y continuidad

Las operaciones son `prepare`, `run`, `status`, `collect` y `cancel`, además de
`setup` y `doctor`. Los límites personales y del equipo acotan concurrencia y
duración. La recuperación consulta la identidad del proceso propietario antes de
declarar terminación o cancelar; un timeout de observación no prueba que haya acabado.
Estado estructurado de tareas y ejecuciones evita cerrar con trabajadores activos.

Los metadatos identifican encargo, adaptador, modelo informado, workspace, versión
del código y resultados. Métricas no disponibles permanecen desconocidas. Los logs
locales no se convierten en memoria compartida ni se versionan indiscriminadamente.

El coordinador actualiza memoria después de decisiones, integración de agentes,
bloqueos/cambios de alcance, interrupciones y cierre. La memoria general conserva
cien líneas como máximo y enlaza resúmenes, sin depender de transcripciones. El
[ciclo de vida](work-lifecycle.md) mantiene consolidación, retención y purga.

## Límites y compatibilidad

Codex, Claude Code y OpenCode son adaptadores distintos; sus permisos y protocolos
no se consideran equivalentes por compartir un contrato. `doctor` distingue versión
compatible de ejecución realmente comprobada. Una prueba simulada certifica lógica
del harness; solo una prueba con el cliente real prueba ese recorrido de integración.
Un recorrido contra un backend simulado tampoco certifica comportamiento de modelos
ni credenciales productivas.

| Adaptador | Inicio y controles del cliente | Referencia del proveedor |
| --- | --- | --- |
| Codex | `exec`, modelo explícito, sandbox de lectura/escritura y salida JSON; perfil del cliente opcional. | [CLI](https://developers.openai.com/codex/cli/reference/) |
| Claude Code | Print sin persistencia de sesión, herramientas y permisos unattended explícitos; controles de herramientas, sin aislamiento de OS propio del harness. | [CLI](https://code.claude.com/docs/en/cli-reference) |
| OpenCode | Protocolo V2, ejecución standalone, modelo `provider/model`, agente y permisos por proceso; V1 requiere otro adaptador. | [Configuración](https://opencode.ai/v2/docs/config/) y [permisos](https://opencode.ai/v2/docs/permissions/) |

El diagnóstico revisa flags requeridos y compatibilidad declarada. Las referencias
explican el protocolo de cada proveedor; la disponibilidad y aceptación se comprueban
contra el ejecutable instalado. Un cliente principal y los trabajadores pueden ser
distintos: Codex u otro coordinador usa los mismos encargos que Claude Code al
delegar en el perfil OpenCode personal.

El ejecutor no incorpora servidor permanente, UI, base de datos, selección autónoma
de modelos, delegación recursiva, reintentos ilimitados ni integración automática de
cambios. Pi y nuevas capacidades se incorporan mediante adaptadores evaluados.
Publicación, despliegue y actualización masiva conservan su autorización separada.
