---
name: configure-monorepo
description: Inicializa un producto bajo apps/, incorpora aplicaciones o adopta releases independientes y CI de monorepo; no migra un legado ni publica por instalar el harness.
---

# Configure Monorepo

Entregar un mapa de aplicaciones y contratos de construcción, validación y release
que el proyecto pueda operar sin depender del checkout productor del harness.

## Contrato

- Aplicar `.harness/core/policies/development/monorepo.md`,
  `.harness/core/policies/git/application-releases.md` y el recorrido proporcional.
  Una modificación interna pequeña no activa este workflow completo.
- Inspeccionar las apps, sus dependencias y automatización existentes. Para un
  producto nuevo, usar `apps/<app-id>/` desde la primera app; un legado conserva
  rutas/contratos hasta que el alcance autorice migrarlos. No generar scaffolding
  de aplicaciones que el usuario no pidió ni modificar bibliotecas por apariencia.
- Al crear apps, mapear raíces o adoptar un legado, consultar
  [estructura y archivos](references/application-layout.md).
- Al definir versionado, publicación o CI, consultar
  [releases y workflows](references/releases-and-workflows.md). Resolver con evidencia
  lo conocido; preguntar solo decisiones materiales pendientes de producto/equipo.
- Mantener docs canónicas y reglas propias en sus rutas vigentes. Ajustar routers
  con `configure-agent-context` sin copiar normas ni editar núcleo vendorizado.
- Declarar qué queda configurado y qué está pendiente de credenciales, infraestructura
  o activación. Crear workflows por solicitud no autoriza ejecutarlos ni otorgar
  permisos. No alterar el canal de publicación del propio harness.

## Resultado

Mapa descubrible de apps, límites y rutas reales; contrato de release y automatización
de las capacidades adoptadas; validación del alcance modificado y pendientes visibles.
Si la solicitud es solo análisis/documentación, entregar esos contratos sin aplicar
migraciones ni instalar tooling de producto.
