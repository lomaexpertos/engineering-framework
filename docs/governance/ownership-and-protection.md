# Ownership and protection

Recomendaciones administrativas para este repositorio crítico:

- Proteger `main` y exigir Pull Request.
- Exigir checks de validación del framework y al menos una revisión de CODEOWNERS.
- Asignar ownership específico a Policies sensibles, tooling de publicación y workflows.
- Restringir la GitHub App a repositorios consumidores autorizados y permisos mínimos.
- Almacenar su private key como secret de Actions con acceso restringido y rotación documentada.
- Conservar logs de Actions, eventos de instalación y Pull Requests como auditoría.
- Prohibir que el workflow de publicación se ejecute desde código no revisado.

`CODEOWNERS` se agregará cuando existan identificadores reales de organización o
equipos; inventarlos produciría una protección falsa.
