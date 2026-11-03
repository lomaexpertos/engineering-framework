# Operar checks y extensiones

Desde la raíz del consumidor, `bash .harness/check.sh --help` descubre los comandos.
Para una comprobación estructural sin runners del producto:

```bash
bash .harness/check.sh --scope context
bash .harness/check.sh --scope documentation
bash .harness/check.sh --scope installation
bash .harness/check.sh --scope work
```

Sin `--scope` también se ejecutan los checks del proyecto configurados. `--json`
estructura stdout; los logs de runners se escriben en stderr. Salida 0 significa
aprobado, 1 incumplimiento y 2 error de configuración/ejecución. Leer el resultado
antes de avanzar; no omitir un scope requerido para convertir una falla en éxito.

## Declarar comprobaciones propias

El contrato es [project-config.schema.json](../../schemas/project-config.schema.json).
`.harness/project/config.json` pertenece al proyecto. Un ejemplo a adaptar:

```json
{
  "schema_version": 1,
  "profiles": ["core"],
  "runners": {"project-tests": {"image": "example-project-tests:1.0.0"}},
  "checks": [{
    "id": "product-tests",
    "scope": "quality",
    "required": true,
    "argv": ["/usr/local/bin/run-project-tests"],
    "runner": "project-tests",
    "timeout_seconds": 300,
    "evidence": "Salida de la suite con casos ejecutados y resultado",
    "applicability": "El cambio afecta comportamiento cubierto por la suite"
  }]
}
```

La imagen y el comando son placeholders; reemplazarlos por los del proyecto y
construir su imagen con dependencias declaradas antes de ejecutar. El harness no
construye imágenes ni instala runtimes de la aplicación. Se requieren Docker y
GNU `timeout` para runners. No usar `latest`; preferir digest cuando corresponda.

```bash
bash .harness/check.sh --scope quality --json
```

El runner recibe `/workspace` de solo lectura, sin red, con UID/GID del operador.
Dependencias y servicios deben estar preparados conforme a la política del proyecto;
no conceder escritura, socket Docker o red como solución implícita. Si la prueba
requiere otro entorno autorizado, ejecutarla allí y conservar su evidencia real.
`argv` se ejecuta literalmente: redirecciones, `$VARIABLE` y `&&` no son shell.
Usar un entrypoint propio en la imagen cuando el proyecto necesite un script.

`evidence` describe la evidencia esperada; no crea un archivo ni acredita contenido.
El agregado comprueba códigos de salida asociados a la configuración ejecutada.
El coordinador contrasta cobertura y resultados con los criterios de aceptación.
Los logs temporales del wrapper se eliminan al terminar. Para continuidad, guardar
stdout y stderr en archivos del expediente, conservando el código de salida original;
no interpretar el éxito de `tee` como éxito del check. Nunca guardar secretos.

## Perfiles y extensiones del proyecto

`profiles` selecciona discovery: core siempre está incluido; database, frontend,
infrastructure y security agregan sus skills. No modifica permisos ni elimina las
políticas del núcleo. Después de cambiar discovery, ejecutar una actualización
revisada para regenerar adaptadores; editar sólo la fuente local.

Las skills propias viven en `.harness/project/skills/<nombre>/SKILL.md`, con
`name`, `description` y referencias relativas dentro de su directorio. La actualización
las publica como `project-<nombre>` para Codex y Claude. Una policy local se enlaza
desde `.harness/project/README.md`; aplica la precedencia del router y no debilita
políticas corporativas. Ver [precedencia](../../policies/precedence.md).

Fallos de hashes/ownership se investigan en la instalación; nunca corregirlos
editando el núcleo generado. La operación de actualización se descubre en
`bash .harness/update.sh --help` y en `.harness/README.md` del consumidor.
