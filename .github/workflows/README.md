# Workflows

Esta carpeta contiene o contendrá:

- `validate-framework.yml`: valida cada push o merge recibido por `main` y puede
  ejecutarse manualmente;
- `publish-framework.yml`: se ejecuta manualmente desde `main`, autentica la GitHub
  App, itera `projects.yml`, copia únicamente el árbol permitido y crea o actualiza
  los PRs.

Los helpers, credenciales y detalles de publicación permanecen en este repositorio y
no se copian a consumidores. No se incluyen workflows vacíos porque producirían una
señal de control inexistente.

La publicación vuelve a ejecutar validación antes de solicitar credenciales; una
falla en `main` bloquea distribución aunque no revierta el commit.

## Repository configuration

`publish-framework.yml` consume estas configuraciones del repositorio central:

- variable `ENGINEERING_FRAMEWORK_GITHUB_APP_CLIENT_ID`;
- secret `ENGINEERING_FRAMEWORK_GITHUB_APP_PRIVATE_KEY`; y
- variable `ENGINEERING_FRAMEWORK_CONSUMER_ORGANIZATION`.
