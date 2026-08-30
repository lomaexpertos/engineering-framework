# Workflows

Esta carpeta contendrá:

- `validate-framework.yml`: valida Pull Requests antes de permitir merge a `main`;
- `publish-framework.yml`: después del merge, autentica la GitHub App, itera
  `projects.yml`, copia únicamente el árbol permitido y crea o actualiza los PRs.

Los helpers, credenciales y detalles de publicación permanecen en este repositorio y
no se copian a consumidores. No se incluyen workflows vacíos porque producirían una
señal de control inexistente.
