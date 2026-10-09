# Ownership and protection

Recomendaciones administrativas para este repositorio crítico:

- Restringir escritura sobre `main` al mantenedor autorizado. Por decisión actual, el
  repositorio no exige Pull Requests.
- Ejecutar `validate-framework` después de cada push o merge a `main` y prohibir que
  una ejecución fallida permita distribución. El canal asistido también valida su
  snapshot en Docker antes de escribir.
- Asignar ownership específico a Policies sensibles, tooling de publicación y workflows.
- Restringir la GitHub App a repositorios consumidores autorizados y permisos mínimos.
- Almacenar su private key como secret de Actions con acceso restringido y rotación documentada.
- Conservar versión/SHA fuente en metadata y cambios del consumidor en Git como
  auditoría de la instalación asistida; logs de Actions y PR para el canal central.
- Mantener el workflow de publicación manual, separado y con validación previa.
- No habilitar consumidores del canal central sin una decisión explícita; el registro
  no condiciona la instalación local autorizada mediante `INSTALL.md`.

`CODEOWNERS` se agregará cuando existan identificadores reales de organización o
equipos; inventarlos produciría una protección falsa.
