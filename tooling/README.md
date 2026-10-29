# Herramientas del harness

Para comprobar discovery con clientes CLI reales sin servicios externos, consultar
[compatibilidad de clientes](client-compatibility/README.md).

Las fuentes editables viven aquí. El harness usa Node.js 22 o 24 nativo, Bash y Git,
sin dependencias npm. Los consumidores reciben el runtime y wrappers Bash bajo
`.harness/`; su preflight diagnostica faltantes antes de mutar el consumidor y no
instala herramientas automáticamente. El producto conserva su ambiente Docker.

## Router por operación

| Operación | Fuente |
| --- | --- |
| Validar estructura, enlaces, políticas y discovery de la fuente | [validate-framework.mjs](validate-framework.mjs) |
| Ejecutar la suite nativa, con lint opcional | [run-validation.sh](run-validation.sh) |
| Sintaxis JS/Bash, ShellCheck, shfmt y patrones de credenciales | [lint-source.mjs](lint-source.mjs) |
| Planear/aplicar distribución administrada | [sync-consumer.mjs](sync-consumer.mjs) |
| Recuperar cambios propios de update interrumpido | [distribution-transaction.mjs](distribution-transaction.mjs) |
| Seleccionar discovery y adaptar skills locales | [harness-profiles.mjs](harness-profiles.mjs) |
| Comprobar instalación, contexto, docs y trabajo | [harness-check.mjs](harness-check.mjs) |
| Validar secretos y contratos de deployment | [harness-assurance.mjs](harness-assurance.mjs) y [guía instalada](../checks/assurance/README.md) |
| Instalar explícitamente herramientas con checksums fijados | [harness-tool-install.mjs](harness-tool-install.mjs) |
| Preparar runners y registrar resultados | [harness-runner-plan.mjs](harness-runner-plan.mjs) |
| Estado, transiciones, cierre, retención y purga | [harness-work.mjs](harness-work.mjs) |
| Recorridos y pisos por riesgo/requisitos del proyecto | [harness-tracks.mjs](harness-tracks.mjs) |
| Configuración personal, encargos, ejecución y entregas de agentes | [harness-agents.mjs](harness-agents.mjs) |
| Operar agentes desde un consumidor sin consultar fuentes | [Guías de coordinación](../skills/coordinate-work/SKILL.md) |
| Motor interno de guías (usar check.sh o validate-framework) | [harness-guide-check.mjs](harness-guide-check.mjs) |
| Probar rutas, recursos y ejemplos en instalación nueva | [test-agent-discovery.mjs](test-agent-discovery.mjs) |
| Primera adopción | [bootstrap-harness.sh](bootstrap-harness.sh) y [INSTALL.md](../INSTALL.md) |

## Distribución y recuperación

`sync-consumer.mjs --check <raiz-git>` devuelve plan JSON sin escribir. Aplicar requiere
origen `GITHUB_REPOSITORY=lomaexpertos/engineering-framework` y `GITHUB_SHA` completo del
snapshot. `--allow-major` expresa aceptación de migración incompatible; `--recover`
restaura la operación propia interrumpida si no hubo ediciones posteriores.
`--repair` acepta reparar una divergencia administrada revisada; nunca autoriza
reemplazar contenido sin ownership. Integridad del manifest usa
[harness-manifest.mjs](harness-manifest.mjs).

El preflight protege rama, HEAD, índice, trabajo local, symlinks, destinos ignorados,
colisiones y ownership. AGENTS completo debe caber en 100 líneas antes de escribir.
Los journals y locks viven bajo runtime local. No se rompen locks desconocidos, se
hace reset ni se migra documentación propia como efecto de actualizar el núcleo.

## Perfiles y extensiones

Sin `profiles` en config se conserva todo el discovery corporativo. Una lista explícita
incluye siempre core y los dominios elegidos: database, frontend, infrastructure o
security. El núcleo conserva todas sus fuentes; los perfiles seleccionan adaptadores,
no eliminan reglas de seguridad o documentación aplicables.

Las skills de `.harness/project/skills/<nombre>/` generan adaptadores `project-<nombre>`
para ambos clientes. La fuente se conserva, referencias incluidas; cambios y retiros
se integran en el plan administrado. Colisiones o presupuesto de discovery excedido
se resuelven antes de escribir. No sobrescribir skills locales ajenas al inventario.

Los checks del consumidor declaran imagen versionada, argv, scope, aplicabilidad,
severidad mediante `required`, timeout y evidencia esperada. El wrapper lanza Docker
sin socket montado y sin red, con repositorio de solo lectura, y entrega resultados
al runtime. El planner no ejecuta por sí solo los comandos del producto.

## Validación local reproducible

Los contratos de ejecución uniforme, perfiles personales y límites por proyecto se
explican en [ejecución de agentes](../docs/architecture/agent-execution.md). El wrapper
`agents.sh` no instala clientes ni guarda sus credenciales. Diagnóstico local,
ejecución real de CLI y evaluación del modelo son comprobaciones diferentes.

La validación estructural se ejecuta con `node tooling/validate-framework.mjs`.
`node tooling/lint-source.mjs` requiere ShellCheck y shfmt además de Node, Bash y
Git, exclusivamente para mantenimiento de esta fuente. Docker no es requisito para
operar el harness; Docker y GNU `timeout` sí lo son para checks declarados del producto.
`bash tooling/run-validation.sh` ejecuta la suite nativa sin exigir ShellCheck o shfmt;
`bash tooling/run-validation.sh --with-lint` incorpora esas comprobaciones.

El target opcional de validación reúne las herramientas de mantenimiento y la suite:

```bash
docker build --target validation -t engineering-harness-validation:local .
docker run --rm --network none engineering-harness-validation:local
```

La imagen declara Node, Bash, Git, ShellCheck y shfmt con versiones explícitas y usa
usuario no root. Ejecuta validador, lint y pruebas de distribución, publicación
simulada, trabajo, checks, runners, perfiles y piloto integrado. El piloto usa
consumidores de prueba: no certifica versiones reales de clientes ni despliega productos.

## Canal central suspendido

`resolve-projects.mjs`, `publish-projects.sh` y sus pruebas conservan el diseño del
canal central. No hay Actions por push ni publicación central activa. Ejecutar helpers
conservados no constituye un mecanismo autorizado de despliegue o actualización masiva.
