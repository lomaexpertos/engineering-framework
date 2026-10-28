# Instalar y actualizar el harness

## Requisitos

Repositorio Git con rama activa, Bash, Git y Node.js 22 o 24 nativo. El harness usa
módulos estándar de Node, sin dependencias npm. Bootstrap y wrappers comprueban los
requisitos antes de mutar el consumidor; diagnostican faltantes sin instalar nada.
Docker y GNU `timeout` se requieren únicamente para ejecutar checks declarados por
el proyecto. Sus imágenes deben construirse desde Dockerfiles y declarar todas sus
dependencias. Los runtimes del producto permanecen dentro de sus imágenes.

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

El bootstrap obtiene `main` por defecto, o la referencia indicada con `--ref`, fija
su SHA y usa el actualizador del mismo snapshot. Esto permite seleccionar una
revisión nativa aunque la rama predeterminada todavía contenga una versión anterior.
No ejecutar una descarga mediante pipe al shell. La descarga inicial es una decisión
de confianza en el origen; los hashes posteriores detectan divergencias, no son firma.

## Actualizar una instalación

Desde el consumidor:

```bash
bash .harness/update.sh --check
bash .harness/update.sh
bash .harness/update.sh --ref v3.0.0 --check
```

Una llamada normal obtiene, valida y aplica una referencia fijada a SHA. `--check`
no escribe en el consumidor. `--ref` permite tag o SHA publicado; el tag de ejemplo
solo funciona cuando exista. La obtención requiere red; la validación y aplicación
usan Node nativo desde el snapshot fijado, sin construir una imagen del harness.

Antes de escribir se comprueban ownership, metadata, cambios locales, colisiones,
symlinks, flags Git y el AGENTS final de hasta 100 líneas. El código local ajeno al
harness puede permanecer pendiente. Los cambios administrados recién aplicados deben
integrarse en Git por el usuario antes de volver a sincronizar.

## Migración de versión mayor

Desde 1.x o 2.x, preparar Node.js 22 o 24 en el host y usar el bootstrap actualizado;
así la migración no depende del wrapper Docker de la instalación anterior. Revisar
y aceptar explícitamente el cambio de runtime requerido por 3.x:

```bash
bash /ruta/al/bootstrap-harness.sh /ruta/al/proyecto --check --allow-major
bash /ruta/al/bootstrap-harness.sh /ruta/al/proyecto --allow-major
```

En instalaciones ya nativas, `bash .harness/update.sh` conserva las mismas opciones.
El layout y las protecciones de ownership se conservan.

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

## Configuración de agentes por integrante

```bash
bash .harness/agents.sh setup
bash .harness/agents.sh doctor
```

El asistente crea perfiles personales fuera del repositorio en
`${XDG_CONFIG_HOME:-$HOME/.config}/harness/profiles.json`. Cada integrante elige sus
clientes/modelos y asigna roles. El proyecto puede añadir requisitos en
`.harness/project/agents.json`; las elecciones personales no los relajan. El setup
no instala clientes ni copia credenciales. La actualización del núcleo preserva
ambos archivos. Consultar [ejecución de agentes](docs/architecture/agent-execution.md)
para contratos, capacidades, permisos y límites del flujo coordinado.

## Validar la fuente productora

La validación estructural de la fuente puede ejecutarse con Node.js 22 o 24:

```bash
node tooling/validate-framework.mjs
```

El lint completo de mantenimiento requiere además ShellCheck y shfmt; estas
herramientas no son requisitos del consumidor. `bash tooling/run-validation.sh`
ejecuta la suite nativa; `bash tooling/run-validation.sh --with-lint` incluye ese lint.
Para ejecutar la suite en un ambiente reproducible opcional:

```bash
docker build --target validation -t engineering-harness-validation:local .
docker run --rm --network none engineering-harness-validation:local
```

La instalación no crea commits/push, cambia ramas, despliega ni reactiva Actions.
Para probar una fuente local sin publicar, ejecutar el sincronizador con Node.js 22 o 24
y un consumidor de prueba, con `GITHUB_REPOSITORY`/`GITHUB_SHA` explícitos;
consultar [tooling](tooling/README.md).
