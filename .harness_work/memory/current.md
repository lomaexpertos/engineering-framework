# Contexto operativo

Sin trabajo de desarrollo activo ni trabajadores pendientes.
SOPS/age: identidad y entrega de valores tienen rutas privadas únicas; altas y
rotaciones siguen contrato dotenv. Fuente canónica y límites del check:
[SOPS](../../policies/security/sops-age.md), no procedimientos copiados por app.
Logging backend: stdout/stderr JSON y Docker local con rotación. Alloy/Loki son
contexto externo: ausencia/acceso/ingestión solo observación, nunca bloqueos ni
checks requeridos. Campos para endpoint/correlación sin labels de alta cardinalidad. Fuente:
[logging de contenedores](../../policies/infrastructure/container-logging.md).
Base inicial 0.1.0 sin publicar ni instalaciones; ver
[versionado](../../docs/governance/versioning.md). No incrementar por iteración del borrador.
La raíz productiva de archivos operativos está fijada; consultar
[invariantes](../../docs/invariants.md).
Actualizar el núcleo no autoriza trasladar estado productivo.
Preparación productiva: doctor propio obligatorio, con gate de arranque y cobertura
determinista según la Policy de infraestructura; el harness no ejecuta ese diagnóstico.
Modelo de apps monorepo disponible: apps poliglotas, releases independientes y
guías de CI/previews descubribles; instalar no migra apps ni activa workflows.
La separación de ownership está en [contrato consumidor](../../docs/architecture/consumer-contract.md).
Preparación unificada disponible: setup o check --setup, con resolución automática
desde caché privada del usuario y sin editar PATH ni herramientas personales.
Controles de secretos y contratos de infraestructura disponibles; operación y límites
en [assurance](../../docs/architecture/assurance.md). La adopción de consumidores sigue separada.
La auditoría de uso, base de datos e infraestructura corrigió contradicciones y la huella de entrega.
La huella distingue contenido, tipo y ejecutabilidad; trabajo abierto con huellas anteriores necesita revisión nueva.
El harness distingue investigación AS-IS del sistema actual de conversación de negocio/otros sistemas.
[Conocimiento de dominios](../../docs/architecture/domain-knowledge.md) conserva el contrato vigente.
Al modificar comportamiento, consultar y actualizar sólo la documentación afectada.
[Roadmap](../../docs/roadmap/README.md) y [pendientes](../../docs/roadmap/backlog.md) orientan trabajo nuevo.
