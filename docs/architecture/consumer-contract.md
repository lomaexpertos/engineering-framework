# Consumer repository contract

Una instalación completa tendrá esta forma observable:

```text
project/
├── AGENTS.md
├── FRAMEWORK_VERSION
├── engineering/
│   ├── corporate/                 # salida generada por el framework
│   │   ├── README.md
│   │   ├── policies/
│   │   └── metadata/
│   ├── docs/                      # propiedad del proyecto, opcional
│   ├── specs/                     # propiedad del proyecto, opcional
│   └── quality-review/            # propiedad del proyecto, opcional
├── .agents/skills/
└── .claude/skills/
```

## Ownership

- `engineering/corporate/`, `.agents/skills/` corporativas y `.claude/skills/`
  corporativas son salidas administradas por el sincronizador, independientemente
  del canal de distribución.
- `AGENTS.md` combina un router corporativo estable con routing local. El sincronizador
  solo podrá crearlo o actualizar una región corporativa delimitada; **MUST NOT**
  sobrescribir instrucciones propias.
- `FRAMEWORK_VERSION` identifica exactamente la release aplicada.
- `engineering/corporate/metadata/` queda reservado para procedencia e integridad
  generadas. `installation.json` conserva la versión y los nombres de Skills que el
  sincronizador puede reemplazar o retirar, además del repositorio y SHA fuente
  exactos; no requiere una CLI permanente en el consumidor.

La documentación propia del framework —arquitectura de distribución, configuración
del bot, registro de proyectos y gobierno— **MUST NOT** copiarse al consumidor.
El sincronizador **MUST NOT** crear, reemplazar ni retirar `engineering/docs/`,
`engineering/specs/` o `engineering/quality-review/`. Sus contratos de ubicación se
distribuyen como Policy, pero su contenido pertenece al proyecto.

La instalación asistida conserva rama, HEAD, índice y cambios fuera de su scope.
El contexto heredado puede inventariarse y recomendarse para reconciliación, pero
su migración o eliminación requiere una tarea autorizada aparte. Consulta
[`../../INSTALL.md`](../../INSTALL.md) para el procedimiento completo.
