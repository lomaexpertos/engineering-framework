# Resultado de distribución

Fecha: 2026-10-28. Alcance: T006 y migración del helper central suspendido.

Implementados: sincronizador al layout `.harness/core/`, manifest schema 2 con hashes,
paridad de skills, wrappers Docker, bootstrap, bloqueo por ownership/estado/trabajadores,
preflight de AGENTS resultante, MAJOR explícito y journal de recuperación sin reset.
La selección por perfiles y skills locales `project-*` conserva el núcleo completo.
Las divergencias de hash guardadas requieren `--repair`; contenido desconocido se
rechaza incluso si está comprometido en Git.

Validación ejecutada en target Docker `validation`, imagen
`engineering-distribution:work`, contenedores efímeros sin red:

```bash
docker build --target validation -q -t engineering-distribution:work .
docker run --rm --network none engineering-distribution:work node tooling/test-distribution.mjs
docker run --rm --network none engineering-distribution:work node tooling/test-publication.mjs
```

Ambas suites pasaron. La suite de publicación usa remoto Git temporal y GH simulado;
no se reactivó el canal central ni se publicaron cambios reales.
La última ejecución incluye perfiles, adaptación Claude preservando contenido local,
y un proceso que termina durante la escritura de staging: destino/journal se escriben
mediante fsync y rename, y la recuperación conserva los snapshots anteriores.

Piloto de wrappers real, con consumidor temporal independiente:

- Instalación vía sincronizador dentro de Docker.
- `bash .harness/check.sh --scope installation --json`: `ok: true`.
- `bash .harness/work.sh status`: lista vacía correcta.
- `update.sh --check` y `update.sh`: snapshot fijado, validación y aplicación Docker.
- `bootstrap-harness.sh <consumidor>`: instalación completa en un segundo consumidor.

El origen público se sustituyó SOLO para el proceso de prueba mediante configuración
Git de URL hacia un repositorio fixture local. El producto mantiene su URL canónica
y no se publicó una release para realizar el piloto. Snapshot fixture:
`cbea0e1f5ad5e1627e17758eec13ac45a9343ed5`.

Logs en `evidence/`. Los directorios piloto se eliminan tras guardar esta evidencia;
las imágenes se conservan como caché. No se montó socket Docker ni se ejecutaron
runtimes del proyecto en el host.

Decisión operativa: un kill abrupto puede dejar `update.lock`. No se rompe un lock
de propietario desconocido automáticamente. El operador debe comprobar que no queda
ninguna operación activa y retirar solo ese lock antes de invocar `--recover`.
Recuperar rechaza ediciones posteriores y restaura solo paths administrados.

## Revisión de seguridad y wrapper worktree

SEC004: se eliminó la limpieza recursiva de directorios vacíos posterior a la
transacción. Los directorios vacíos no son artefactos Git y no justifican atravesar
rutas fuera del ownership. La suite instala v2, agrega `engineering/corporate` como
symlink hacia un árbol externo con directorios vacíos y comprueba que actualizar
preserva tanto el symlink como todo el árbol externo. Suite Docker aprobada.

SEC003: piloto real con worktree Git enlazado y metadata externa. Se generaron estado
y cierre del fixture en Docker con fecha 2026-01-01, se guardaron en Git y se invocó
el wrapper distribuido desde el worktree:

```bash
bash .harness/work.sh purge 20260101_wrapper_pilot --check
```

Resultado con exit 0: `{"eligible":["20260101_wrapper_pilot"]}`. El wrapper monta
únicamente gitdir/common-dir necesarios, readonly, además del consumidor. No se hizo
purga real ni se tocó ningún proyecto existente. Log en `evidence/worktree-purge-check.log`.
