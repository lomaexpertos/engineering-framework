# Distribution architecture

## Trigger and ownership

La distribución es responsabilidad exclusiva de un GitHub workflow manual de este
repositorio. No requiere una CLI, instalación local ni acciones de los desarrolladores
consumidores.

Cada push o merge a `main` ejecuta validación. El mantenedor inicia después
`publish-framework.yml` mediante `workflow_dispatch` desde `main`; el workflow vuelve
a validar antes de obtener credenciales. `VERSION` identifica la actualización que
recibirán los consumidores.

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

Los scripts auxiliares que necesite el workflow viven en este repositorio y son una
implementación interna; no forman una herramienta que deba instalarse o ejecutarse en
los consumidores.

## Distribution allowlist

El workflow puede escribir únicamente:

```text
AGENTS.md                      # solo creación o región corporativa administrada
FRAMEWORK_VERSION
engineering/corporate/README.md
engineering/corporate/policies/**
engineering/corporate/metadata/**
.agents/skills/**
.claude/skills/**
```

`skills/<nombre>/` se copia completo y sin mantener variantes manuales, incluyendo
`SKILL.md` y `references/` cuando existan.

`engineering/corporate/metadata/installation.json` guarda exclusivamente versión,
repositorio y SHA fuente, y nombres de Skills administradas. Esa lista permite retirar
una Skill corporativa sin borrar Skills propias del consumidor; no es un manifest
general ni contiene checksums.

No se distribuyen `docs/architecture/`, `docs/governance/`, `projects.yml`, workflows,
credenciales, tooling interno ni documentación sobre cómo opera el bot.

## Consumer prerequisites

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

El workflow manual usa una GitHub App con `Contents: read/write`,
`Pull requests: read/write` y `Metadata: read`. No usará PATs personales ni hará push
directo a la rama protegida.
