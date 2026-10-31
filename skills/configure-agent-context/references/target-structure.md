# Consumer context contract

## Grafo canónico

```text
AGENTS.md
├── .harness/core/policies/README.md
├── .harness/project/README.md          # reglas locales si existen
├── docs/README.md                 # solo si existe contenido
├── .harness_work/README.md             # continuidad y trabajo activo
├── .agents/skills/
└── .claude/skills/
```

`.harness_work/initiatives/` contiene trabajo/evidencia temporal,
no documentación vigente ni catálogos que deban enlazarse individualmente.

## Convenciones propias

- Producto nuevo o apps nuevas: descubrir `development/monorepo.md` y
  `configure-monorepo`; conservar layout legado hasta adopción autorizada y evitar
  confundir las apps con documentación o infraestructura de ambientes.
- `AGENTS.md` conserva invariantes, routing, precedencia y ownership; no contiene
  catálogos exhaustivos ni procedimientos de un dominio.
- Su límite de 100 líneas físicas se comprueba sobre el contenido final, antes de
  escribir. No truncar instrucciones locales ni moverlas como efecto del update.
- Para operar agentes desde un consumidor, el router debe descubrir `coordinate-work`
  y sus referencias distribuidas de setup/doctor, workflow y tareas individuales;
  para cierre, `close-initiative` y su referencia operativa. No dirigir el uso normal
  a manuales que sólo existan en el repositorio fuente del framework.
- Retomar trabajo carga memoria general y resumen de la iniciativa seleccionada;
  no obliga a cargar todos los expedientes o catálogos históricos.
- Cada router dirige por condición a una fuente canónica existente. Otro nivel se
  justifica solo si reduce ambigüedad o contexto; no crear cadenas ni carpetas vacías.
- Normas corporativas viven en Policies; Skills contienen sus contratos de trabajo;
  documentación de proyecto describe AS-IS y no duplica texto normativo.
- Preservar bloques generados y Skills corporativas sin editarlos como fuente.
  Cambios propios no pueden debilitar Policies silenciosamente.
- Registrar vigencia/autoridad cuando pueda confundirse; Git conserva la historia.

El modelo decide composición y formato de los routers dentro de este contrato;
no se exige una tabla o secuencia universal para recablearlos.
