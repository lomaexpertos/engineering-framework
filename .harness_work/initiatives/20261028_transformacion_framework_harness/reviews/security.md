# Revisión de seguridad y recuperación

Fecha: 2026-10-28. Revisión por lectura de las fuentes actuales; no se ejecutaron
pruebas destructivas ni se modificaron fuentes durante esta revisión.

Alcance: `tooling/sync-consumer.mjs`, `tooling/distribution-transaction.mjs`, wrappers
de actualización/bootstrap/work y concurrencia del ciclo de vida. Las observaciones
describen el snapshot leído, no equivalen a un veredicto sobre correcciones posteriores.

## Bloqueantes demostrados por el código

### SEC-001 — La escritura directa rompe la recuperación ante interrupciones parciales

Fuente: `tooling/distribution-transaction.mjs`, `put()` y `recoverTransaction()`.

`put()` llama `fs.writeFileSync(target, ...)` sobre el destino existente. Esto trunca
el archivo antes de terminar la escritura. Si ocurre SIGKILL o error de E/S durante
esa llamada, el contenido puede quedar vacío o parcial. La recuperación solo acepta
un contenido exactamente igual a `entry.before` o `entry.after`; por tanto rechaza
el contenido parcial de su propia operación como si fuera una edición ajena.

El journal se escribe también de forma directa en su creación. Un journal parcial
no permite distinguir con certeza una transacción preparada de una no iniciada.
Las pruebas `failAfter` entre archivos completos no cubren este caso.

Corrección requerida: preparación atómica del journal y reemplazo por archivo con
temporal en el mismo filesystem y rename; preservar el invariante before/after que
usa recovery. Una interrupción real entre preparación y rename no debe dejar un
destino truncado. El cleanup solo puede retirar temporales propios identificados.

### SEC-002 — Se borra o sustituye contenido guardado sin demostrar ownership

Fuente: `tooling/sync-consumer.mjs`, `prepareConsumer()`: construcción de `scope`,
`readTree()` sobre `.harness/core`, comprobación de Git y cálculo de `removed/updated`.

El preflight rechaza cambios no guardados, pero lee todo el árbol `.harness/core/`
y calcula `removed = current - desired`. No exige que cada path retirado figure en
`previous.files`. Un archivo propio ya guardado en Git dentro del core, desconocido
para el manifest anterior, se elimina. De igual modo, una edición guardada de un
archivo administrado se sobrescribe sin contrastar su contenido con el hash anterior.
La existencia de un manifest con hashes no protege frente a estas divergencias.

También se incluyen wrappers individuales en `scope` durante la primera instalación,
sin exigir ownership previo si un wrapper local ya existe y está guardado.

Corrección requerida: rechazar paths desconocidos y colisiones de instalación;
contrastar archivos administrados contra su manifest anterior antes de sustituirlos
o retirarlos. Si se necesita reparar contenido divergente, debe ser una operación
explícita y revisable que no convierta la actualización ordinaria en sobrescritura.

## Recomendación operativa concreta

### SEC-003 — El wrapper work no monta metadata de un linked worktree

Fuente: `templates/project/.harness/work.sh`, único mount `/consumer`; contraste con
`update.sh`, que sí monta git_dir/common_dir de solo lectura.

En un linked worktree, `.git` es un archivo que apunta a metadata situada fuera del
checkout. `purge` llama Git para comprobar cambios; dentro del wrapper esa metadata
no existe, de modo que la comprobación falla. La operación se detiene de forma segura,
pero no está disponible mediante el wrapper en ese consumidor soportado.

Corrección recomendada: reutilizar en work los mounts acotados de git_dir/common_dir
que ya implementa update; mantenerlos read-only y probar purga desde un worktree real.

## Controles observados

- Roots/path checks y rechazo de symlinks en preflight y antes de escrituras.
- Journal con allowlist de destinos y rechazo de ediciones posteriores.
- Locks update/work comprobados antes y después de adquisición, sin romper locks ajenos.
- Purga prepara directorios mediante rename y guarda snapshots antes de eliminarlos;
  rechaza referencias entrantes, cambios no guardados, archivos ignorados y retenciones.
