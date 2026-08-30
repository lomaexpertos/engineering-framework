# Consumer repository contract

Una instalación completa tendrá esta forma observable:

```text
project/
├── AGENTS.md
├── FRAMEWORK_VERSION
├── engineering/
│   └── corporate/
│       ├── README.md
│       ├── policies/
│       └── metadata/
├── .agents/skills/
└── .claude/skills/
```

## Ownership

- `engineering/corporate/`, `.agents/skills/` corporativas y `.claude/skills/`
  corporativas son salidas administradas por el bot.
- `AGENTS.md` combina un router corporativo estable con routing local. El workflow
  solo podrá crearlo o actualizar una región corporativa delimitada; **MUST NOT**
  sobrescribir instrucciones propias.
- `FRAMEWORK_VERSION` identifica exactamente la release aplicada.
- `engineering/corporate/metadata/` queda reservado para procedencia e integridad
  generadas cuando exista el check correspondiente; no requiere una CLI consumidora.

La documentación propia del framework —arquitectura de distribución, configuración
del bot, registro de proyectos y gobierno— **MUST NOT** copiarse al consumidor.
`engineering/project/` queda fuera del alcance de esta fase.
