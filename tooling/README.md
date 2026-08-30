# Tooling

Aquí vivirán únicamente scripts internos invocados por los GitHub workflows de este
repositorio. No constituyen una CLI pública ni se copian a repositorios consumidores.

Responsabilidades previstas:

- validar la fuente antes de publicar;
- preparar el árbol permitido de Policies y Skills;
- copiar una misma Skill a `.agents/skills/` y `.claude/skills/`;
- aplicar los cambios a checkouts temporales de consumidores; y
- apoyar al workflow que crea branches y Pull Requests mediante GitHub App.

No se agregan scripts vacíos durante Foundation. Cada helper se incorpora con pruebas
e idempotencia cuando el workflow realmente lo necesite.

Los workflows previstos y su criterio de incorporación están documentados en
[`../.github/workflows/README.md`](../.github/workflows/README.md).
