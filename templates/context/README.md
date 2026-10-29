# Plantillas opcionales de contexto

Estas plantillas ayudan a crear una fuente solo cuando hay conocimiento real que
conservar. No se instalan como árbol completo ni autorizan migrar documentación.
El actualizador distribuye los recursos bajo el núcleo, pero no los aplica sobre
`docs/`, memoria o expedientes del consumidor.

Antes de usar una, localizar la fuente existente y actualizarla si ya es autoridad.
Conservar únicamente secciones útiles, reemplazar las preguntas por hechos confirmados
y enlazar el resultado desde su router. No publicar esta guía como estado del producto.

## Conocimiento duradero

| Necesidad | Recurso | Destino sugerido |
| --- | --- | --- |
| Elegir conocimiento por tarea | [docs/router.md](docs/router.md) | `docs/README.md` |
| Explicar propósito y lenguaje | [docs/product.md](docs/product.md) | `docs/product/README.md` |
| Arquitectura transversal | [docs/system.md](docs/system.md) | `docs/system/README.md` |
| Comportamiento de un dominio | [docs/domain.md](docs/domain.md) | `docs/domains/<dominio>/README.md` |
| Decisión con consecuencias duraderas | [docs/decision.md](docs/decision.md) | `docs/decisions/<id>.md` |
| Localizar invariantes | [docs/invariants.md](docs/invariants.md) | `docs/invariants.md` |
| Dirección y resultados futuros | [docs/roadmap.md](docs/roadmap.md) | `docs/roadmap/README.md` |
| Resultado de alto nivel | [docs/milestone.md](docs/milestone.md) | `docs/roadmap/milestones/<id>.md` |
| Pendientes de producto o capacidad | [docs/backlog.md](docs/backlog.md) | `docs/roadmap/backlog.md` |

No crear enlaces de conocimiento permanente a expedientes, tests aplicados, ramas
ni reportes necesarios para entender el sistema. Los ejemplos de destinos están en
código: solo convertirlos en enlaces cuando el archivo de destino exista.

## Continuidad y trabajo

| Necesidad | Recurso | Destino sugerido |
| --- | --- | --- |
| Encontrar trabajo activo | [work/router.md](work/router.md) | `.harness_work/README.md` |
| Resumir continuidad general | [work/memory.md](work/memory.md) | `.harness_work/memory/current.md` |
| Acotar una iniciativa | [work/brief.md](work/brief.md) | `brief.md` del expediente |
| Continuar sin reconstruir la conversación | [work/resume.md](work/resume.md) | `resume.md` del expediente |
| Delegar y recibir resultado | [work/handoff.md](work/handoff.md) | `agents/<task-id>/` del expediente |
| Preparar cierre reforzado | [work/closure.example.json](work/closure.example.json) | `closure.json` del expediente |

Crear identidad y estado con el runtime instalado, no copiando un estado ficticio.
La Policy [proportional-delivery.md](../../policies/ai-assisted-development/proportional-delivery.md)
decide el recorrido. Mínimo directo no necesita expediente ni estas plantillas.
Mínimo/estándar registrados comienzan con `state.json` solamente, sin brief/resume;
su ejemplo de cierre compacto está en la
[guía de cierre](../../skills/close-initiative/references/closure-and-retention.md).

El JSON de cierre reforzado está intencionalmente incompleto (`pending`): no es una instancia
válida hasta que un coordinador revise y sustituya cada categoría por `complete` o
`not_applicable`, con razón y fuentes pertinentes. No reemplazar todo por no aplicable
para conseguir aprobación. El schema instalado conserva la autoridad del formato.

Si un trabajo acotado necesita continuidad adicional, puede conservar brief y
punto de continuación juntos; no es un requisito para mínimo/estándar. No crear
una spec, plan, handoff o revisión separados sin una razón de alcance o riesgo.
