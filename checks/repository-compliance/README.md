# Cumplimiento del consumidor

`bash .harness/check.sh` ejecuta el agregado local con Node.js 22 o 24 nativo, Bash y
Git, sin dependencias npm. Permite seleccionar un scope y salida JSON. El preflight
diagnostica requisitos faltantes antes de mutar el consumidor; no instala herramientas.

| Scope | Evidencia estructural |
| --- | --- |
| context | AGENTS, memoria acotada, enlaces/anclas y discovery. |
| documentation | Fuentes alcanzables e independencia de expedientes temporales. |
| installation | Manifest y hashes administrados. |
| work | Estado estructurado y retención de iniciativas. |
| extensions | Configuración y evidencia de checks declarados. |
| security | Gitleaks; archivos/índice y commits según modo y adopción. |
| deployment | Contrato de manifests, IDs, estrategias y referencias a archivos. |
| secrets | Allowlist dotenv, claves, placeholders, recipients y estado SOPS. |

Adopción, herramientas y límites: [controles de assurance](../assurance/README.md).

Los checks propios se declaran en `.harness/project/config.json`: ID, scope, required,
argv, runner, timeout, evidencia esperada y motivo de aplicabilidad. Cada runner usa
imagen con versión/digest explícitos. El wrapper monta solo el repositorio necesario,
sin escritura ni red, ejecuta argv sin eval y aplica timeout.
Docker y GNU `timeout` se requieren al ejecutar esos checks; los runtimes y
dependencias del producto permanecen dentro de sus imágenes.

El runtime asocia resultados a la configuración que los originó; un check requerido
sin ejecución o con fallo no se transforma en éxito. No se inventa evidencia porque
el contrato del comando sea válido. Las herramientas y dependencias del stack deben
estar declaradas en su imagen.

El agregado no sustituye revisión independiente de alto riesgo, observación visual
cuando se requiere, ni consolidación semántica del conocimiento antes del cierre.

Para configurar runners, capturar evidencia y extender discovery, consultar
[operación de checks y extensiones](operations.md).
