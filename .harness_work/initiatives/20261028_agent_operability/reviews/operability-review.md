# Revisión operativa del consumidor

Fecha UTC: 2026-10-28. Alcance: CLI instalado, guías distribuidas y comprobación
operativa de guías. Revisión independiente de lectura; no cambia código ni declara
validación de clientes/modelos reales. Los perfiles sintéticos no usan proveedores.

## Evidencia ejecutada

- `node tooling/test-harness-usage.mjs`: aprobado. Instaló consumidor temporal y
  comprobó ayuda de agents/work/check/update, ausencia de mutación por ayuda,
  `--root`, rechazo de opciones duplicadas/inaplicables y ejemplo de runner.
- `node tooling/test-agent-cli.mjs`: aprobado. Ayuda sin configuración, aridad exacta,
  opciones por comando y errores sin crear estado.
- `checkOperationalGuides(process.cwd(), {layout: 'source'})`: 354 resultados, cero
  fallos en el snapshot inspeccionado. No ejecuta comandos de las guías ni modelos.
- Probe en copia temporal de policies/skills/checks/templates/schemas: retirar el
  argumento obligatorio `--input` de la línea documentada de `prepare` y volver a
  ejecutar el helper. Resultado inicial: todos los checks aprobados; ejecutar
  `node tooling/harness-agents.mjs prepare` devuelve 2 y
  `prepare requires --input task.json`.

No se repitió la suite global: el integrador realiza esa validación sobre la versión
conjunta. Los probes se limpiaron; no alteraron fuentes ni configuración personal.

## Hallazgo reproducible

### G1 — El check de comandos omite opciones obligatorias

Clasificación: bloqueante de la nueva garantía de comprobación de ejemplos CLI.
Fuente: `tooling/harness-guide-check.mjs`, función `cliCheck`; consume aridad y
opciones permitidas de los contratos pero no valida opciones requeridas.

Trigger: documentar en un bloque Bash `bash .harness/agents.sh prepare`.
Observado: `guide-cli-example` devuelve `passed`, sin ningún otro fallo del helper.
Esperado: detectar que falta `--input`; la CLI rechaza siempre esa invocación.
También revisar `workflow create`, `workflow advance/escalate` y `work create`, cuyos
requisitos obligatorios no se derivan sólo de la aridad ni del conjunto permitido.

Impacto: una guía puede convertirse en una instrucción imposible de ejecutar y el
check integrado seguir aprobándola. La garantía debe mantenerse estructural y
acotada: no necesita lanzar agentes para detectar esta condición.

Estado: **resuelto y revalidado**. Los contratos compartidos ahora exponen opciones
obligatorias y el helper las comprueba. Repetí el mismo probe: devuelve
`guide-cli-example: failed`, `Missing required documented --input`. La fuente real
produce 379 verificaciones y cero fallos. Se conserva arriba el hallazgo original
para trazabilidad, sin pendientes bloqueantes de esta revisión.

## Contratos revisados sin defecto adicional identificado

- Los cuatro wrappers publican ayuda; setup/doctor explicitan perfiles personales,
  autenticación no comprobada y ausencia de ejecución real.
- Las guías operativas están enlazadas desde las Skills, usan recursos instalados y
  evitan depender de los manuales fuente para los comandos normales.
- `needs_input` exige respuestas no vacías; se conserva resultado de intento previo;
  reintentar estados recogidos readquiere validación de ownership en `runTask`.
  La preparación y el lanzamiento rechazan ownership superpuesto.
- `collect` libera bookkeeping sin aceptar semánticamente la entrega. Cancelar
  tareas ya completadas conserva evidencia; una revisión no recogida con baseline
  cambiado queda invalidada explícitamente para permitir cancelar el ciclo.
- Baseline obsoleta no se acepta editando snapshots: las guías conducen a cancelar,
  reconciliar brief/spec, crear nuevo expediente/workflow y cerrar el anterior como
  cancelado con las ocho categorías, sin afirmar entrega.
- Verificación bloqueada no vuelve automáticamente a corrección. La guía hace
  visible esa limitación y prescribe el mecanismo de recuperación existente.
- Las guías de checks distinguen código de salida, logs temporales y evidencia
  esperada; no afirman ejecutar/build de la imagen ni acreditar semántica del test.
- Cierre diferencia workflow, iniciativa, consolidación semántica y despliegue.
  Preview, cancelación, reapertura y retención de 60 días quedan operables.

## Límites

La comprobación de guías no certifica verdad de fuentes, semántica de aceptación,
independencia de revisores, autenticación, disponibilidad de modelos ni ejecución de
pruebas del producto. Los ejemplos con modelos/rutas placeholder requieren elección
y adaptación explícitas. La aprobación final corresponde al integrador sobre el
snapshot conjunto. G1 quedó resuelto mediante el probe focalizado.
