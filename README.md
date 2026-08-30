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
- Vendoring automático mediante branch y Pull Request, nunca push directo a `main`.
- Una fuente de Skills distribuida a Codex y Claude Code.
- Las particularidades de producto permanecen en `engineering/project/`.

## Estado

El repositorio se encuentra en la fase **Foundation**. La estructura, contratos y
decisiones fundamentales están definidos, pero el catálogo normativo y operativo se
implementará por verticales revisables, no mediante placeholders que aparenten ser
instrucciones vigentes.

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

## Roadmap inmediato

1. Completar Foundation y validar su estructura.
2. Implementar el primer vertical: cuatro Policies y dos Skills reales.
3. Construir el artefacto de distribución y la automatización con GitHub App.
4. Incorporar manifest de integridad, comando de verificación y CI reutilizable.
