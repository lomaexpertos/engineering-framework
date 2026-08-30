# Distribution architecture

## Trigger and ownership

La distribución es responsabilidad exclusiva de un GitHub workflow de este
repositorio. No requiere una CLI, instalación local ni acciones manuales de los
desarrolladores consumidores.

Un merge a `main` detona el workflow central. Si el árbol distribuible no cambió, el
workflow termina sin abrir PRs. Si cambió, la versión declarada en `VERSION` identifica
la actualización que recibirán los consumidores.

## Central workflow

1. Validar estructura, Policies, Skills, enlaces y consistencia de `VERSION`.
2. Preparar, dentro del job, una copia determinista del contenido permitido.
3. Obtener un installation token temporal mediante la GitHub App corporativa.
4. Iterar únicamente repositorios habilitados en `projects.yml`.
5. Crear o actualizar una branch de actualización en cada consumidor.
6. Copiar Policies, metadata mínima, Skills para ambos agentes,
   `FRAMEWORK_VERSION` y el routing corporativo acordado para `AGENTS.md`.
7. Crear o actualizar el Pull Request del bot.
8. Solicitar auto-merge cuando esté habilitado.
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

El workflow central usa una GitHub App con `Contents: read/write`,
`Pull requests: read/write` y `Metadata: read`. No usará PATs personales ni hará push
directo a la rama protegida.
