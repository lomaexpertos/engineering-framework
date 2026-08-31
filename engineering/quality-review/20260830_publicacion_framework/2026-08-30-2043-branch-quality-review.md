# Quality Review: publicación del Engineering Framework

## Metadata

- Fecha: 2026-08-30 20:43 America/Mexico_City
- Modalidad: dirigida
- Rama actual: `al-develop`
- Rama base y rango: no aplica; revisión del flujo de publicación vigente
- Commit HEAD: `3822979`
- Objetivo solicitado: validar exhaustivamente lógica, planeación, técnica y logging antes de la primera publicación
- Nivel de rigor: high-assurance
- Carpeta de reporte: `engineering/quality-review/20260830_publicacion_framework/`

## Contexto detectado

- Stack y versiones: GitHub Actions, Bash 5, Node.js sin dependencias, Git y GitHub CLI.
- Motor y persistencia: Git y GitHub como sistema de registro.
- Activos críticos: Policies, Skills, ramas y Pull Requests de todos los consumidores; credencial temporal de GitHub App.
- Invariantes identificadas: snapshot reproducible, allowlist de repositorios y rutas, no push a `main`, no downgrade, preservación de contenido local, idempotencia y trazabilidad.
- Entradas, escritores y consumidores relevantes: `projects.yml`, variables/secreto del repositorio, workflow manual, GitHub App y repositorios registrados.
- Integraciones y efectos externos: instalación token, clone/fetch/push, creación/edición de PR y auto-merge.

## Presets activados

| Preset | Motivo de activación | Alcance inspeccionado |
|---|---|---|
| `core-correctness` | Orquestación multi-etapa con efectos externos | Workflow, resolución, sincronización y publicación |
| `security-baseline` | Credencial de GitHub App y escrituras remotas | Permisos, token, rutas y logging |
| `testing-regression` | Primera ejecución sin evidencia integral | Validadores y pruebas locales |
| `supply-chain-deployment` | CI/CD y Actions ejecutables | Versiones de Actions, GitHub CLI y scripts |
| `async-distributed` | Publicación independiente a varios repositorios | Fallos parciales, reintentos e idempotencia |
| `files-and-uploads` | Copia y eliminación recursiva de árboles | Límites de ruta, symlinks y ownership |

## Matriz de cobertura

| Preset o dominio | Estado | Evidencia | Limitación |
|---|---|---|---|
| Corrección y reproducibilidad | hallazgo | `publish-framework.yml:26-30` usa `main`, pero el PR declara `GITHUB_SHA` | No se ejecutó un dispatch real |
| Seguridad de rutas | hallazgo | `sync-consumer.mjs:128-172` escribe bajo padres no validados contra symlinks | Runner efímero reduce, pero no elimina, el impacto |
| GitHub App y repositorios | hallazgo | No existe preflight antes de clone/push | No fue posible consultar repos privados con la sesión local expirada |
| Auto-merge y estrategia | hallazgo | Se solicita `--auto --squash` sin comprobar settings del consumidor | Settings remotos no verificables localmente |
| Idempotencia de PR | hallazgo | PR existente conserva body/source antiguos y PR nuevo se vuelve a buscar | API real no ejecutada |
| Operabilidad y logging | hallazgo | Logs lineales, sin etapa, resumen, anotación ni contexto de error | Logs reales no disponibles aún |
| Pruebas de sincronización | revisado-sin-hallazgos | `node tooling/test-distribution.mjs` cubre copia, retiro y colisión básica | No cubre symlinks ni marcadores inválidos |
| Pruebas del publicador | hallazgo | No existe prueba con Git/GitHub CLI simulados | Requiere harness local |
| Supply chain de Actions | hallazgo | Actions referenciadas por tags mutables | Las versiones seleccionadas sí existen |

## Resumen ejecutivo

- Decisión: entregable-con-reservas
- Riesgos principales corregidos: snapshot ambiguo, mutación parcial antes de detectar configuración incompatible, escritura por symlink, fallo opaco, lease implícito y falta de prueba del orquestador.
- Cobertura y confianza: alta para análisis estático; settings e instalación de la GitHub App no verificables con la sesión local disponible.

