---
name: gitcommit
description: Planifica y crea commits Git seguros y semánticos. Usar cuando el usuario pida hacer commits, separar cambios pendientes o preparar una historia local; no hace push ni abre Pull Requests.
---

# Git Commit

Convertir el árbol de trabajo en commits lógicos sin apropiarse de cambios ajenos ni
publicar estado externo.

## Inspección

Antes de stagear:

1. Confirmar la raíz, rama actual, rama por defecto y estado del repositorio.
2. Revisar diffs staged y unstaged, empezando por el resumen y profundizando por
   archivos o hunks relacionados.
3. Identificar cambios separables, archivos generados, secretos y trabajo que no
   pertenece al encargo.
4. Consultar las Policies Git y la convención local de commits y ramas.

No usar `git add .`, `git add -A`, `git commit -a` ni equivalentes cuando puedan
incorporar cambios no inspeccionados. No descartar, limpiar, resetear, reescribir
historia ni hacer force-push sin solicitud explícita.

## Preparar la rama

Si la rama actual es la rama por defecto o está protegida, crear una rama de trabajo
antes del primer commit salvo que el contrato del repositorio permita expresamente el
flujo directo. Seguir la convención local; si no existe, usar un nombre breve en
lowercase kebab-case derivado del cambio.

Crear la rama no autoriza publicarla.

## Crear commits

1. Agrupar por intención, comportamiento y dependencia, no por orden de edición ni
   tipo de archivo.
2. Mantener juntos código, pruebas y documentación cuando formen una unidad que deba
   poder entenderse o validarse por sí misma.
3. Stagear rutas o hunks explícitos y revisar el diff staged completo.
4. Ejecutar las validaciones proporcionales disponibles o registrar la limitación.
5. Crear un mensaje Conventional Commit en el idioma dominante del repositorio; usar
   español cuando no exista convención.
6. Añadir cuerpo cuando aporte decisiones, efectos, validaciones, migraciones o riesgos
   que el título no explique.
7. Repetir hasta commitear el alcance autorizado o dejar visibles los cambios que
   intencionalmente permanecen fuera.

No crear un único commit para trabajo separable ni dividir una unidad de modo que deje
commits deliberadamente incompletos. No hacer push, abrir PR, aprobar o mergear salvo
que el usuario lo solicite por separado.

## Cierre

Informar rama, commits creados, validaciones relacionadas y cambios que permanezcan
sin commitear. No declarar el árbol limpio sin comprobarlo.
