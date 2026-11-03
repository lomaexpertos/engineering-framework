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
   necesita sobrevivir una ejecución. Producción **MUST** usar exactamente la raíz
   definida en «Ruta productiva canónica»; en otros ambientes el directorio final
   **MUST** llamarse `runtime`, con aislamiento por ambiente/instancia.
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

## Ruta productiva canónica

En cada host productivo administrado por el proyecto:

```text
RUNTIME_DIR=/home/appmanager/<project>-runtime
```

`<project>` es el identificador estable del proyecto, declarado una sola vez en su
configuración operativa versionada y documentado en el README de producción. No es
el nombre de una app, unidad, rama, worktree, slot, usuario detectado ni ambiente.
El agente **MUST** reutilizar la identidad existente; si falta o es contradictoria,
resolver esa decisión con el responsable antes de generar una ruta o escribir.
El identificador **MUST NOT** contener separadores, traversal ni expansiones de shell.

1. La ruta literal anterior es obligatoria, no un ejemplo ni una preferencia. El
   usuario operativo es `appmanager`; `$HOME`, `pwd`, el checkout y convenciones de
   otro repositorio **MUST NOT** determinar la ubicación.
2. **MUST NOT** sustituirse por `/home/appmanager/<project>-production/runtime`,
   `/home/appmanager/<project>/runtime`, `<checkout>/runtime`, `/tmp` o una ruta
   «equivalente». Un symlink o alias **MUST NOT** usarse para simular cumplimiento.
3. Locks, estado, slots, temporales operativos y secretos materializados del
   proyecto **MUST** quedar dentro de esa raíz. Subdirectorios por unidad, servicio
   o función se crean solo si son necesarios, con propósito y consumidores
   documentados. No crear otra raíz por aplicación o sufijo `production`.
4. Scripts, Compose, jobs y runbooks **MUST** consumir la misma declaración. Una
   variable de entorno, flag CLI o archivo local **MUST NOT** autorizar un override:
   un valor distinto **MUST** provocar error antes de cualquier escritura.
5. El precheck **MUST** comprobar identidad, igualdad con la ruta esperada,
   separación del checkout, ownership/permisos y confinamiento de destinos antes
   de crear directorios, materializar secretos o adquirir locks de operación.
   Rutas con `..`, symlinks en la raíz/ancestros o destinos que escapen mediante
   enlaces **MUST** rechazarse, no normalizarse como alternativa aceptada.
6. La ausencia de permisos o de `appmanager` **MUST** producir diagnóstico; **MUST NOT**
   provocar fallback, creación de cuentas, `sudo`, cambio de propietario ni chmod
   amplio por iniciativa del agente. Preparar el host necesita autoridad explícita.
7. Una ruta heredada diferente es una desviación, no un segundo estándar. **MUST NOT**
   moverse, borrarse, enlazarse ni reutilizarse automáticamente. Documentar impacto y
   migración con recuperación según
   [infrastructure-change-safety.md](../ai-assisted-development/infrastructure-change-safety.md).
   Una excepción requiere aprobación explícita conforme a
   [precedence.md](../precedence.md); una petición genérica de implementar o desplegar
   no autoriza cambiar esta invariante.

Esta raíz gobierna archivos operativos del deployment en el host. No es el directorio
de fuentes `infra/deploy/production/`, el runtime de lenguaje de una app, el runtime
interno del harness ni una orden de mover el almacenamiento administrado por Docker
o servicios externos. Volúmenes persistentes y backups requieren contrato propio;
no trasladarlos por deducción. Todo bind mount o destino de archivo operativo bajo
control del deployment **MUST** respetar esta raíz y su confinamiento.

## Evidencia y controles

La revisión **MUST** comprobar referencias y probar con fixtures la ruta canónica,
override divergente, identidad ausente, symlink, escape y falta de permisos: los
casos inválidos fallan antes de mutar. No ejecutar un deployment para demostrarlo.
Los checks de guías verifican presencia/routing de esta Policy; el scope `deployment`
actual valida el manifest y **no** inspecciona la ruta efectiva de scripts, Compose
o hosts. Esa validación pertenece al precheck y pruebas del proyecto.
