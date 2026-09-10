# Engineering Framework

Fuente única de verdad para las políticas, estándares, Skills y mecanismos de
cumplimiento de ingeniería compartidos por los repositorios de la organización.

El framework se versiona y se distribuye por release. Los repositorios consumidores
reciben una copia vendorizada mediante Pull Request, de modo que cada proyecto sea
autosuficiente, auditable y reproducible después de un `git pull`.

## Modelo conceptual

| Área | Pregunta que responde | Ubicación |
| --- | --- | --- |
| Router del agente | ¿Dónde encuentro lo aplicable? | `AGENTS.md` y READMEs intermedios |
| Policies | ¿Qué se exige, recomienda o permite? | `policies/` |
| Skills | ¿Cómo se ejecuta una clase de tarea? | `skills/` |
| Documentación | ¿Cómo es y se gobierna el framework? | `docs/` |
| Checks | ¿Qué puede verificarse automáticamente? | `checks/` |
| Tooling | ¿Cómo se construye y distribuye? | `tooling/` |

## Principios

- Progressive disclosure: los agentes cargan solo el contexto relevante.
- Separación entre normas, procedimientos, realidad documentada y enforcement.
- SemVer y versiones inmutables; nunca se consume `main` dinámicamente.
- Vendoring automatizado iniciado manualmente, mediante branch y Pull Request; nunca
  push directo a `main`.
- Los workflows centrales y una GitHub App realizan la distribución; los consumidores
  no instalan ni ejecutan herramientas del framework.
- Una fuente de Skills distribuida a Codex y Claude Code.
- Repositorios personales pueden incubar propuestas, pero no funcionan como una
  segunda fuente corporativa ni mantienen copias homónimas activas en consumidores.
- La documentación operativa del framework permanece en este repositorio y no se
  inyecta en consumidores.

## Estado

La fase **Foundation** está establecida. El framework contiene Policies segmentadas y
28 Skills corporativas con routing progresivo. El ciclo de specs, la revisión de ramas,
los contratos SQL y el layout de artefactos fueron reconciliados en la versión 1.0.0 y
depurados en la 1.0.1. La validación se ejecuta en `main` y la publicación manual puede
sincronizar consumidores mediante GitHub App. Hay dos consumidores registrados y
todavía falta ejecutar el primer Pull Request remoto.

## Mapa del repositorio

- [`AGENTS.md`](AGENTS.md): router compacto para agentes.
- [`policies/`](policies/README.md): catálogo normativo y routers por dominio.
- [`skills/`](skills/README.md): workflows reutilizables y su ciclo de vida.
- [`docs/architecture/`](docs/architecture/README.md): arquitectura y contratos.
- [`docs/governance/`](docs/governance/README.md): versionado, ownership y cambios.
- [`checks/`](checks/README.md): interfaces de validación y cumplimiento.
- [`tooling/`](tooling/README.md): construcción, sincronización y publicación.
- [`templates/project/`](templates/project/README.md): archivos administrados o
  sugeridos para repositorios consumidores.
- [`projects.yml`](projects.yml): registro de consumidores autorizados.
- [`CONSUMER_STRUCTURE.md`](CONSUMER_STRUCTURE.md): vista de carpetas y catálogos
  sincronizados en cada consumidor.

## Roadmap inmediato

1. Resolver metadata de Policies y el schema de excepciones.
2. Registrar un consumidor piloto y validar el Pull Request del bot.
3. Incorporar validaciones de integridad y CI reutilizable sin CLI consumidora.
4. Ampliar Policies y enforcement conforme aparezcan decisiones corporativas reales.
