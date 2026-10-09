# Distribution architecture

## Channels and ownership

Hay dos canales con una sola fuente y un solo sincronizador:

- **Asistido:** el usuario pide instalar o actualizar desde el consumidor y Codex
  sigue [`../../INSTALL.md`](../../INSTALL.md), trabajando en su rama actual.
- **Central opcional:** el mantenedor ejecuta `publish-framework.yml` desde `main`
  para consumidores habilitados en `projects.yml`, mediante GitHub App y PR.

`VERSION` identifica la versión del contenido. Cada operación fija un SHA inmutable
de `main`, valida ese snapshot y registra ambos datos en el consumidor. No existen
referencias dinámicas a la fuente durante las tareas del proyecto ni un segundo
catálogo de Skills. Cada push o merge a `main` mantiene la validación central.

El canal central está inactivo para los consumidores actuales: sus entradas están
deshabilitadas. No es necesario habilitarlo para instalar con Codex.

## Assisted installation

1. Inspeccionar instrucciones y estado Git del consumidor; inventariar documentación
   e instrucciones heredadas sin migrarlas.
2. Clonar `main` en un directorio temporal separado y fijar su SHA completo.
3. Leer `INSTALL.md` y validar la fuente dentro de su imagen Docker.
4. Ejecutar `sync-consumer.mjs --check` desde esa imagen, sin escrituras, con
   procedencia explícita y el consumidor montado.
5. Resolver las decisiones pendientes; aprobar explícitamente implicaciones de un
   salto MAJOR antes de aplicar.
6. Aplicar el mismo snapshot con `sync-consumer.mjs` sobre la rama actual, sin
   commits, push, PR, cambios de rama ni modificaciones al índice.
7. Verificar diff y estado previo; entregar reporte de copia corporativa y contexto
   heredado conservado, con recomendaciones para una tarea posterior.

No requiere `projects.yml`, GitHub App, auto-merge ni `main` como rama por defecto del
consumidor. El usuario decide cómo integrar después el diff según sus reglas de Git.
Los scripts se ejecutan en la imagen de la fuente, no se instalan en el proyecto.

## Central workflow

1. Confirmar que el dispatch usa `main`, fijar el SHA inmutable del evento y validar
   exactamente ese snapshot.
2. Resolver únicamente repositorios habilitados de la organización configurada.
3. Obtener un installation token temporal y limitado a esos repositorios.
4. Ejecutar un preflight de acceso, permisos, rama por defecto y merge settings para
   **todos** los consumidores antes de modificar el primero.
5. Crear o actualizar una branch determinista en cada consumidor.
6. Copiar Policies, metadata mínima, Skills para ambos agentes,
   `FRAMEWORK_VERSION` y el routing corporativo acordado para `AGENTS.md`.
7. Crear o actualizar el Pull Request del bot y su procedencia.
8. Solicitar auto-merge para el SHA exacto cuando esté habilitado, excepto para
   actualizaciones MAJOR.
9. Permitir que branch protection integre solo después de CI y eliminar la branch al
   completar el merge.

Los scripts auxiliares viven en este repositorio. `sync-consumer.mjs` es compartido
con el canal asistido; los helpers de registro, token y PR son exclusivos del central.
Ninguno se copia ni instala como herramienta permanente en consumidores.

## Distribution allowlist

Ambos canales pueden escribir únicamente:

```text
AGENTS.md                      # solo creación o región corporativa administrada
FRAMEWORK_VERSION
engineering/corporate/README.md
engineering/corporate/policies/**
engineering/corporate/metadata/**
.agents/skills/<skill-corporativa>/**
.claude/skills/<skill-corporativa>/**
```

`skills/<nombre>/` se copia completo y sin mantener variantes manuales, incluyendo
`SKILL.md` y `references/` cuando existan.

`engineering/corporate/metadata/installation.json` guarda exclusivamente versión,
repositorio y SHA fuente, y nombres de Skills administradas. Esa lista permite retirar
una Skill corporativa sin borrar Skills propias del consumidor; no es un manifest
general ni contiene checksums.

