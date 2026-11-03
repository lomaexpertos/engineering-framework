---
name: implement-deployment-automation
description: Crea automatización Bash bajo infra/deploy/production para backends, APIs o servicios desplegados en servidores fijos administrados por el repositorio. No aplica a desktop, mobile, frontends cliente ni plataformas sin ese modelo de deployment.
---

# Implement Deployment Automation

Entregar automatización Bash del perfil corporativo sin ejecutar el deployment.

## Aplicabilidad y contexto

Solo para backends, APIs o servicios en servidores fijos cuyo deployment administra
el repositorio y cuyo entrypoint es Bash. No crear `deploy.sh` para desktop, mobile,
frontends cliente ni plataformas con otro modelo operativo.

Consultar `infrastructure/repository-layout.md`, `deployment/manifest.md`,
`deployment/automation.md`, `runtime-state.md`, `health-checks.md` y `deployment/rollback.md`
desde el router. Estrategia/tráfico, secretos y compatibilidad SQL se cargan únicamente
cuando la decisión o el cambio los afecte.
Para prechecks y primer arranque, cargar `infrastructure/deployment/doctor.md`:
doctor ejecutable propio del proyecto, catálogo exhaustivo/determinista y salida
accionable con gate obligatorio; no copiar los checks ilustrativos como catálogo real.
Para backends Docker, incluir en prechecks el contrato de
`infrastructure/container-logging.md` sin instalar Alloy ni modificar el host.
Alloy/Loki nunca son requisitos bloqueantes: cualquier diagnóstico sobre su ausencia,
acceso o ingestión es solo observación y no cambia el código de salida a fallo.
Al materializar secretos, leer `security/sops-age.md`, `sops-private-material.md` y
`encrypted-environment-contract.md`; la identidad vive en el home del usuario
operativo, mientras los dotenv se publican bajo RUNTIME_DIR, sin llegar a la imagen.

## Contrato propio

- Conservar `infra/deploy/production/scripts/deploy.sh`, su interfaz pública
  `deploy.sh <precheck|install|release|status|diagnose|rollback> <unidad> [versión]`
  y la correspondencia con `deployment.yaml`.
- Usar `scripts/lib/` para módulos y `scripts/privileged/` solo para helpers cerrados.
  Estado, locks, temporales y material sensible viven en
  `RUNTIME_DIR=/home/appmanager/<project>-runtime`, según `runtime-state.md`.
  No aceptar `<project>-production/runtime`, derivaciones de HOME/checkout ni
  overrides; comprobar la raíz y confinamiento antes de escribir. Si el legado
  difiere, reportar desviación y migración pendiente, sin moverlo automáticamente.
- Confirmar unidad, artefacto, estrategia, salud, migraciones, runtime y recuperación;
  no inferir zero downtime ni una estrategia ausente. Una API sin estrategia
  documentada requiere la decisión responsable entre `blue-green` y `recreate`
  cuando ambas sean aplicables.
- Si el objetivo es migrar todo el layout, usar `infra-adopt-framework`;
  no mantener una segunda ruta operativa.
- No ejecutar ningún subcomando de `deploy.sh`, SSH, recargas, APIs cloud,
  `docker compose up` ni comandos privilegiados como validación.

## Resultado y validación

Scripts, manifest y documentación consistentes con las Policies. El modelo elige
la implementación; validar sintaxis, estructura y librerías en un entorno aislado,
con fixtures sanitizados y sin efectos operativos ni secretos.
Reportar unidad/estrategia, interfaz, evidencias, comandos no ejecutados y pendientes.
