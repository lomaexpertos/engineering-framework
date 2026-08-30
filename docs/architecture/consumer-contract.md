# Consumer repository contract

Una instalación completa tendrá esta forma observable:

```text
project/
├── AGENTS.md
├── FRAMEWORK_VERSION
├── engineering/
│   ├── corporate/
│   │   ├── policies/
│   │   └── metadata/
│   │       └── manifest.json
│   └── project/
│       └── README.md
├── .agents/skills/
└── .claude/skills/
```

## Ownership

- `engineering/corporate/`, `.agents/skills/` corporativas y `.claude/skills/`
  corporativas son salidas administradas por el framework.
- `engineering/project/` es documentación local y nunca se reemplaza durante sync.
- `AGENTS.md` combina un router corporativo estable con routing local. La estrategia
  exacta de actualización se definirá antes de implementar el sincronizador para no
  sobrescribir instrucciones propias.
- `FRAMEWORK_VERSION` identifica exactamente la release aplicada.

Todo archivo corporativo distribuido debe declarar su procedencia mediante metadata
o encabezado generado, y quedar cubierto por `manifest.json`.
