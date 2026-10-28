# Operar definición, implementación y revisión

Leer al coordinar el ciclo completo instalado. Requiere el expediente y perfiles de
[profiles-and-start.md](profiles-and-start.md). El estado de iniciativa y la etapa de
workflow son registros distintos: avanzar el workflow no cambia `state.json`.

## Crear y ejecutar una etapa

Guardar este ejemplo adaptado en
`.harness_work/initiatives/20261028_validar_entrada/workflow-input.json`.
`references` y `ownership` son rutas relativas al workspace; deben apuntar a fuentes
reales y alcance autorizado. El ejemplo supone que existe `src/entrada.js`: cambiarlo
por el archivo real antes de preparar tareas. No usar `.` como ownership por comodidad.

```json
{
  "id": "entrada",
  "initiative": "20261028_validar_entrada",
  "objective": "Rechazar entradas inválidas conservando el contrato público",
  "scope": ["Validación de entrada en src/entrada.js"],
  "exclusions": ["Despliegue y cambios de API pública"],
  "ownership": ["src/entrada.js"],
  "references": ["AGENTS.md"],
  "acceptance": ["Entradas válidas conservan resultado; inválidas tienen evidencia de prueba"],
  "applicability": {
    "ui": {"applies": false, "reason": "Cambio sin interfaz visual"},
    "ux": {"applies": false, "reason": "No cambia interacción ni mensajes de usuario"}
  }
}
```

Incluir pruebas en ownership si se crearán/modificarán. Para UI/UX aplicables usar
`applies: true` y una razón específica; siempre se revisan funcionalidad, seguridad y
logging. El input no lleva `schema_version`, etapas ni tareas generadas: `create`
construye el registro validado por `.harness/core/schemas/agent-workflow.schema.json`.

```bash
bash .harness/agents.sh workflow create --input .harness_work/initiatives/20261028_validar_entrada/workflow-input.json
bash .harness/agents.sh workflow next 20261028_validar_entrada
bash .harness/agents.sh workflow run 20261028_validar_entrada
bash .harness/agents.sh workflow status 20261028_validar_entrada
```

`next` **prepara y reserva** las tareas de la etapa, no es una consulta inocua. `status`
consulta el registro de workflow; para estado vivo de una tarea usar `status ID TAREA`.
`run` invoca `next` si es necesario, ejecuta por lotes según concurrencia y recoge los
resultados completados. Espera la etapa; no avanza automáticamente. Los encargos,
`execution.json`, `result.json` y respuestas quedan en `agents/<task-id>/`.

Inspeccionar resultados, diff y evidencia de la versión integrada antes de avanzar:

```bash
bash .harness/agents.sh workflow advance 20261028_validar_entrada --confirm --reviewer coordinador
```

Repetir `next/run/status`, inspección y `advance` para las etapas que devuelva el
runtime: `definition → implementation → review → verification → ready_to_close`.
Bloqueantes de revisión producen `correction → review`; no saltar la verificación.
Definición/revisión son lectores sobre la misma versión. Cambios de código entre
preparación, ejecución, recogida o avance invalidan su baseline: no editar snapshots
para aceptar el resultado; preparar un nuevo encargo y reconciliar el ciclo.
El runtime actual no ofrece un comando para reemplazar tareas ya asignadas a una
etapa: si hay que rehacer ese workflow, cancelar y crear otro expediente/workflow
con nuevo ID y referencias al brief/spec reconciliado, conservando la evidencia
anterior. Cerrar el expediente anterior como `cancelled` mediante
`close-initiative`, consolidando las ocho categorías sin afirmar alcance entregado.
No editar `state.json`, tareas o snapshots manualmente para forzar el avance.

## Preguntas y fallos

`needs_input` entrega `questions` no vacías y bloquea avance. Agruparlas, obtener las
respuestas y actualizar brief/resume si hay decisiones de alcance. Guardar respuestas
como **array de strings JSON**, por ejemplo en el expediente `answers.json`:

```json
["Pregunta: ¿aceptar cadena vacía? Respuesta confirmada: rechazarla."]
```

```bash
bash .harness/agents.sh workflow run 20261028_validar_entrada --answers .harness_work/initiatives/20261028_validar_entrada/answers.json
```

