# Operabilidad del harness

Objetivo: cerrar huecos de definición, uso y capacitación del agente en el harness instalado, sin depender del repositorio productor.

## Aceptación

- AGENTS y skills conducen a recursos distribuidos con comandos y entradas ejecutables.
- Configuración inicial, roles, iniciativa, workflow, preguntas, hallazgos, fallos/reanudación, cancelación y cierre tienen rutas explícitas.
- CLI descubre sus operaciones y rechaza errores de uso sin efectos parciales.
- Guías reflejan capacidades comprobadas; no enseñan a borrar locks ni inventar evidencia.
- Prueba consumidor fresco valida recursos, ejemplos y recorridos sólo desde contenido instalado.
- Auditoría independiente documenta alcance, hallazgos y correcciones; suite pertinente pasa.

## Ownership

operating_guides: referencias de skills y contratos de uso.
cli_usability: CLI y runtime de agentes, regresiones de uso.
consumer_audit: revisión independiente y test-agent-discovery.
coordinator: ciclo work/check/update, routing, esquemas, docs duraderas, integración y cierre.
