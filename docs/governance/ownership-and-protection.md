# Ownership and protection

Recomendaciones administrativas para este repositorio crítico:

- Restringir escritura sobre `main` al mantenedor autorizado. Por decisión actual, el
  repositorio no exige Pull Requests.
- Validar en Docker antes de integrar cambios y antes de distribuir. Los workflows
  están retirados: no hay validación automática por push o merge a `main`.
  El canal asistido valida su snapshot antes de escribir.
- Asignar ownership específico a Policies sensibles y tooling de publicación.
- Restringir la GitHub App a repositorios consumidores autorizados y permisos mínimos.
- Almacenar su private key como secret de Actions con acceso restringido y rotación documentada.
- Conservar versión/SHA fuente en metadata y cambios del consumidor en Git como
  auditoría de la instalación asistida; logs de Actions y PR para el canal central.
- No restaurar workflows ni reactivar publicación central sin autorización explícita;
  una futura restauración debe conservar validación previa y publicación separada.
- No habilitar consumidores del canal central sin una decisión explícita; el registro
  no condiciona la instalación local autorizada mediante `INSTALL.md`.

`CODEOWNERS` se agregará cuando existan identificadores reales de organización o
equipos; inventarlos produciría una protección falsa.
