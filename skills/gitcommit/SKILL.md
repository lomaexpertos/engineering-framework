---
name: gitcommit
description: Planifica y crea commits Git seguros y semánticos. Usar cuando el usuario pida hacer commits, separar cambios pendientes o preparar una historia local; no hace push ni abre Pull Requests.
---

# Git Commit

Entregar commits locales con el formato y las restricciones de colaboración acordados.

## Convenciones y autoridad

- Consultar `git/commits.md`, `branching.md` y la convención local. Conventional
  Commits, idioma dominante del repositorio; español cuando no exista convención.
- Un commit representa una unidad lógica. Mantener código, pruebas y documentación
  unidos si forman esa unidad; no crear commits deliberadamente incompletos.
- Antes de stagear, inspeccionar estado, diffs y ownership; usar rutas/hunks explícitos.
  No usar staging global si puede incorporar cambios no inspeccionados.
- En la rama por defecto o protegida, crear una rama de trabajo salvo que el contrato
  permita flujo directo. Naming local o lowercase kebab-case derivado del cambio.
- No descartar trabajo, limpiar, resetear, reescribir historia ni hacer force-push sin
  solicitud explícita. Commitear no autoriza push, PR, aprobación o merge.
- Aplicar las validaciones proporcionales; declarar las no ejecutadas. El modelo
  decide agrupación y comandos dentro de esos límites.

## Resultado esperado

Commits con título semántico y cuerpo cuando aporte decisiones/efectos relevantes.
Informar rama, commits, validaciones y cambios restantes; no afirmar árbol limpio
sin comprobarlo ni apropiarse de cambios ajenos.
