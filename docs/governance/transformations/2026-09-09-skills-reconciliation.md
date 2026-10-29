# 2026-09-09 Skills reconciliation

Registro histórico de la reconciliación 1.x; sus rutas y cantidades describen esa
versión. El layout vigente está en [ADR-0013](../decisions/0013-project-harness.md),
los recorridos en [ADR-0017](../decisions/0017-proportional-delivery-tracks.md) y el
catálogo actual en [skills](../../../skills/README.md).

## Source and authority

Se revisó `/home/aloranca/skills` después de los commits `05a3f06` y `b9868c4`; el
mismo árbol quedó integrado posteriormente en su rama `main`. Ese repositorio se trata
como origen de propuestas e incubación. La fuente corporativa resultante vive
exclusivamente en este Engineering Framework y se distribuye mediante releases.

Esta transformación sustituye las conclusiones vigentes de
`installed-skills-refactoring.md` y `installed-skills-capability-audit.md` en los temas
que enumera. Los documentos anteriores permanecen como evidencia histórica.

La depuración se versiona como `1.0.1` porque, al realizarla, `1.0.0` no tenía tags ni
ejecuciones de `publish-framework.yml`; por tanto, ninguna instalación oficial había
distribuido la Skill retirada.

## Mapping

| Fuente revisada | Resultado corporativo |
| --- | --- |
| `spec-definir` | Adoptada en forma ligera; integra análisis proporcional y aclaraciones posteriores. |
| `spec-clarificar` | Retirada; no cambia trigger, autoridad ni salida respecto de `spec-definir`. |
| `spec-analizar` del framework | Retirada; su capacidad queda en `spec-definir`, `explorador-de-dominio` y `spec-documentar`. |
| `discover-business-process` | Retirada en 1.0.1; el discovery guiado pertenece a `explorador-de-dominio` y la documentación vigente a `spec-documentar`. |
| `spec-planear` | Adoptada con `plan.md` obligatorio y tareas o test plan sólo cuando aportan valor. |
| `spec-implementar` | Adoptada sin auditoría ni trazabilidad ceremonial automática. |
| `spec-documentar` | Adoptada con un `README.md` estable por módulo bajo `engineering/docs/`. |
| `branch-quality-review` | Reescrita para decidir entregabilidad por evidencia; conserva tres referencias condicionales. |
| `engineering-code-standards` | No se publica como Skill; sus criterios transversales únicos pasan a Policies y `implement-feature`. |
| `database-engineering-standards` | No se publica como Skill; Policies y Skills especializadas reciben UUIDv4, `RESTRICT` y SQL único por defecto. |
| `gitcommit` | Promovida después de retirar convenciones personales rígidas y mover obligaciones a Policies Git. |
| `pull-request-review` | No se promueve; `branch-quality-review` cubre PRs sin mantener dos revisiones generales. |

Skills personales o dependientes de herramientas y dominios específicos —consultoría,
Google Ads, `dbtool`, email transaccional y diseño web— no se incorporan al catálogo
corporativo.

## Content intentionally removed

- `engineering/architecture/` como destino nuevo de documentación vigente;
- `engineering/project/` como namespace intermedio;
- snapshots fechados de documentación canónica;
- `spec-analizar` y `spec-clarificar`;
- `discover-business-process` como reconstrucción AS-IS separada;
- plantillas obligatorias de specs, planes e implementación;
- presets repetidos y lanes automáticos de revisión;
- paquetes SQL con subcarpetas y archivos ceremoniales por defecto;
- Nano ID como fallback corporativo de UUIDv7; y
- referencias huérfanas o contradictorias de las Skills fuente.

## Resulting invariants

1. `engineering/docs/` describe AS-IS vigente; `engineering/specs/` define TO-BE y
   `engineering/quality-review/` conserva evidencia temporal.
2. Policies contienen obligaciones transversales; Skills contienen triggers,
   autoridad, workflow y salida.
3. Cada referencia de Skill es alcanzable y declara cuándo cargarla.
4. Un consumidor recibe 28 Skills desde una sola release para Codex y Claude.
5. Las copias personales homónimas deben desactivarse después de validar la release en
   un consumidor piloto; no forman parte de la publicación ni de este cambio local.
