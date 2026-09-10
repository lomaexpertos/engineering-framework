# Production log output

Cargar esta referencia al cambiar configuración productiva, contenedores Docker o el
destino de logs de una aplicación.

Las Policies de logging aplicativo y de contenedores son la autoridad para streams,
driver, retención, datos y desacoplamiento. Esta referencia conserva sólo el workflow
de aplicación y verificación.

## Workflow

1. Inspeccionar logger, handlers, formato y diferencias por ambiente.
2. Inspeccionar Compose, scripts de deployment y defaults documentados del runtime.
3. Aplicar los contratos de salida y Docker definidos por las Policies vigentes.
4. Documentar únicamente las decisiones propias del proyecto, como formato, límites y
   tolerancia a backpressure.
5. Determinar qué contenedores deben recrearse para que la configuración efectiva
   cambie.

## Validation

- Generar al menos un evento informativo y uno de error, y comprobar ambos streams.
- Verificar driver y opciones efectivas del contenedor, no solo el YAML declarado.
- Confirmar rotación acotada y acceso mediante herramientas soportadas por Docker.
- Confirmar que la aplicación conserva el desacoplamiento exigido por la Policy.
