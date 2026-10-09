# Tooling

Aquí viven scripts de la fuente utilizados por la instalación asistida desde una
imagen Docker y helpers conservados del canal central suspendido. No se copian ni se instalan como CLI
permanente en repositorios consumidores. El procedimiento operativo está en
[`../INSTALL.md`](../INSTALL.md).

Responsabilidades:

- validar la fuente antes de publicar;
- preparar el árbol permitido de Policies y Skills;
- copiar una misma Skill a `.agents/skills/` y `.claude/skills/`;
- previsualizar y aplicar cambios en la rama actual o en checkouts temporales; y
- conservar los helpers de branches y Pull Requests del canal central, sin ejecutarlos.

[`validate-framework.mjs`](validate-framework.mjs) implementa las validaciones locales
sin dependencias externas y verifica que no haya workflows activos. `resolve-projects.mjs` valida el
registro del canal central, `sync-consumer.mjs` aplica la copia sin borrar Skills locales y
`publish-projects.sh` coordina Git y Pull Requests en el runner. Las pruebas viven en
`test-distribution.mjs`; `test-publication.mjs` prueba el orquestador con un remoto Git
temporal y una GitHub CLI simulada, incluyendo preflight sin mutaciones, primera
publicación y reutilización del PR.

## Sincronizador compartido

`sync-consumer.mjs --check <raiz-git>` devuelve un plan JSON sin escribir.
Sin `--check`, vuelve a comprobar el estado y aplica el plan. Requiere procedencia
explícita: `GITHUB_REPOSITORY=lomaexpertos/engineering-framework` y `GITHUB_SHA` completo
del snapshot fuente; ambos canales deben proporcionarlos.

Detecta instalación, actualización, reparación o ausencia de diferencias. Valida
metadata/versión, rechaza downgrades, colisiones, symlinks, destinos ignorados y trabajo
pendiente en rutas administradas antes de escribir. Tolera cambios ajenos a su scope,
no modifica rama, HEAD ni índice y admite worktrees con metadata accesible. Retira solo
Skills antes administradas; el contenido heredado no se migra automáticamente.

Las pruebas de distribución utilizan repositorios Git temporales reales y cubren
previsualización, idempotencia sobre instalaciones guardadas, actualización, ownership,
protección de trabajo local, metadata anterior y worktrees. No utilizan consumidores
reales ni credenciales remotas.

## Validación local

Construir y ejecutar siempre la imagen de validación; no requiere instalar Node ni las
dependencias del proyecto en el host:

```bash
docker build --target validation -t engineering-framework-validation:local .
docker run --rm engineering-framework-validation:local
```

La imagen usa Node 22, Bash y Git con versiones reproducibles desde una base explícita,
ejecuta como usuario no root y corre validación estructural, distribución y publicación
simulada.

Los workflows de GitHub Actions fueron retirados el 2026-10-09. No hay validación
automática por push ni publicación central; las pruebas locales y la instalación
asistida permanecen disponibles. El diseño del canal suspendido se conserva en
[`../docs/architecture/distribution.md`](../docs/architecture/distribution.md).
