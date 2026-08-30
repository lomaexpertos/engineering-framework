---
name: implement-deployment-automation
description: Crea o modifica automatización versionada de deployments productivos bajo infra/deploy/production, incluyendo deployment.yaml, scripts Bash, Docker Compose, runtime, health checks y recuperación. Usar cuando se pidan archivos deterministas que una persona o sistema autorizado ejecutará después. No usar para ejecutar deployments ni para migrar por completo un repositorio legado al framework de infraestructura.
---

# Implement Deployment Automation

Crear automatización operable, idempotente y auditable sin modificar ningún ambiente
externo.

## Límites

- Editar únicamente artefactos versionados dentro del repositorio.
- No ejecutar el entrypoint creado o modificado.
- No usar SSH, `docker compose up`, recargas, APIs cloud ni comandos privilegiados.
- Permitir solo validaciones locales sin efectos operativos y que no revelen secretos.
- Tratar una adopción estructural completa como trabajo de `infra-adopt-framework`,
  cuando esa Skill esté publicada, no como una modificación ordinaria de
  automatización.
- Tratar alta, rotación o retiro de secretos como trabajo de `manage-secrets`, cuando
  esa Skill esté publicada y esa sea la finalidad principal.

## Routing de contexto

1. Leer el `AGENTS.md` del repositorio y localizar las Policies corporativas instaladas.
2. Consultar el router de infraestructura y las Policies de manifest, automatización,
   estrategia, runtime, health checks y rollback.
3. Cargar la Policy de tráfico solo cuando exista `blue-green`, slots o cutover.
4. Cargar las Policies de secretos solo cuando se modifiquen contratos o consumo de
   secretos; nunca leer valores.
5. Cargar compatibilidad de base de datos cuando una unidad declare migraciones.
6. Leer [references/script-contract.md](references/script-contract.md) al crear o
   modificar entrypoints, librerías, escritura runtime o estructura productiva.
7. Leer [references/strategy-selection.md](references/strategy-selection.md) únicamente
   cuando se elija, cambie o complete una estrategia de deployment.

## Inspección obligatoria

Antes de editar:

1. identificar unidades, servicios, hosts lógicos y ciclos independientes;
2. inspeccionar `deployment.yaml`, README, scripts, Compose, configuración, contratos
   de secretos, health checks, edge, runtime y checks existentes;
3. localizar entrypoints heredados y todas sus referencias;
4. distinguir hechos observados de decisiones todavía ausentes; y
5. comprobar si el repositorio ya adoptó `infra/deploy/`.

Si falta el layout completo y el objetivo real es migrar el repositorio, detener esta
Skill y recomendar `infra-adopt-framework` cuando esté disponible. Mientras no lo
esté, reportar que la adopción sigue pendiente. No crear una segunda ruta de
deployment.

## Decisiones previas

Resolver antes de implementar:

- unidad y servicios afectados;
- estrategia por servicio;
- origen de versión o artefacto desplegable;
- health check representativo;
- `RUNTIME_DIR` y ownership;
- política de migraciones: `none`, `external` o `automated`;
- controlador de tráfico, si existe; y
- recuperación o rollback posible.

Cuando una API no tenga estrategia documentada, preguntar explícitamente si debe usar
`blue-green` o `recreate`. No inferir zero downtime por preferencia.

## Implementación

1. Actualizar primero el contrato declarativo en `deployment.yaml`.
2. Crear o modificar el entrypoint canónico en
   `infra/deploy/production/scripts/deploy.sh`.
3. Mantener la interfaz
   `deploy.sh <precheck|install|release|status|diagnose|rollback> <unidad> [versión]`.
4. Extraer código compartido a `scripts/lib/` sin convertirlo en entrypoint.
5. Crear helpers bajo `scripts/privileged/` solo cuando sean imprescindibles y tengan
   alcance mínimo.
6. Hacer que rutas, argumentos, unidad, versión, estrategia y `RUNTIME_DIR` fallen de
   forma temprana y explícita cuando sean inválidos.
7. Mantener `precheck`, `status` y `diagnose` sin cambios operativos.
8. Hacer `install`, `release` y `rollback` idempotentes o convergentes para una misma
   entrada válida.
9. Escribir estado, locks, temporales, respaldos y material sensible únicamente bajo
   `RUNTIME_DIR`; no usar `/tmp` ni otra ruta implícita.
10. Validar salud y exposición antes de publicar el nuevo estado como exitoso.
11. Actualizar README y runbooks con comandos reales, prerrequisitos, resultados
    esperados, recuperación y límites.

## Validación permitida

Ejecutar, cuando estén disponibles y sean seguras:

- revisión de sintaxis Bash con `bash -n`;
- ShellCheck;
- validación estructural de `deployment.yaml`;
- renderizado de Compose únicamente con fixtures sanitizados y sin iniciar servicios;
- pruebas unitarias de librerías con filesystem temporal contenido en el repositorio o
  en un `RUNTIME_DIR` de prueba; y
- verificaciones de rutas, permisos declarados, enlaces y consistencia documental.

No ejecutar como validación ningún subcomando de `deploy.sh` ni asumir que `precheck`
es seguro antes de inspeccionar su implementación.

## Cierre

Entregar:

- archivos creados o modificados;
- unidades y estrategias cubiertas;
- interfaz operativa resultante;
- validaciones ejecutadas y sus resultados;
- comandos deliberadamente no ejecutados; y
- decisiones, riesgos o dependencias que siguen pendientes.