No se distribuyen `INSTALL.md`, `docs/architecture/`, `docs/governance/`, `projects.yml`,
workflows, credenciales, tooling interno ni documentación sobre cómo opera el bot.
El inventario asistido no amplía esta allowlist: documentos propios y carpetas heredadas
se conservan sin cambios y sus recomendaciones se entregan en pantalla.

## Shared synchronization safeguards

Antes de escribir, el sincronizador exige raíz Git real con rama activa, procedencia
explícita, metadata y versión coherentes; rechaza downgrade, ownership desconocido,
colisiones con Skills propias, symlinks, destinos ignorados, marcadores inválidos y
cambios locales staged, unstaged, untracked o ignorados en las rutas administradas.
Rechaza flags `skip-worktree` y `assume-unchanged` que pudieran ocultar esos cambios.
Los cambios fuera de esas rutas no bloquean ni se incorporan al diff del framework.

La metadata previa admite el identificador antiguo `engineering-framework` y SHA
nulo para compatibilidad; las nuevas salidas siempre usan repositorio canónico y SHA
completo. La verificación de procedencia depende del snapshot obtenido por cada canal:
la metadata no es una firma ni un manifest de checksums.

La aplicación no es una transacción de filesystem. Las comprobaciones se completan
antes de la primera escritura, pero un fallo de E/S puede dejar cambios parciales:
se informa y se inspecciona, sin declarar éxito ni hacer reset automático.

## Central channel prerequisites

Cada repositorio habilitado debe:

- tener `main` como rama por defecto;
- proteger `main` con los checks de CI que deban pasar antes del merge;
- permitir a la GitHub App crear commits, branches y Pull Requests;
- permitir squash merge; y
- cuando `auto_merge: true`, habilitar **Allow auto-merge** y **Automatically delete
  head branches**.

La protección de `main` y sus required checks siguen siendo la autoridad para decidir
cuándo puede integrarse el PR. El workflow no solicita permisos administrativos ni
modifica settings del consumidor. El preflight valida los merge settings visibles con
Metadata; branch protection debe verificarse administrativamente al incorporar el
repositorio.

## Idempotencia

En ambos canales, sobre una instalación guardada en Git, sincronizar el mismo
snapshot no produce cambios. El preflight protege las salidas todavía sin commit:
una instalación recién aplicada no se puede reejecutar hasta guardar esos cambios
por decisión del usuario. Misma versión con diferente contenido o procedencia se
reporta como `repair`; el SHA permite distinguir snapshots del mismo SemVer.

La identidad lógica de una actualización es `(repository, framework_version)`. El
workflow reutiliza una branch determinista, por ejemplo
`engineering-framework/update-vX.Y.Z`. Reejecutar la publicación actualizará el
mismo PR abierto; si el repositorio ya contiene la versión y el mismo contenido, no
producirá cambios.

Cada ejecución agrupa logs por repositorio y etapa, emite anotaciones de error y
construye un Step Summary con preflight, PR, commit consumidor y resultado. Si falla
la fase de preflight no se modifica ningún consumidor; si falla una mutación, se
detiene antes de intentar el siguiente repositorio y se conservan las filas de los ya
procesados.

No se cerrará y recreará un PR salvo que su estado haga imposible actualizarlo. Esto
preserva conversación, auditoría y estabilidad de URLs.

## Seguridad

El canal asistido necesita acceso de lectura a la fuente desde el host; no pasa
credenciales al contenedor. Usa un usuario equivalente al del host, montajes limitados
y metadata Git de solo lectura para worktrees cuando esté fuera del consumidor.
No ejecuta código de la aplicación ni altera servicios de ese proyecto.

El workflow manual usa una GitHub App con `Contents: read/write`,
`Pull requests: read/write` y `Metadata: read`. No usará PATs personales ni hará push
directo a la rama protegida.
