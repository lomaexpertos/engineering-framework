# Review workflow

Leer esta referencia cuando sea necesario resolver una base, rango o historial de Git
no evidente.

## Evidencia inicial

Usar comandos de solo lectura según el artefacto disponible:

- `git status --short`
- `git branch --show-current`
- `git symbolic-ref refs/remotes/origin/HEAD`
- `git merge-base <base> HEAD`
- `git log --oneline --decorate <base>..HEAD`
- `git diff --stat <base>...HEAD`
- `git diff --name-status <base>...HEAD`

Para un PR remoto, consultar su metadata y diff con la herramienta ya disponible. No
publicar comentarios, aprobar ni solicitar cambios salvo autorización explícita.

Inferir la base desde metadata del PR, `origin/HEAD`, ramas remotas y convenciones. Si
sigue ambigua y cambia conclusiones, preguntar.

## Historia y archivos

Clasificar cambios por backend, datos, frontend, permisos, infraestructura, pruebas y
documentación. Revisar primero superficies de riesgo material. Inspeccionar la historia
para detectar mezcla no relacionada, artefactos generados, dumps o secretos, pero no
exigir reescritura salvo beneficio o riesgo concreto.
