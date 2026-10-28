# Estructura del consumidor

El contrato normativo está en
[consumer-contract.md](docs/architecture/consumer-contract.md).
La instalación y migración se explican en [INSTALL.md](INSTALL.md).

```text
proyecto/
├── AGENTS.md                         # Región administrada y reglas locales
├── CLAUDE.md                         # Importación compartida; preservar texto propio
├── .harness/
│   ├── README.md
│   ├── update.sh
│   ├── check.sh
│   ├── work.sh
│   ├── environment.sh                 # Preflight compartido de herramientas nativas
│   ├── core/                         # No editar como fuente
│   │   ├── policies/
│   │   ├── skills/
│   │   ├── checks/
│   │   ├── schemas/
│   │   ├── templates/
│   │   ├── runtime/
│   │   └── manifest.json
│   └── project/                      # Local; creado según necesidad
│       ├── README.md
│       ├── config.json
│       ├── policies/
│       ├── skills/
│       └── checks/
├── docs/                             # Local; no lo administra el updater
│   ├── README.md
│   ├── product/
│   ├── system/
│   ├── domains/<dominio>/
│   ├── decisions/
│   ├── invariants.md
│   └── roadmap/
├── .harness_work/                     # Local; se crea al trabajar
│   ├── README.md
│   ├── memory/current.md
│   ├── runtime/                       # Locks/journals; ignorar en Git
│   └── initiatives/<id>/
│       ├── brief.md
│       ├── state.json
│       ├── resume.md
│       ├── spec.md
│       ├── plan/
│       ├── agents/
│       ├── reviews/
│       ├── evidence/
│       └── closure.json
├── .agents/skills/<skill>/
└── .claude/skills/<skill>/
```

El árbol describe capacidades, no carpetas obligatorias. La instalación crea núcleo,
wrappers, adaptadores e instrucciones; no inventa documentación propia ni crea todo
el expediente para cada trabajo. Código, tests y artefactos operativos permanecen
en sus rutas productivas. El manifest registra ownership y hashes de archivos
administrados; no incluye contenido privado del proyecto.

Los wrappers ejecutan el runtime `.mjs` del harness con Node.js 22 o 24, Bash y Git
nativos, sin imagen propia ni dependencias npm. El helper `environment.sh` verifica
requisitos antes de mutar el consumidor; no instala herramientas. Los runners de
checks del producto conservan Docker y GNU `timeout` y sus dependencias declaradas.

Las rutas heredadas `engineering/` se conservan hasta una reconciliación autorizada.
El cambio de metadata administrada no autoriza trasladar documentación propia.