Se relanzan tareas `needs_input`; la respuesta se registra ligada al intento y se
propaga a dependencias. La tarea puede haberse recogido: la respuesta permite reanudarla.
Si cambió el encargo materialmente, usar nuevo ID de tarea/ciclo y reconciliar
entregas anteriores; los encargos son inmutables.
En una etapa con varias preguntas, `--answers` entrega el mismo array a todas las
tareas relanzadas: identificar explícitamente pregunta y destinatario.

`workflow run` puede reintentar `failed`, `timed_out` o `interrupted`, incluso
recogidos. Antes de repetirlo, diagnosticar con
[individual-tasks.md](individual-tasks.md), resolver la causa y confirmar que no
queda un hijo huérfano. También se puede relanzar el ID con `run ID TAREA` y recoger
el resultado antes de retomar el workflow. No aumentar timeouts,
permisos ni cambiar proveedor/modelo implícitamente.

## Hallazgos y escalamiento

`advance` desde revisión guarda `review-<ronda>-findings.json` con fuentes de cada
hallazgo y consolida duplicados exactos. El coordinador resuelve contradicciones;
la deduplicación automática no decide validez semántica. Bloqueantes abiertos
requieren corrección y nueva revisión. Verificación comprueba ausencia de fallos,
pendientes y bloqueantes, y evidencia `passed` no vacía tanto de verificación como
de la última implementación sobre la versión entregada. Un fallo o bloqueante de
verificación impide avanzar; el runtime no retorna automáticamente a corrección.
Si se necesita cambiar código, aplicar la recuperación de baseline descrita arriba:
cancelar el ciclo, reconciliar el brief y comenzar otro expediente/workflow.

`verification[].outcome: passed` es una declaración estructurada: comprobar comando,
resultado y ambiente contra evidencia real. Una prueba heredada se identifica como
tal; un lector sin shell no afirma haberla ejecutado. Ni JSON válido, código de
salida cero ni snapshot estable prueban por sí solos aceptación o revisión independiente.

Para **cada** hallazgo abierto `recommendation` u `optional` en cualquier etapa,
preparar disposición antes del avance final. Ejemplo `decisions.json`:

```json
[
  {
    "task_id": "entrada-review-0-logging",
    "finding_id": "F1",
    "decision": "accepted",
    "reason": "El coordinador acepta diferir el ajuste dentro del alcance acordado",
    "evidence": "Referencia precisa al acuerdo y pendiente registrado"
  }
]
```

Valores de `decision`: `accepted` o `resolved`, con razón y evidencia reales.
Cada origen requiere entrada, aunque se haya consolidado con otro hallazgo.

```bash
bash .harness/agents.sh workflow advance 20261028_validar_entrada --confirm --reviewer coordinador --decisions .harness_work/initiatives/20261028_validar_entrada/decisions.json
```

Agotar las rondas deja `stage: blocked`. Escalar decisión/capacidad con el usuario;
no lanzar reintentos indefinidos. El comando actual sólo reanuda tras aumentar
explícitamente el límite **efectivo** configurado (el equipo puede restringirlo).
Si se acuerda esa extensión, configurar los perfiles/límites elegidos, ejecutar doctor
y guardar `escalation.json` con `reason` y `reviewer` no vacíos:

```json
{"reason":"Extensión de una ronda aprobada tras resolver la decisión pendiente","reviewer":"coordinador"}
```

```bash
bash .harness/agents.sh workflow escalate 20261028_validar_entrada --input .harness_work/initiatives/20261028_validar_entrada/escalation.json --confirm
```

Registra perfiles/modelos y pasa a corrección. No es un mecanismo de recuperación
para cualquier bloqueo ni una sustitución de la decisión del usuario.

## Cancelar o terminar

```bash
bash .harness/agents.sh workflow cancel 20261028_validar_entrada
bash .harness/agents.sh workflow status 20261028_validar_entrada
```

Cancela y recoge tareas pendientes; verificar que los procesos realmente terminaron.
No revierte sus ediciones ni cierra/cancela la iniciativa. Para `ready_to_close` o
cancelación, continuar con `close-initiative` y su referencia de cierre; actualizar
memoria y resumen antes de interrumpir sesión.
