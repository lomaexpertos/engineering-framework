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

1. Confirmar que el dispatch usa `main` y validar la fuente.
2. Resolver únicamente repositorios habilitados de la organización configurada.
3. Obtener un installation token temporal y limitado a esos repositorios.
4. Crear o actualizar una branch determinista en cada consumidor.
5. Copiar Policies, metadata mínima, Skills para ambos agentes,
   `FRAMEWORK_VERSION` y el routing corporativo acordado para `AGENTS.md`.
6. Crear o actualizar el Pull Request del bot.
7. Solicitar auto-merge cuando esté habilitado, excepto para actualizaciones MAJOR.
8. Permitir que branch protection integre solo después de CI y eliminar la branch al
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
repositorio fuente y nombres de Skills administradas. Esa lista permite retirar una
Skill corporativa sin borrar Skills propias del consumidor; no es un manifest general
ni contiene checksums.

No se distribuyen `docs/architecture/`, `docs/governance/`, `projects.yml`, workflows,
credenciales, tooling interno ni documentación sobre cómo opera el bot.

## Idempotencia

La identidad lógica de una actualización es `(repository, framework_version)`. El
workflow reutiliza una branch determinista, por ejemplo
`engineering-framework/update-vX.Y.Z`. Reejecutar la publicación actualizará el
mismo PR abierto; si el repositorio ya contiene la versión y el mismo contenido, no
producirá cambios.

No se cerrará y recreará un PR salvo que su estado haga imposible actualizarlo. Esto
preserva conversación, auditoría y estabilidad de URLs.

## Seguridad

El workflow manual usa una GitHub App con `Contents: read/write`,
`Pull requests: read/write` y `Metadata: read`. No usará PATs personales ni hará push
directo a la rama protegida.
