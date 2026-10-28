# Instalar y actualizar el harness

## Requisitos

Repositorio Git con rama activa, Bash, Git, Docker y la utilidad transversal GNU
`timeout` para checks locales. No instalar runtimes del proyecto en el host.
La imagen declara Node, Bash y Git. Las imágenes de checks del consumidor deben
construirse desde sus Dockerfiles y declarar todas sus dependencias.

El origen público es `https://github.com/lomaexpertos/engineering-framework.git`.
Solo estarán disponibles las revisiones publicadas por el mantenedor. Una revisión
local no aparece en `main` por ejecutar este procedimiento.

## Primera instalación

Descargar `tooling/bootstrap-harness.sh` desde una revisión publicada e inspeccionable
del origen y guardarlo fuera del consumidor; ejecutarlo como archivo:

```bash
bash /ruta/al/bootstrap-harness.sh /ruta/al/proyecto --check
bash /ruta/al/bootstrap-harness.sh /ruta/al/proyecto
```

El bootstrap obtiene `main`, fija su SHA y usa el actualizador del mismo snapshot.
No ejecutar una descarga mediante pipe al shell. La descarga inicial es una decisión
de confianza en el origen; los hashes posteriores detectan divergencias, no son firma.

## Actualizar una instalación

Desde el consumidor:

```bash
bash .harness/update.sh --check
bash .harness/update.sh
bash .harness/update.sh --ref v2.0.0 --check
```

Una llamada normal obtiene, valida y aplica una referencia fijada a SHA. `--check`
no escribe en el consumidor. `--ref` permite tag o SHA publicado; el tag de ejemplo
solo funciona cuando exista. La construcción de imágenes puede requerir red.
La validación/aplicación posterior se ejecuta sin red dentro del contenedor.

Antes de escribir se comprueban ownership, metadata, cambios locales, colisiones,
symlinks, flags Git y el AGENTS final de hasta 100 líneas. El código local ajeno al
harness puede permanecer pendiente. Los cambios administrados recién aplicados deben
integrarse en Git por el usuario antes de volver a sincronizar.

## Migración desde 1.x

```bash
bash /ruta/al/bootstrap-harness.sh /ruta/al/proyecto --check --allow-major
bash /ruta/al/bootstrap-harness.sh /ruta/al/proyecto --allow-major
```

Revisar primero el plan: `--allow-major` acepta el cambio incompatible administrado.
Se retira metadata antigua solo con ownership comprobado. No se mueven docs, specs,
revisiones o reglas locales automáticamente. Si AGENTS excedería 100 líneas, preparar
su recableado como tarea separada sin truncar instrucciones. Preservar skills locales;
resolver nombres homónimos antes de aplicar.

## Recuperación

Una actualización interrumpida conserva journal local y snapshots. Después de
comprobar que terminó la operación propietaria, inspeccionar el lock y seguir el
diagnóstico. No retirar locks de procesos vivos ni de ownership desconocido.

```bash
bash .harness/update.sh --recover
```

La recuperación restaura exclusivamente los cambios de la operación cuando coinciden
con snapshots conocidos. Una edición posterior detiene la restauración; no utilizar
reset ni limpieza global para sortear esa protección.

Un archivo administrado ya guardado en Git que difiera del hash instalado también
detiene una actualización normal. Después de revisar y conservar su contenido útil,
`--repair` acepta reemplazar esa divergencia conocida; nunca elimina archivos ajenos
al inventario de ownership.

## Usar y validar

```bash
bash .harness/check.sh
bash .harness/check.sh --scope installation --json
bash .harness/work.sh status
bash .harness/work.sh create 20261028_ejemplo --title 'Resultado esperado' --owner coordinador
```

Los comandos del ciclo de vida y el formato de cierre están en
[work-lifecycle.md](docs/architecture/work-lifecycle.md).
Las extensiones de checks declaran imágenes con tag/digest, argv, scope, timeout,
aplicabilidad y evidencia en `.harness/project/config.json`. Se ejecutan en Docker
sin red, con fuente readonly; el runner no ejecuta código del producto en el host.

Añadir `.harness_work/runtime/` al `.gitignore` propio antes de operar. Esa ruta guarda
locks y journals locales; memoria compartida y expedientes se versionan según su
sensibilidad. No guardar secretos, transcripciones ni volcados de datos.

## Validar la fuente productora

```bash
docker build --target validation -t engineering-harness-validation:local .
docker run --rm --network none engineering-harness-validation:local
```

La instalación no crea commits/push, cambia ramas, despliega ni reactiva Actions.
Para probar una fuente local sin publicar, ejecutar el sincronizador desde esa imagen
con consumidor de prueba montado y `GITHUB_REPOSITORY`/`GITHUB_SHA` explícitos;
consultar [tooling](tooling/README.md).
