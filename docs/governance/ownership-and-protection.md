# Ownership and protection

Recomendaciones administrativas para este repositorio crítico:

- Restringir escritura sobre `main` al mantenedor autorizado. Por decisión actual, el
  repositorio no exige Pull Requests.
- Ejecutar `validate-framework` después de cada push o merge a `main` y prohibir que
  una ejecución fallida permita publicación manual.
- Asignar ownership específico a Policies sensibles, tooling de publicación y workflows.
- Restringir la GitHub App a repositorios consumidores autorizados y permisos mínimos.
- Almacenar su private key como secret de Actions con acceso restringido y rotación documentada.
- Conservar logs de Actions, eventos de instalación y Pull Requests como auditoría.
- Mantener el workflow de publicación manual, separado y con validación previa.

`CODEOWNERS` se agregará cuando existan identificadores reales de organización o
equipos; inventarlos produciría una protección falsa.
