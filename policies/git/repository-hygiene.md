# Repository hygiene

## Requirements

1. El estado y los diffs del repositorio **MUST** inspeccionarse antes de stagear,
   commitear, descartar o reescribir cambios.
2. Archivos o hunks **MUST** stagearse por intención; comandos que incorporen todo el
   árbol **SHOULD NOT** usarse cuando existan cambios ajenos o separables.
3. Secretos, credenciales, dumps, artefactos temporales y salidas generadas no
   previstas **MUST NOT** incorporarse al historial.
4. Cambios preexistentes o ajenos **MUST** preservarse. Descartes, limpieza, resets y
   otras operaciones destructivas requieren alcance y autorización explícitos.
5. Archivos generados **MUST** modificarse desde su fuente o proceso canónico, no como
   una copia manual divergente.
