# Cumplimiento del consumidor

`bash .harness/check.sh` ejecuta el agregado local dentro de Docker. Permite seleccionar
un scope y salida JSON; el wrapper orquesta herramientas generales del host y no
utiliza runtimes del producto instalados globalmente.

| Scope | Evidencia estructural |
| --- | --- |
| context | AGENTS, memoria acotada, enlaces/anclas y discovery. |
| documentation | Fuentes alcanzables e independencia de expedientes temporales. |
| installation | Manifest y hashes administrados. |
| work | Estado estructurado y retención de iniciativas. |
| extensions | Configuración y evidencia de checks declarados. |

Los checks propios se declaran en `.harness/project/config.json`: ID, scope, required,
argv, runner, timeout, evidencia esperada y motivo de aplicabilidad. Cada runner usa
imagen con versión/digest explícitos. El wrapper monta solo el repositorio necesario,
sin escritura ni red, ejecuta argv sin eval y aplica timeout.

El runtime asocia resultados a la configuración que los originó; un check requerido
sin ejecución o con fallo no se transforma en éxito. No se inventa evidencia porque
el contrato del comando sea válido. Las herramientas y dependencias del stack deben
estar declaradas en su imagen.

El agregado no sustituye revisión independiente de alto riesgo, observación visual
cuando se requiere, ni consolidación semántica del conocimiento antes del cierre.
