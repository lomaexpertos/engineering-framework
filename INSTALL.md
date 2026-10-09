# Instalar o actualizar Engineering Framework con Codex

Este es el punto de entrada operativo para un agente que trabaja **dentro del
repositorio consumidor**. Instala o actualiza la copia corporativa desde el último
snapshot de `main` de `git@github.com:lomaexpertos/engineering-framework.git`, en la
rama actual del consumidor. No requiere registro en `projects.yml`, GitHub App ni
configuración de auto-merge. No crea commits, no hace push ni cambia esa rama.

Puedes pedirlo así:

> Lee INSTALL.md en main del repositorio
> git@github.com:lomaexpertos/engineering-framework.git e instala o actualiza este
> proyecto siguiendo esas instrucciones, en mi rama actual. Muéstrame el plan y el
> reporte de documentación heredada; no hagas commit ni push ni migres documentos.

## 1. Inspeccionar y fijar la fuente

- Confirma la raíz Git, rama actual, HEAD, índice y estado del consumidor. Se admite
  trabajo pendiente **fuera de las rutas administradas**; no lo alteres ni lo stages.
  Un HEAD separado o un conflicto dentro de esas rutas exige detener la instalación.
- Lee sus instrucciones locales y reconoce su arquitectura. Este procedimiento
  instala contexto corporativo; no adopta infraestructura, no ejecuta código de la
  aplicación y no modifica su arquitectura para satisfacer nuevas Policies.
- Requiere acceso de lectura al repositorio fuente, Git y Docker disponibles. Si
  faltan, informa el impedimento; no instales runtimes del proyecto en el host.
- Obtén una copia temporal separada del consumidor. No uses una copia personal de
  Skills ni una rama de desarrollo como fuente. Fija el SHA completo recibido de
  `main` y vuelve a leer **este documento en ese snapshot**, junto con `VERSION`.
  «Última versión» significa `main` al obtenerlo; no se resuelve de nuevo a mitad del
  proceso. Un checkout local no sincronizado de `main` no sirve como referencia.

Ejemplo desde la raíz del consumidor, en Bash:

```bash
set -euo pipefail
framework_consumer=$(git rev-parse --show-toplevel)
framework_session=$(mktemp -d -t engineering-framework-install.XXXXXX)
git clone --branch main --single-branch git@github.com:lomaexpertos/engineering-framework.git "$framework_session/source"
framework_source="$framework_session/source"
framework_source_sha=$(git -C "$framework_source" rev-parse HEAD)
git -C "$framework_source" switch --detach "$framework_source_sha"
```

Conserva esas variables durante la sesión. Ante un comando fallido, detente; no
continúes con variables vacías ni uses el consumidor como contexto de construcción.
La edición autorizada del framework se hace en su fuente; estas instrucciones solo
se usan contra consumidores, nunca contra el propio Engineering Framework.

## 2. Inventariar contexto heredado

En la primera instalación, **antes de escribir**, revisa los nombres de todas las
carpetas y documentos de la raíz y sigue únicamente candidatos relevantes. No limites
la búsqueda a nombres esperados: `specifications/`, `specs/`, `docs/`, `architecture/`,
`standards/`, `policies/`, `ai/`, `.ai/`, `instructions/` y documentos sueltos son
ejemplos, no una allowlist. En actualizaciones, revisa candidatos nuevos y el contexto
necesario para interpretar conflictos o material aún sin reconciliar.

Lee índices, encabezados y una muestra proporcional para distinguir documentación
de negocio, specs de trabajo, reportes, normas locales e instrucciones de agentes.
Respeta ignores y exclusiones de seguridad al inspeccionar; puedes registrar el
nombre de un candidato ignorado sin abrir su contenido. No inspecciones secretos,
`.env`, dependencias, artefactos de build ni destinos de symlinks. No leas todas las
Policies o Skills para hacer el inventario: sigue los routers aplicables.

La instalación **no mueve, combina ni borra este material**, aunque esté mal ubicado.
Identifica también contradicciones entre instrucciones locales y Policies aplicables;
no las resuelvas silenciosamente. Un conflicto de archivos u ownership en las rutas
administradas bloquea la sincronización. Otros conflictos de adopción se reportan
como pendientes, sin declarar el proyecto conforme ni ejecutar la decisión afectada.

