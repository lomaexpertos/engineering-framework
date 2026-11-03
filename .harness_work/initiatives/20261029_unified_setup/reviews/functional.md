# Revisión independiente funcional y de logging

Revisor: setup_docs. Alcance de solo lectura sobre check.sh --setup, resolución
de herramientas, setup Node, caché e instalador; única escritura de esta fase: este reporte.
El revisor no implementó estos componentes ejecutables.

## Veredicto

Sin bloqueantes pendientes en el código inspeccionado tras corregir permisos de caché.

- Flags desconocidos o repetidos se rechazan antes de preparar herramientas.
- La preparación de check.sh se envía a stderr y sus opciones se separan del argv
  entregado al validador; la salida JSON de checks no se contamina con progreso.
- Setup requiere solicitud explícita. Check normal, diagnóstico y update no
  descargan herramientas por efecto de resolver un requisito.
- Resolución directa de scanner/SOPS y wrappers utiliza herramientas preparadas
  sin exigir cambios manuales en PATH ni reemplazar ejecutables personales.
- Cache corrupta, symlinks, modos no ejecutables, versión inesperada o lock ajeno
  impiden acreditar éxito; errores externos no se imprimen como valores sensibles.

## Hallazgo corregido

La primera implementación Node verificaba binario contra receipt pero no ownership
ni permisos antes de ejecutarlo. Ahora environment verifica directorios administrados,
binario y receipt antes de consultar la versión. El runtime de Gitleaks/SOPS también
valida todos los ancestros: rechaza escrituras de grupo/otros y propietarios ajenos,
con excepción explícita de directorios sticky de root como /tmp. El destino privado
sigue requiriendo ownership del usuario y ausencia de escritura por terceros.

Estas correcciones resuelven las rutas observadas de sustitución de caché completa;
la comprobación de integridad y publicación exclusiva conserva sus controles.

## Observación menor y límites

Un scope semánticamente inválido puede rechazarse después de ejecutar setup: el
comando autoriza preparar el conjunto completo y puede necesitar Node para evaluar
el resto. El resultado final sigue siendo error; no se considera bloqueo ni se exige
una etapa nueva solo para ese caso.

No se repitieron suites. Las pruebas enfocadas y el end-to-end real corresponden a
sus autores/coordinador y deben constar como evidencia de ejecución por separado.
Esta revisión no certifica instalación en otras arquitecturas, permisos de sistemas
externos ni dependencias del producto.

## Revisión adicional de metadata de hashes

Se detectó un bypass en la primera normalización: parsear y reserializar JSON podía
eliminar una propiedad duplicada anterior que contuviera un token. El coordinador
añadió una igualdad exacta contra la representación canónica del productor antes
de normalizar. Esta guardia preserva crudos duplicados, escapes o formatos que no
se reproduzcan exactamente; por inspección resuelve la ruta de pérdida de contenido.

Además del schema válido, cada hash debe coincidir con el archivo de ese mismo
snapshot. Solo se representan como metadata esos valores probados: las claves y
demás campos siguen sometidos al scanner. Un error, archivo ausente o diferencia de
digest mantiene el documento original. La transformación opera únicamente sobre
copias temporales de stages dir; no altera el repositorio ni normaliza el historial.

La regresión añadida cubre source_commit duplicado, con token primero y SHA válido
después, y exige hallazgo sin devolver el token. El caso de propiedad desconocida
con token también se conserva. La Policy y la guía describen el criterio exacto,
sin introducir allowlist local ni autorizar omitir contenido histórico.

Sin bloqueantes de código pendientes en esta inspección. No se ejecutaron pruebas
adicionales desde el revisor; el end-to-end real del coordinador debe terminar con
éxito antes de acreditar la aceptación ejecutable de esta corrección.
