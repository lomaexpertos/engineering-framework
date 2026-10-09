# Engineering Framework

Fuente única de verdad para las políticas, estándares, Skills y mecanismos de
cumplimiento de ingeniería compartidos por los repositorios de la organización.

El framework se versiona y los repositorios consumidores reciben una copia
vendorizada: instalación asistida por Codex en su rama actual o, opcionalmente,
publicación central mediante Pull Request. Cada copia registra su versión y SHA
fuente y es autosuficiente una vez integrada en Git.

Para instalar o actualizar un proyecto, pide a Codex que lea
[`INSTALL.md`](INSTALL.md) en `main` de este repositorio y siga sus instrucciones
desde el consumidor. Es el único punto de entrada operativo para ese canal.

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
- SemVer y snapshots fijados por SHA; `main` se resuelve al iniciar una instalación,
  no se consulta dinámicamente durante el trabajo cotidiano del consumidor.
- Un sincronizador común para ambos canales. La instalación asistida no cambia de
  rama ni hace commit/push; el canal central usa branches y Pull Requests.
- Tooling solo en la fuente: Codex lo ejecuta desde una imagen Docker temporal;
  no se instala ni se copia una CLI en los consumidores.
- Una fuente de Skills distribuida a Codex y Claude Code.
- Repositorios personales pueden incubar propuestas, pero no funcionan como una
  segunda fuente corporativa ni mantienen copias homónimas activas en consumidores.
- La documentación operativa del framework permanece en este repositorio y no se
  inyecta en consumidores.

## Estado

La fase **Foundation** está establecida. El framework contiene Policies segmentadas y
28 Skills corporativas con routing progresivo. El ciclo de specs, la revisión de ramas,
los contratos SQL y el layout de artefactos fueron reconciliados en la versión 1.0.0 y
depurados en la 1.0.1. La versión 1.1.0 añadió instalación y actualización asistidas.
Hay dos repositorios registrados y ninguno habilitado para publicación central;
el workflow queda disponible como canal alternativo. Falta validar la adopción
asistida en un proyecto real.

## Mapa del repositorio

- [`AGENTS.md`](AGENTS.md): router compacto para agentes.
- [`INSTALL.md`](INSTALL.md): instalación/actualización asistida y reporte de
  contexto heredado, sin migraciones automáticas.
- [`policies/`](policies/README.md): catálogo normativo y routers por dominio.
- [`skills/`](skills/README.md): workflows reutilizables y su ciclo de vida.
- [`docs/architecture/`](docs/architecture/README.md): arquitectura y contratos.
- [`docs/governance/`](docs/governance/README.md): versionado, ownership y cambios.
- [`checks/`](checks/README.md): interfaces de validación y cumplimiento.
- [`tooling/`](tooling/README.md): construcción, sincronización y publicación.
- [`templates/project/`](templates/project/README.md): archivos administrados o
  sugeridos para repositorios consumidores.
- [`projects.yml`](projects.yml): registro exclusivo del canal central opcional.
- [`CONSUMER_STRUCTURE.md`](CONSUMER_STRUCTURE.md): vista de carpetas y catálogos
  sincronizados en cada consumidor.

## Roadmap inmediato

1. Resolver metadata de Policies y el schema de excepciones.
2. Validar una instalación asistida piloto y decidir por separado su reconciliación
   de documentación heredada.
3. Incorporar validaciones de integridad y CI reutilizable sin CLI permanente en el
   consumidor.
4. Ampliar Policies y enforcement conforme aparezcan decisiones corporativas reales.