Para cada candidato prepara una recomendación basada en evidencia:

| Recomendación | Cuándo corresponde |
| --- | --- |
| Respetar | Contenido legítimo del proyecto, ya ubicado correctamente o con una razón local válida. |
| Integrar/sincronizar en una tarea posterior | Contexto útil que debería reconciliarse con `engineering/docs/<modulo>/README.md`, `engineering/specs/<fecha>_<slug>/` o `engineering/quality-review/<fecha>_<slug>/`, según su naturaleza y la Policy de layout. No inventar fechas históricas. |
| Proponer eliminación | Duplicado u obsoleto comprobado; identificar primero el reemplazo y las referencias que necesitarían ajuste. Nunca eliminar durante esta operación. |
| Investigar | Evidencia insuficiente, colisión o contradicción que requiere una decisión del usuario. |

Las normas locales más estrictas y las Skills propias pueden conservarse. No copies
documentación del proyecto a `engineering/corporate/`. No registres specs, preguntas
de trabajo ni reportes temporales en routers permanentes. No crees carpetas vacías
para aparentar adopción. Las Skills personales homónimas activas se señalan como
posible ambigüedad de discovery; desactivarlas requiere una decisión aparte.

## 3. Validar la fuente dentro de Docker

Usa el Dockerfile del snapshot fuente. Su target `validation` incluye las herramientas
necesarias y las pruebas; no ejecutes Node ni scripts del proyecto en el host.

```bash
framework_image="engineering-framework-install:$framework_source_sha"
docker build --target validation -t "$framework_image" "$framework_source"
docker run --rm --network none "$framework_image"
```

Si falla la validación, detente sin modificar el consumidor. La construcción puede
necesitar red para obtener la imagen y sus paquetes; la validación y sincronización
no necesitan red ni credenciales dentro del contenedor. No montes el socket Docker.

## 4. Previsualizar sin escribir

El sincronizador detecta primera instalación por ausencia de `FRAMEWORK_VERSION` y
metadata; para actualizar exige ambos consistentes. Acepta metadata anterior de este
framework, pero no directorios corporativos de ownership desconocido. Rechaza
downgrades, colisiones con Skills locales, symlinks, destinos ignorados, marcadores
corporativos incompletos y cambios locales en archivos que administraría.
También se detiene ante `skip-worktree` o `assume-unchanged` en esas rutas, porque
pueden ocultar cambios a Git.

No uses `stash`, reset, borrado, commits automáticos ni reemplazos forzados para
superar estas protecciones. Si se bloquea, presenta las rutas y pide una decisión
específica. Un `AGENTS.md` preexistente debe tener sus cambios guardados en Git antes
de que el instalador agregue el bloque; no basta con que su contenido parezca seguro.

Monta solo el consumidor. Usa su misma ruta absoluta dentro del contenedor para
admitir worktrees; cuando su directorio común Git esté fuera de esa raíz, monta
también **ese directorio exacto**, de solo lectura. No montes el repositorio padre,
el home ni directorios amplios para resolver un worktree. En una configuración Git
atípica que requiera otro directorio, identifica y monta exclusivamente su metadata,
o informa la limitación antes de continuar.

```bash
framework_git_common=$(git -C "$framework_consumer" rev-parse --path-format=absolute --git-common-dir)
framework_git_mounts=()
case "$framework_git_common" in
  "$framework_consumer"/*) ;;
  *) framework_git_mounts=(--mount "type=bind,src=$framework_git_common,dst=$framework_git_common,readonly") ;;
esac

docker run --rm --network none --user "$(id -u):$(id -g)" \
  --env GITHUB_REPOSITORY=lomaexpertos/engineering-framework \
  --env "GITHUB_SHA=$framework_source_sha" \
  --mount "type=bind,src=$framework_consumer,dst=$framework_consumer,readonly" \
  "${framework_git_mounts[@]}" \
  "$framework_image" node tooling/sync-consumer.mjs --check "$framework_consumer"
```

El JSON indica `install`, `update`, `repair` o `unchanged`, versión previa y nueva,
SHA fuente, rama, salto MAJOR y archivos que se agregarían, actualizarían o retirarían.
`--check` no escribe archivos ni cambia el índice. `repair` significa misma versión
con contenido o procedencia diferente, no permiso para descartar cambios locales.
Examina especialmente retiradas y saltos MAJOR; presenta sus implicaciones. No
supongas que una versión nueva es compatible solo porque la copia puede realizarse.

