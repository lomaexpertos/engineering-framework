# Distribución y actualización

## Fuente y canales

`VERSION` identifica el contrato distribuido. El canal público obtiene un snapshot
de `lomaexpertos/engineering-framework`, resuelve la referencia a SHA y ejecuta la
misma fuente que valida. `main` es la referencia predeterminada; una versión o SHA
pueden seleccionarse explícitamente. El trabajo cotidiano no consulta la fuente remota.

La actualización se inicia mediante `bash .harness/update.sh`; la instalación inicial
se describe en [INSTALL.md](../../INSTALL.md). El canal central sigue suspendido:
no hay publicación por push/Actions ni dispatch habilitado por esta arquitectura.

## Obtención y aplicación

1. Descargar a un directorio temporal separado y fijar el SHA obtenido.
2. Construir el target Docker `validation` de ese snapshot y validar su fuente.
3. Ejecutar preflight del consumidor desde la imagen, con origen y SHA explícitos.
4. Aplicar solo rutas administradas y verificar su contenido final.
5. Entregar el diff para integración según las reglas Git del proyecto.

El wrapper del host usa Bash, Git y Docker como infraestructura general. No instala
Node ni ejecuta código de la aplicación en el host. Los contenedores no reciben el
socket Docker, secretos remotos ni montajes generales del host.

Las opciones del actualizador son `--check`, `--ref`, `--allow-major` y `--recover`.
`--check` prepara el plan sin escrituras en el consumidor; `--allow-major` expresa
aceptación de un cambio incompatible después de revisar su migración. No se permiten
downgrades implícitos ni referencias de origen elegidas por contenido externo.

## Preflight y ownership

El sincronizador requiere raíz Git real, rama activa, procedencia y metadata coherentes.
Comprueba colisiones de skills, symlinks, marcadores, destinos ignorados y cambios
locales administrados, incluidos flags que puedan ocultar trabajo pendiente. El contenido
local ajeno a su scope se conserva y no se incluye en el diff de distribución.

El archivo AGENTS resultante se calcula antes de escribir y se rechaza si superaría
100 líneas. No se mueven reglas locales para satisfacer el límite silenciosamente.
La instalación no crea commits, push, PR, checkout ni cambios del índice.

Los hashes del manifest permiten detectar divergencias; HTTPS y el origen configurado
forman la frontera de confianza de obtención. Registrar un SHA no es autenticar por sí
solo al publicador. La metadata no contiene credenciales ni secretos.

## Interrupciones y recuperación

La aplicación no promete atomicidad multiarchivo. Mantiene snapshots previos y deseados
en un journal local antes de aplicar, usa exclusión con operaciones de trabajo y
revalida el contenido observado. Una edición concurrente impide continuar ciegamente.

`--recover` restaura cambios propios de una operación interrumpida cuando cada archivo
sigue coincidiendo con su versión previa o la aplicada. Si hubo edición posterior,
se detiene preservándola. No usa reset, limpieza global ni restauración de otros paths.
Un lock de propietario desconocido nunca se rompe automáticamente: hay que comprobar
que su proceso terminó antes de retirarlo para recuperar.

El snapshot temporal ejecuta la actualización de wrappers; no se depende de sobrescribir
un script que todavía deba continuar leyéndose para completar la operación.

## Idempotencia y migración

Sobre una instalación guardada en Git, aplicar el mismo snapshot no produce cambios.
Una instalación recién aplicada debe integrarse antes de volver a sincronizar, para
no confundir el diff propio pendiente con contenido descartable.

El salto 1.x a 2.x reemplaza contenido administrado antiguo por `.harness/core/` y
retira su metadata anterior solo dentro de esa operación revisable. Documentación y
expedientes heredados permanecen intactos hasta reconciliación autorizada aparte.
Las skills locales se preservan y una colisión se resuelve antes de escribir.

La publicación central conservada no está certificada para la nueva distribución ni
constituye una alternativa operativa mientras permanezca suspendida.
