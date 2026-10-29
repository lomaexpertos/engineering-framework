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
│   ├── agents.sh                      # Opcional para delegar mediante el ejecutor
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
│       ├── state.json
│       ├── brief.md                   # Reforzado; otros solo si aportan continuidad
│       ├── resume.md                  # Reforzado; otros solo si se necesita
│       ├── spec.md                    # Solo si se solicita o necesita aprobación
│       ├── plan/                      # Solo si aporta planificación útil
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

El coordinador elige recorrido con la
[Policy de entrega proporcional](policies/ai-assisted-development/proportional-delivery.md).
Mínimo directo puede omitir `.harness_work/` y perfiles personales. Para un trabajador
mínimo o un cambio estándar, `work create --track minimal|standard --reason ...`
crea solo `state.json` en `active`; los demás artefactos aparecen si se necesitan.
Su cierre conserva `closure.json` compacto, sin ocho categorías ni `closure.md`.
Reforzado y expedientes heredados sin recorrido mantienen brief/resume, flujo
completo y cierre de ocho categorías. El árbol no exige crear spec, plan o docs.

Los wrappers ejecutan el runtime `.mjs` del harness con Node.js 22 o 24, Bash y Git
nativos, sin imagen propia ni dependencias npm. El helper `environment.sh` verifica
requisitos antes de mutar el consumidor; no instala herramientas. Los runners de
checks del producto conservan Docker y GNU `timeout` y sus dependencias declaradas.

Las rutas heredadas `engineering/` se conservan hasta una reconciliación autorizada.
El cambio de metadata administrada no autoriza trasladar documentación propia.
