# Encargos individuales, worktrees y recuperación

Leer al delegar fuera del workflow completo o diagnosticar una tarea. Preparar antes
perfiles y expediente según [profiles-and-start.md](profiles-and-start.md).

## Preparar, lanzar y recoger

Guardar un JSON adaptado como `task-input.json` en el expediente. El contrato completo
está en `.harness/core/schemas/agent-task.schema.json`. Ejemplo lector:

```json
{
  "schema_version": 1,
  "id": "revisar-contrato",
  "initiative": "20261028_validar_entrada",
  "role": "functional",
  "objective": "Revisar el contrato de entrada sin modificar archivos",
  "scope": ["Contrato de validación de entrada"],
  "exclusions": ["Implementación y despliegue"],
  "ownership": [],
  "references": ["AGENTS.md"],
  "acceptance": ["Hallazgos con evidencia, impacto y condición de resolución"],
  "dependencies": [],
  "permissions": "read-only"
}
```

```bash
bash .harness/agents.sh prepare --input .harness_work/initiatives/20261028_validar_entrada/task-input.json
bash .harness/agents.sh run 20261028_validar_entrada revisar-contrato --background
bash .harness/agents.sh status 20261028_validar_entrada revisar-contrato
bash .harness/agents.sh collect 20261028_validar_entrada revisar-contrato
```

Sin `--background`, `run` espera el proceso y devuelve su estado; aún necesita
`collect`. La recogida retira ownership activo y permite dependencias/cierre, pero no
certifica aceptación. Inspeccionar `agents/revisar-contrato/result.json`, diff y
`execution.json` antes de integrar. `collect` rechaza procesos vivos y es idempotente.
Una tarea completada o cancelada no se relanza; para cambiar instrucciones usar
nuevo ID. Los estados reintentables se describen abajo.

Para escribir, `role` debe ser `implementation`, `permissions: workspace-write` y
`ownership` un array no vacío de archivos/directorios autorizados. Todos los demás
roles requieren lectura. Las referencias deben existir; las dependencias son IDs
de tareas de la misma iniciativa completadas y recogidas. El encargo es inmutable.

El resultado usa `.harness/core/schemas/agent-result.schema.json`: incluye `status`,
`summary`, `changes`, `verification`, `findings`, `questions`, `pending` y
`durable_candidates`, además de `schema_version` y `task_id`. `needs_input` requiere
preguntas; `completed` requiere preguntas vacías. Pruebas omitidas usan `not_run`
y razón, nunca `passed`. Las capacidades y permisos efectivos quedan en la ejecución;
ownership textual no equivale a un sandbox.

## Workspace y entrega

Por defecto los clientes trabajan en el repositorio compartido. Para aislar cambios,
crear un worktree Git y declarar `workspace` en el input, como ruta absoluta o
relativa a la raíz del coordinador:

```bash
git worktree add -b work/validar-entrada ../consumer-validar-entrada HEAD
```

Por ejemplo añadir `"workspace": "../consumer-validar-entrada"`. Debe existir y
pertenecer al mismo repositorio Git; el runtime no lo crea ni integra automáticamente.
Las referencias y ownership se interpretan dentro de ese worktree. El coordinador
comprueba entrega/diff e integra en secuencia antes de revisar la versión final.
Preparar primero contexto/runtimes necesarios en ese workspace y mantener el producto
en Docker. No borrar un worktree con tareas o cambios sin reconciliar.

No se permiten escritores simultáneos con lectores o escritores del mismo workspace.
Preparar otro escritor con ownership superpuesto también falla, aunque el primero
no esté corriendo. Lectores pueden compartir baseline; worktrees distintos permiten
separar escritores, con integración explícita posterior.

## Interrupciones y reanudación

Consultar `status` tras cambiar de sesión: observa identidad del supervisor/hijo.
`orphaned` significa hijo vivo sin supervisor; `interrupted` indica proceso terminado
sin conclusión normal. No inferir ausencia de procesos a partir de un lock viejo ni
matar un PID sin identidad verificada.

```bash
bash .harness/agents.sh status 20261028_validar_entrada revisar-contrato
bash .harness/agents.sh cancel 20261028_validar_entrada revisar-contrato
```

`cancel` verifica identidad y recoge al terminar; no revierte cambios. Si indica
cancelación pendiente o identidad no verificable, inspeccionar el runtime antes de
continuar. Revisar `execution.json`, los intentos `execution-<token>.json` y
`.harness_work/runtime/agents/<token>/diagnostic.json`; no publicar logs sin sanear.
No modificar tokens, snapshots ni `collected_at` para desbloquear el trabajo.

`run` admite reintento de `failed`, `timed_out`, `interrupted`, incluso recogidos, tras
resolver la causa y confirmar que no queda proceso hijo. Para `needs_input`, pasar
`--answers archivo.json` con array de strings como en
[workflow-operations.md](workflow-operations.md). No reintentar indefinidamente ni
cambiar proveedor, modelo o permisos sin elección explícita. Una tarea cancelada o
completada necesita nuevo ID; para baselines lectores invalidados, preparar una nueva
tarea en vez de alterar la anterior.

Locks de trabajo/update/purga bloquean mutaciones. Inspeccionar propietario y journal;
no borrar un lock desconocido. Recuperar instalación interrumpida mediante el flujo
de instalación del consumidor; `work.sh recover` sirve exclusivamente para journals
de purga, no para procesos de agentes. Mantener resumen y memoria con causa,
evidencia, siguiente acción y validación pendiente.