## Hallazgos bloqueantes

### B1. El snapshot publicado puede no corresponder a `GITHUB_SHA`

- Severidad: Alta
- Confianza: Alta
- Preset: `core-correctness`
- Evidencia: `.github/workflows/publish-framework.yml:26-30` resuelve `main` al ejecutar checkout, mientras `publish-projects.sh:130` registra el SHA del evento.
- Escenario de fallo o abuso: un push concurrente a `main` ocurre después del dispatch; se copian archivos del nuevo HEAD pero los PR declaran el SHA anterior.
- Impacto: se pierde reproducibilidad y auditoría exacta.
- Dirección de corrección: checkout del SHA inmutable del evento y verificación explícita del commit.
- Depende de: ninguna.

### B2. No hay preflight remoto antes de la primera mutación

- Severidad: Alta
- Confianza: Alta
- Preset: `async-distributed`, `supply-chain-deployment`
- Evidencia: `publish-projects.sh:58-108` clona, modifica y hace push antes de comprobar settings necesarios para auto-merge y antes de validar los demás consumidores.
- Escenario de fallo o abuso: el primer repositorio recibe branch/PR y el segundo falla por instalación, rama por defecto o merge settings incompatibles.
- Impacto: rollout parcial y diagnóstico tardío.
- Dirección de corrección: validar acceso, `main`, estado, permiso push, squash, auto-merge y eliminación automática de ramas para todos los consumidores antes de publicar alguno.
- Depende de: metadata de repositorios visible al token.

### B3. Padres symlink pueden redirigir escrituras fuera del checkout

- Severidad: Alta
- Confianza: Alta
- Preset: `files-and-uploads`, `security-baseline`
- Evidencia: `sync-consumer.mjs:128-172` valida límites lexicales, pero no rechaza symlinks en `engineering`, `.agents`, `.claude`, `AGENTS.md` o `FRAMEWORK_VERSION`.
- Escenario de fallo o abuso: un consumidor contiene `.agents/skills` como symlink y la sincronización escribe en su destino real.
- Impacto: modificación no autorizada en el runner, fallo impredecible o contaminación del artefacto.
- Dirección de corrección: rechazar symlinks en toda ruta administrada y en el árbol distribuible.
- Depende de: ninguna.

## Hallazgos no bloqueantes

### M1. El auto-merge depende de settings no declarados

- Severidad: Media
- Confianza: Alta
- Preset: `supply-chain-deployment`
- Evidencia: `publish-projects.sh:150-159` presupone auto-merge y squash; la eliminación diferida depende además de `delete_branch_on_merge`.
- Impacto: primer intento fallido o ramas residuales.
- Dirección de corrección: preflight explícito con mensaje accionable y documentación de prerrequisitos.
- Depende de: B2.

### M2. El PR no se actualiza completamente al reintentar

- Severidad: Media
- Confianza: Alta
- Preset: `core-correctness`
- Evidencia: `publish-projects.sh:110-143` reutiliza el PR, pero no actualiza título/body y vuelve a consultarlo tras crearlo.
- Impacto: procedencia obsoleta o fallo por visibilidad eventual del listado.
- Dirección de corrección: capturar la URL devuelta al crear y editar el PR existente de forma idempotente.
- Depende de: ninguna.

### M3. El fallo no deja un diagnóstico consolidado

- Severidad: Media
- Confianza: Alta
- Preset: `testing-regression`
- Evidencia: `publish-projects.sh` usa `set -e` sin trap contextual ni step summary.
- Impacto: el operador debe inferir repositorio y etapa desde salida parcial.
- Dirección de corrección: grupos, etapa actual, anotaciones `::error::`, resumen por repositorio y resumen final `always()`.
- Depende de: ninguna.

### M4. Las Actions usan referencias mutables

- Severidad: Media
- Confianza: Alta
- Preset: `supply-chain-deployment`
- Evidencia: `actions/checkout@v7.0.1` y `actions/create-github-app-token@v3.2.0`.
- Impacto: un tag movido cambiaría código ejecutado con acceso al secreto y a repositorios consumidores.
- Dirección de corrección: fijar SHA completo y conservar comentario de versión.
- Depende de: verificar SHA oficial de cada release.

