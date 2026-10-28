# Runtime nativo del harness

Solicitud aprobada: ejecutar herramientas transversales del harness con Node nativo,
mantener Docker para aplicaciones y runners declarados, hacer commits y push.

## Alcance y aceptación

- Check integrado, work, update y bootstrap funcionan sin Docker ni dependencias npm.
- Node 22/24, Bash y Git se comprueban antes de mutar; no se instala software automáticamente.
- Docker y GNU timeout se exigen únicamente si hay runners de aplicación seleccionados.
- Se preservan SHA fijado, ownership, hashes, locks, recuperación y argumentos literales.
- Suite nativa Node 24 y regresión Node 22 aprobadas; runner real conserva aislamiento.
- Documentación/Policy, metadatos y migración reflejan el contrato MAJOR 3.0.0.

Fuera de alcance: ejecutar productos en host, instalar dependencias de aplicaciones,
modificar consumidores reales, merge/publicación de release o habilitar CI.

## Decisiones

Se reutiliza Node 24.18.0 ya disponible; Node 22 sigue soportado y verificado. El
helper compartido se distribuye como archivo administrado. El Dockerfile del runtime
consumidor se retira por ownership; la imagen de validación del productor es opcional.
Bootstrap resuelve la referencia seleccionada antes de descargar y fija su SHA.
