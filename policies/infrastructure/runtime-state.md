# Infrastructure runtime state

## Purpose

Evitar que el estado resultante de una operación se confunda con configuración fuente
o quede parcialmente publicado.

## Requirements

1. Tags efectivamente desplegadas, proyecto runtime detectado, slot activo, locks,
   transacciones y archivos descifrados **MUST** tratarse como estado runtime.
2. El estado runtime **MUST NOT** almacenarse dentro del checkout como fuente de
   configuración ni incorporarse a Git.
3. Cada ambiente **MUST** declarar un `RUNTIME_DIR` explícito para el estado que
   necesita sobrevivir una ejecución. El directorio final **MUST** llamarse `runtime`.
4. El estado **MUST** escribirse solo después de validar la operación que representa.
5. Una actualización de varios archivos relacionados **MUST** publicarse como conjunto
   recuperable; no debe mezclar partes de versiones distintas.
6. Las escrituras **MUST** ser atómicas cuando una lectura concurrente pueda observar
   un estado parcial.
7. Operaciones incompatibles sobre la misma unidad **MUST** compartir un mecanismo de
   exclusión mutua.
8. Los archivos temporales sensibles **MUST** usar permisos restrictivos y eliminarse
   al finalizar, incluso cuando la operación falle.
9. Los respaldos de estado runtime **MUST** tener ubicación, retención y procedimiento
   de restauración documentados.
10. Temporales operativos **MUST** crearse bajo `RUNTIME_DIR`, no en rutas globales
    como `/tmp`.
11. Cuando `RUNTIME_DIR` contenga secretos materializados, **MUST** ubicarse fuera del
    checkout y cumplir las Policies de seguridad aplicables.