## 5. Aplicar el plan autorizado

Si el usuario pidió instalar/actualizar y el plan no requiere decisiones pendientes,
aplica el mismo snapshot; no necesitas una segunda aprobación rutinaria. Un salto
MAJOR exige aprobación explícita de sus implicaciones antes de aplicar. Mantén
pausadas otras ediciones del consumidor durante el preflight y la escritura.

```bash
docker run --rm --network none --user "$(id -u):$(id -g)" \
  --env GITHUB_REPOSITORY=lomaexpertos/engineering-framework \
  --env "GITHUB_SHA=$framework_source_sha" \
  --mount "type=bind,src=$framework_consumer,dst=$framework_consumer" \
  "${framework_git_mounts[@]}" \
  "$framework_image" node tooling/sync-consumer.mjs "$framework_consumer"
```

El sincronizador vuelve a comprobar las protecciones antes de escribir. Solo gestiona:

- `AGENTS.md`: creación o reemplazo del bloque corporativo; preserva el texto local
  exterior. No interpreta ni elimina reglas locales.
- `FRAMEWORK_VERSION` y `engineering/corporate/`: Policies, router y metadata de
  procedencia; se reemplazan como salidas generadas desde la fuente.
- Las Skills corporativas nombradas en metadata, bajo `.agents/skills/` y
  `.claude/skills/`: copias completas e idénticas; retira las corporativas obsoletas
  y conserva Skills propias con otros nombres.

La vista de carpetas y catálogos está en
[`CONSUMER_STRUCTURE.md`](CONSUMER_STRUCTURE.md). No se distribuyen este instalador,
scripts, workflows, registro de proyectos ni docs internas del framework. Tampoco se
crean `engineering/docs/`, `engineering/specs/` o `engineering/quality-review/` hasta
que el proyecto tenga contenido propio para ellos.

Una instalación deja cambios sin commit. Antes de una actualización posterior, esos
cambios deben haberse integrado o guardado en Git mediante una decisión del usuario;
reejecutar sobre salidas aún pendientes se bloquea, no equivale a una instalación
limpia. Sobre una instalación guardada, el mismo snapshot no genera diferencias.
Si hay una interrupción de E/S durante la escritura, puede haber cambios parciales:
informa lo ocurrido y revisa el diff; no anuncies éxito ni hagas rollback destructivo.

## 6. Verificar y entregar el reporte

Comprueba versión y SHA en `installation.json`, las dos copias de Skills y el bloque
corporativo. Revisa el diff frente al estado inicial: rama, HEAD, índice y cambios
ajenos deben permanecer intactos; todos los cambios nuevos deben estar en la allowlist.
No ejecutes código ni migraciones del consumidor para validar una copia de contexto.
No reejecutes el sincronizador sobre cambios sin commit como método de verificación:
consulta los archivos y el diff, porque ese estado se bloquea deliberadamente.

Entrega **en pantalla**, sin crear otro documento salvo solicitud explícita:

1. Resultado, versión anterior/nueva, SHA, rama, plan aplicado y validación Docker
   usada (imagen, target y comandos). Declara claramente cualquier paso pendiente.
2. Resumen de archivos corporativos creados, actualizados y retirados.
3. Tabla de carpetas/documentos heredados: ruta, evidencia de su función, si quedó
   intacta y recomendación concreta —integrar, proponer eliminación, respetar o
   investigar— con destino cuando corresponda. Incluso si no hay candidatos, indícalo.
4. Conflictos normativos, ambigüedades de Skills y decisiones necesarias. No afirmes
   que se migró o depuró contenido cuando solo se recomendó hacerlo.

No hagas commit, push, PR ni cambios de rama sin una petición adicional. Si el agente
en curso no descubre automáticamente las nuevas Skills, inicia una nueva sesión en
el proyecto; la copia instalada no garantiza recargar recursos en una sesión abierta.
Al terminar puedes retirar únicamente el checkout temporal identificado de esta
sesión; conserva imágenes/cachés útiles y no hagas limpiezas globales de Docker.
