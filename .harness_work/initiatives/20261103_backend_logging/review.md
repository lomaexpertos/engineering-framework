# Revisión independiente

Revisor: infra_consistency, solo lectura. Resultado final: sin bloqueantes.

Hallazgo corregido: el doctor no puede exigir emisión/ingestión del backend antes
de su primer arranque. Ahora comprueba declaración, opciones, espacio e identidades;
configuración efectiva solo si ya existen contenedores. Aceptación posterior cubre
streams, JSON, correlación, filtrado y recepción autorizada en Alloy/Loki.

Revisó captura local, acceso por Docker sin leer archivos internos del driver,
entrega non-blocking con pérdidas posibles, dimensionamiento 50 MB/día por diez días,
capacidad más archivo activo y medición obligatoria de ventana efectiva. Confirmó
separación del Alloy del host, aplicaciones y Docker, y labels de baja cardinalidad.

Fuentes primarias consultadas: documentación Docker de driver local y delivery modes,
Grafana Alloy loki.source.docker y recomendaciones de labels Loki. Las referencias
se conservan en la Policy canónica. No se ejecutó producto, collector ni deployment.