### M5. No existe prueba integral del publicador

- Severidad: Media
- Confianza: Alta
- Preset: `testing-regression`
- Evidencia: `test-distribution.mjs` no ejecuta `publish-projects.sh`.
- Impacto: errores en comandos, argumentos, reintentos y resumen aparecen por primera vez en producción.
- Dirección de corrección: harness con repositorio Git temporal y `gh` simulado.
- Depende de: estabilizar el contrato del script.

## Preguntas y supuestos

- Se asume que ambos consumidores usan `main` como rama por defecto; el nuevo preflight debe verificarlo.
- Se asume que se desea exigir auto-merge y eliminación automática de ramas cuando `auto_merge: true`, sin ampliar permisos administrativos de la App.

## Validaciones ejecutadas

| Comando o revisión | Resultado | Evidencia |
|---|---|---|
| Lectura completa de workflow y scripts | pasó | Rutas y líneas citadas |
| Contraste con `create-github-app-token` oficial | pasó | Inputs, outputs, alcance y expiración confirmados |
| Contraste con manual oficial de `gh` | pasó | Flags de PR, auto-merge y branch deletion confirmados |
| `gh auth status` local | falló | Token local expirado; no se consultaron repositorios privados |
| `bash -n tooling/publish-projects.sh` | pasó | Sintaxis Bash válida |
| `node tooling/test-distribution.mjs` | pasó | Copia idéntica, preservación, retiro, colisiones, metadata, marcadores y symlinks |
| `node tooling/test-publication.mjs` | pasó | Preflight sin mutar, primera publicación, fallo diagnosticado y retry idempotente |
| `node tooling/validate-framework.mjs` | pasó | Estructura, routing, links, Actions fijadas y seguridad del árbol |
| `actionlint v1.7.12` | pasó | Ambos workflows sin errores de sintaxis, esquema o expresiones |
| Parse YAML independiente | pasó | Ambos workflows cargaron correctamente con PyYAML `BaseLoader` |
| `git diff --check` | pasó | Sin errores de whitespace |

## Plan de corrección ordenado

1. Fijar snapshot y Actions; validar configuración antes del token.
2. Incorporar preflight remoto completo antes de cualquier push.
3. Endurecer límites de filesystem y ampliar pruebas.
4. Hacer idempotente la gestión del PR y agregar logging/resumen.
5. Ejecutar harness integral, validadores, sintaxis y simulaciones de fallo.

## Revalidación posterior a correcciones

- B1 resuelto: checkout y metadata usan el SHA inmutable del dispatch.
- B2 y M1 resueltos: todos los consumidores pasan preflight antes del primer clone;
  se validan acceso, push, `main`, squash, auto-merge y eliminación de ramas.
- B3 resuelto: rutas administradas y fuentes distribuibles rechazan symlinks.
- M2 resuelto: el PR nuevo usa directamente su URL y el PR existente actualiza título
  y body; auto-merge queda ligado al SHA exacto del head.
- M3 resuelto: logs con timestamp, repositorio, etapa, grupos, anotaciones y Step
  Summary; una falla inesperada informa línea y comando.
- M4 resuelto: `checkout` y `create-github-app-token` quedaron fijadas a los SHA
  completos de sus releases verificadas.
- M5 resuelto: el harness encontró y permitió corregir un fallo adicional real en el
  retry. `--force-with-lease` ahora usa explícitamente el SHA remoto observado, en vez
  de depender de tracking implícito incompatible con el clone single-branch.

## Riesgos residuales y limitaciones

- La instalación real de la App, branch protection y los settings de los consumidores
  sólo pueden comprobarse con el installation token dentro del workflow; el preflight
  lo hará sin mutaciones y abortará toda la publicación si falta un prerrequisito.
- No se pudo verificar desde esta sesión si ambos consumidores ya habilitaron
  required checks, auto-merge y eliminación automática de head branches.
- No se realizará una publicación real durante esta revisión para evitar cambios externos antes de cerrar los hallazgos.
