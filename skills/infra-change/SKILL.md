---
name: infra-change
description: "Modifica infraestructura ya adoptada: Compose, configuración, scripts, manifests, salud o recursos. No migra todo el layout, gestiona secretos ni despliega."
---

# Infra Change

Entregar un cambio de infraestructura adoptada sin ampliar su autoridad operativa.

## Convenciones y límites

- Consultar el router `infrastructure/`, su layout y las Policies del componente afectado.
  Conservar ambientes, rutas y entrypoints canónicos; no crear capacidades vacías.
- Una adopción completa usa `infra-adopt-framework`; automatización Bash del perfil
  de servidor fijo usa `implement-deployment-automation`; secretos usan `manage-secrets`.
  No aplicar esos workflows completos a una modificación que no los requiera.
- Modificar fuentes versionadas dentro del alcance. No desplegar, reiniciar,
  cambiar servicios externos ni leer valores de secretos.
- Mantener consistencia entre manifests, configuración, scripts y documentación
  cuando el contrato cambie; conservar la recuperación correspondiente.
- Validar en infraestructura aislada, sin alterar ambientes operativos.

## Resultado esperado

Validar manifests y contratos afectados con los scopes `deployment` y `secrets`
según `.harness/core/checks/assurance/README.md`; conservar gates operativos y
escaneo `security` aplicable. Esas comprobaciones no ejecutan deployments.

Cambio y evidencia, ambientes/unidades afectados y operaciones pendientes.
El modelo decide la técnica y el orden dentro de los contratos corporativos.