- Los wrappers montan solo el consumidor y metadata específica; no montan socket Docker
  ni usan privilegios o red host.
- La fuente de actualización está fijada a un repositorio explícito y SHA resuelto;
  no se construyen comandos mediante evaluación de parámetros no confiables.

No se encontró una ruta concreta de traversal mediante los IDs o el journal de
recuperación bajo las comprobaciones leídas. Esto no sustituye las pruebas de regresión
de cada corrección ni una segunda revisión del snapshot final.

## Segunda revisión de correcciones

Se releyeron las fuentes corregidas y se ejecutó `node tooling/test-distribution.mjs`
dentro de `engineering-harness-validation:plan-20261028`, con el repositorio montado
read-only y sin red. Resultado: `Distribution tests passed.`

- **SEC-001 corregido:** `put()` prepara archivo con `wx`, hace `fsync`, rename y
  sincroniza el directorio. El journal usa el mismo mecanismo. La prueba de proceso
  terminado con código 99 deja únicamente cinco bytes en staging y comprueba que la
  recuperación restaura el snapshot anterior.
- **SEC-002 corregido:** el preflight rechaza paths desconocidos y divergencias
  guardadas respecto de los hashes previos. `--repair` es explícito. Las pruebas
  cubren archivo desconocido committed, colisión de wrapper y reparación declarada.
- **SEC-003 corregido en el código:** `work.sh` monta git_dir y common_dir externos
  como read-only cuando `.git` es un archivo. La prueba de distribución verifica
  sincronización en worktree; no ejecuta por sí sola el wrapper work en ese worktree.

### SEC-004 — Cleanup legado fuera del scope puede seguir un symlink ajeno

Estado al detectar: bloqueante pendiente de corrección.

Fuente: `tooling/sync-consumer.mjs`, `syncConsumer()` y su `pruneEmpty()` final.

Tras sincronizar, se ejecuta `pruneEmpty('engineering/corporate')` siempre que exista
esa ruta, incluso cuando la instalación anterior es v2 y la ruta no forma parte de
`scope`. El helper utiliza `statSync()` y recorre hijos sin `assertSafePath`/`lstat`.

En un consumidor v2, un `engineering/corporate` ajeno que sea symlink a un directorio
con hijos vacíos no se inspecciona en el preflight. El cleanup sigue el symlink y
puede borrar esos directorios antes de fallar intentando retirar el propio enlace.
También toca directorios vacíos legados sin relación con la operación actual.

Corrección requerida: limpiar legacy exclusivamente cuando la operación migre una
instalación anterior schema1; comprobar paths y tipos sin seguir symlinks en cada
descenso. Mantener esa limpieza bajo el ownership/lock de la transacción o evitar
pruning recursivo innecesario. Añadir regresión con un symlink legado ajeno en un
consumidor v2, demostrando que la actualización no lo sigue ni altera sus destinos.

Veredicto de esta segunda lectura: SEC-001/002 resueltos; SEC-004 impide declarar
terminada la revisión de seguridad hasta comprobar su corrección.

## Tercera revisión y veredicto final del scope

Se inspeccionó la corrección de SEC-004: `syncConsumer()` ya no hace pruning recursivo
después de la transacción. Los directorios vacíos se conservan, pues no constituyen
artefactos Git y su retiro no justifica tocar rutas ajenas.

Se ejecutó nuevamente en Docker `node tooling/test-distribution.mjs` contra la fuente
corregida. Resultado observado: `Distribution tests passed.`, exit code 0. La suite
incluye ahora un consumidor v2 con `engineering/corporate` symlink a un árbol externo
con subdirectorios vacíos; la actualización preserva el enlace y todos sus destinos.

**Veredicto:** no quedan bloqueantes demostrados en el scope de esta revisión.
SEC-001, SEC-002 y SEC-004 cuentan con corrección y regresiones ejecutadas; SEC-003
tiene el montaje específico corregido. La certificación de clientes IA, compatibilidad
de plataformas y el piloto externo no se deducen de este veredicto de seguridad.

Único archivo modificado por esta auditoría: este reporte temporal. Las correcciones
productivas pertenecen a los agentes con ownership de distribución y al integrador.
