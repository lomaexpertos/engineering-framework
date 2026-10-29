# Contrato del repositorio consumidor

## Estructura y autoridad

```text
project/
├── AGENTS.md
├── CLAUDE.md                     # Importación mínima si no existía
├── .harness/
│   ├── README.md
│   ├── update.sh
│   ├── check.sh
│   ├── setup.sh                  # Preparación explícita y diagnóstico
│   ├── work.sh
│   ├── agents.sh                 # Ejecutor con perfiles personales
│   ├── environment.sh            # Preflight nativo compartido
│   ├── core/                    # Contenido administrado
│   │   ├── policies/
│   │   ├── skills/
│   │   ├── checks/
│   │   ├── schemas/
│   │   ├── templates/
│   │   ├── runtime/
│   │   └── manifest.json
│   └── project/                 # Extensiones propias, opcionales
├── docs/                        # Conocimiento permanente propio
├── .harness_work/               # Continuidad y evidencia propia
├── .agents/skills/              # Adaptación Codex
└── .claude/skills/              # Adaptación Claude Code
```

Se crean capacidades según contenido y necesidad; no es obligatorio llenar este árbol.
Las reglas normativas están en
[project-artifact-layout.md](../../policies/ai-assisted-development/project-artifact-layout.md).

## Límites de escritura

El sincronizador administra `.harness/core/`, wrappers, router del harness y copias
corporativas de skills. `AGENTS.md` preserva texto propio fuera de marcadores; su
resultado completo debe caber en 100 líneas antes de la primera escritura. Un archivo
excesivo requiere recableado explícito, nunca truncado automático.

`CLAUDE.md` incorpora una importación `@AGENTS.md` y conserva el texto propio de un
archivo existente. La presencia de ese adaptador no certifica capacidades de un cliente
ni elimina la necesidad de comprobar su discovery real.

`manifest.json` es autoridad de versión, origen, SHA, skills administradas y hashes.
Sus hashes cubren contenido distribuido, excluyendo el propio manifest y los archivos
mixtos de instrucciones raíz. No son una firma del publicador.

`.harness/project/`, `docs/` y la continuidad del proyecto pertenecen al consumidor.
El actualizador no los crea, reescribe o elimina como efecto de cambiar la metodología.
Los archivos operativos de runtime son locales y deben ignorarse en Git.

El conocimiento de módulos se descubre desde el router propio de `docs/` y mantiene
una jerarquía según su tamaño. La investigación AS-IS usa la Policy y Skill instaladas;
no requiere consultar este repositorio productor. Su realización y límites están en
[conocimiento de dominios](domain-knowledge.md).

Los requisitos de agentes del equipo viven en `.harness/project/agents.json` y los
perfiles personales fuera del repositorio. Sus contratos y separación de autoridad
se explican en [ejecución de agentes](agent-execution.md). La distribución no crea
perfiles personales ni reemplaza elecciones de proveedores/modelos.

Código, pruebas, SQL, assets e infraestructura ejecutable permanecen en las rutas
productivas de cada proyecto; no se trasladan a expedientes descartables.

## Evolución y contenido heredado

Una instalación 1.x se reconoce por `FRAMEWORK_VERSION` y metadata corporativa antigua.
El salto MAJOR requiere aceptación explícita. Su migración administrada no implica
mover documentación propia, specs ni revisiones históricas. Si ya existe `docs/`, se
reconcilia en una tarea separada sin crear una segunda autoridad paralela.

La documentación del productor, configuración de publicación central y registro de
proyectos no se copian al consumidor. La metodología sí se distribuye con su runtime,
lo que permite seguir trabajando offline con Node.js 22 o 24, Bash y Git. Los checks del
producto necesitan además sus imágenes Docker disponibles y GNU `timeout`.
