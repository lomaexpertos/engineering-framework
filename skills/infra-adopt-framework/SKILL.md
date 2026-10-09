---
name: infra-adopt-framework
description: "Migra un repositorio legado al layout infra/deploy, consolidando ambientes, manifests, documentación y automatización. No usar para cambios aislados ni deployments."
---

# Infra Adopt Framework

Adoptar el layout corporativo de infraestructura mediante una migración explícita.

## Contrato de adopción

- Aplicar `infrastructure/repository-layout.md` y
  `ai-assisted-development/infrastructure-change-safety.md`.
- Antes de mover archivos, entregar matriz de rutas actual/destino, responsabilidades,
  referencias y clasificación, junto con alcance, fases, compatibilidad, validación,
  recuperación y aprobaciones necesarias. Evaluar o planear no autoriza ejecutar.
- Crear solo ambientes y capacidades reales bajo `infra/deploy/`. Conservar una única
  entrada documentada y los perfiles de runtime que correspondan al proyecto.
- Mantener las referencias de código, CI, manifests y documentación en la fase que
  cambia la ruta. Retirar heredados solo tras comprobar consumidores y compatibilidad.
- No desplegar, rotar credenciales, descifrar secretos ni modificar servicios externos.

## Resultado esperado

Adopción autorizada y trazabilidad entre matriz y cambios, validaciones, desviaciones
aceptadas y operaciones pendientes. El modelo decide cómo ejecutar las fases seguras.
