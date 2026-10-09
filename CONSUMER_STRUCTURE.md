# Estructura publicada en repositorios consumidores

Este documento muestra las carpetas que Engineering Framework administra al instalar
o publicar la versión `1.1.0` en un repositorio consumidor. Ambos canales utilizan
`tooling/sync-consumer.mjs`; la estructura no cambia respecto de `1.0.1`.
Para operar el canal asistido, consulta [`INSTALL.md`](INSTALL.md).

El contrato normativo y los límites de ownership permanecen en
[`docs/architecture/consumer-contract.md`](docs/architecture/consumer-contract.md) y
[`docs/architecture/distribution.md`](docs/architecture/distribution.md).

## Vista general

```text
<repositorio-consumidor>/
├── AGENTS.md
├── FRAMEWORK_VERSION
├── engineering/
│   └── corporate/
│       ├── README.md
│       ├── metadata/
│       │   └── installation.json
│       └── policies/
│           ├── README.md
│           ├── precedence.md
│           ├── ai-assisted-development/
│           ├── database/
│           ├── development/
│           ├── frontend/
│           ├── git/
│           ├── infrastructure/
│           │   ├── deployment/
│           │   └── environments/
│           └── security/
├── .agents/
│   └── skills/
│       └── <una carpeta por Skill>
└── .claude/
    └── skills/
        └── <la misma carpeta por Skill>
```

## Contenido administrado

- `AGENTS.md`: si no existe, se crea desde la plantilla corporativa. Si ya existe,
  sólo se agrega o reemplaza la región delimitada por
  `<!-- engineering-framework:start -->` y
  `<!-- engineering-framework:end -->`; el contenido propio fuera de esos marcadores
  se conserva.
- `FRAMEWORK_VERSION`: contiene únicamente la versión instalada, actualmente
  `1.1.0`.
- `engineering/corporate/README.md`: router de la copia corporativa instalada.
- `engineering/corporate/metadata/installation.json`: registra versión, repositorio y
  SHA fuente, además de la lista de Skills administradas.
- `engineering/corporate/policies/`: copia completa y reemplazable de las Policies.
- `.agents/skills/` y `.claude/skills/`: reciben dos copias idénticas del catálogo de
  Skills, incluidos sus archivos `SKILL.md` y referencias condicionales.

## Policies incluidas

- [`precedence`](policies/precedence.md)
- [`ai-assisted-development`](policies/ai-assisted-development/README.md)
- [`database`](policies/database/README.md)
- [`development`](policies/development/README.md)
- [`frontend`](policies/frontend/README.md)
- [`git`](policies/git/README.md)
- [`infrastructure`](policies/infrastructure/README.md), incluidos `deployment` y
  `environments`
- [`security`](policies/security/README.md)

## Skills incluidas

- [`add-observability`](skills/add-observability/SKILL.md)
- [`audit-agent-context`](skills/audit-agent-context/SKILL.md)
- [`branch-quality-review`](skills/branch-quality-review/SKILL.md)
- [`configure-agent-context`](skills/configure-agent-context/SKILL.md)
- [`data-integrity-review`](skills/data-integrity-review/SKILL.md)
- [`database-data-change`](skills/database-data-change/SKILL.md)
- [`database-routine-change`](skills/database-routine-change/SKILL.md)
- [`database-schema-change`](skills/database-schema-change/SKILL.md)
- [`debug-error`](skills/debug-error/SKILL.md)
- [`explorador-de-dominio`](skills/explorador-de-dominio/SKILL.md)
- [`gitcommit`](skills/gitcommit/SKILL.md)
- [`implement-critical-state-change`](skills/implement-critical-state-change/SKILL.md)
- [`implement-deployment-automation`](skills/implement-deployment-automation/SKILL.md)
- [`implement-distributed-integration`](skills/implement-distributed-integration/SKILL.md)
- [`implement-feature`](skills/implement-feature/SKILL.md)
- [`implement-ui-change`](skills/implement-ui-change/SKILL.md)
- [`infra-adopt-framework`](skills/infra-adopt-framework/SKILL.md)
- [`infra-change`](skills/infra-change/SKILL.md)
- [`investigate-production-incident`](skills/investigate-production-incident/SKILL.md)
- [`manage-secrets`](skills/manage-secrets/SKILL.md)
- [`optimize-database-query`](skills/optimize-database-query/SKILL.md)
- [`optimize-performance`](skills/optimize-performance/SKILL.md)
- [`research-best-practices`](skills/research-best-practices/SKILL.md)
- [`security-review`](skills/security-review/SKILL.md)
- [`spec-definir`](skills/spec-definir/SKILL.md)
- [`spec-documentar`](skills/spec-documentar/SKILL.md)
- [`spec-implementar`](skills/spec-implementar/SKILL.md)
- [`spec-planear`](skills/spec-planear/SKILL.md)

## Reemplazo, conservación y exclusiones

- `engineering/corporate/` queda exactamente como la fuente en cada sincronización;
  se escriben diferencias y se retiran archivos obsoletos.
- Las Skills previamente registradas como corporativas se reemplazan o retiran según
  el catálogo actual. Una Skill propia con otro nombre se conserva; una colisión con
  un nombre corporativo detiene la sincronización antes de sobrescribirla.
- El framework no crea ni administra `engineering/docs/`, `engineering/specs/` o
  `engineering/quality-review/`; esas rutas pertenecen a cada proyecto.
- No se copian `docs/`, `tooling/`, `checks/`, `.github/workflows/`, `projects.yml`,
  `templates/`, `INSTALL.md`, el `README.md` raíz ni las credenciales de este repositorio.
