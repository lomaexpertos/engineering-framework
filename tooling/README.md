# Tooling

Aquí vivirán únicamente scripts internos invocados por los GitHub workflows de este
repositorio. No constituyen una CLI pública ni se copian a repositorios consumidores.

Responsabilidades previstas:

- validar la fuente antes de publicar;
- preparar el árbol permitido de Policies y Skills;
- copiar una misma Skill a `.agents/skills/` y `.claude/skills/`;
- aplicar los cambios a checkouts temporales de consumidores; y
- apoyar al workflow que crea branches y Pull Requests mediante GitHub App.

[`validate-framework.mjs`](validate-framework.mjs) implementa las validaciones locales
del workflow central sin dependencias externas. `resolve-projects.mjs` valida el
registro, `sync-consumer.mjs` aplica la copia sin borrar Skills locales y
`publish-projects.sh` coordina Git y Pull Requests en el runner. Las pruebas viven en
`test-distribution.mjs`; `test-publication.mjs` prueba el orquestador con un remoto Git
temporal y una GitHub CLI simulada, incluyendo preflight sin mutaciones, primera
publicación y reutilización del PR.

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

Los workflows previstos y su criterio de incorporación están documentados en
[`../.github/workflows/README.md`](../.github/workflows/README.md).
