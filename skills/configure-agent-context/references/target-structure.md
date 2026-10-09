# Consumer context contract

## Grafo canónico

```text
AGENTS.md
├── engineering/corporate/policies/README.md
├── engineering/docs/index.md                 # solo si existe contenido
├── .agents/skills/
└── .claude/skills/
```

`engineering/specs/` y `engineering/quality-review/` son trabajo/evidencia temporal,
no documentación vigente ni catálogos que deban enlazarse individualmente.

## Convenciones propias

- `AGENTS.md` conserva invariantes, routing, precedencia y ownership; no contiene
  catálogos exhaustivos ni procedimientos de un dominio.
- Cada router dirige por condición a una fuente canónica existente. Otro nivel se
  justifica solo si reduce ambigüedad o contexto; no crear cadenas ni carpetas vacías.
- Normas corporativas viven en Policies; Skills contienen sus contratos de trabajo;
  documentación de proyecto describe AS-IS y no duplica texto normativo.
- Preservar bloques generados y Skills corporativas sin editarlos como fuente.
  Cambios propios no pueden debilitar Policies silenciosamente.
- Registrar vigencia/autoridad cuando pueda confundirse; Git conserva la historia.

El modelo decide composición y formato de los routers dentro de este contrato;
no se exige una tabla o secuencia universal para recablearlos.
