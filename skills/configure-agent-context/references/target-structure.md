# Target context structure

## Grafo mínimo de un consumidor

```text
AGENTS.md
├── engineering/corporate/policies/README.md
├── engineering/docs/index.md                 # cuando exista contenido
├── .agents/skills/
└── .claude/skills/
```

Los routers inferiores se agregan por dominio solo cuando exista contenido real.
`engineering/specs/` y `engineering/quality-review/` contienen artefactos de trabajo,
no sustituyen el router de documentación vigente.

## `AGENTS.md` raíz

Debe contener, en este orden aproximado:

1. propósito de router en una frase;
2. pocas invariantes universales;
3. routing hacia Policies, documentación del proyecto y Skills;
4. precedencia y mecanismo de conflicto; y
5. ownership de contenido generado cuando aporte claridad.

No debe contener checklists de implementación, documentación arquitectónica detallada,
catálogos completos de Policies/Skills ni instrucciones exclusivas de una tecnología.

## README de proyecto o dominio

Preferir una tabla compacta:

```markdown
| Si la tarea afecta... | Consultar |
| --- | --- |
| Arquitectura y límites | `architecture/README.md` |
| Deployment real | `deployment/README.md` |
| Datos y esquema | `database/README.md` |
```

Cada destino debe existir y explicar alcance, vigencia y siguiente nivel de routing.
No usar “leer todo” como estrategia normal.

## Documento hoja

Un documento final puede ser extenso si todo su contenido es relevante al mismo
trigger. Debe indicar:

- tema y alcance;
- si describe AS-IS, decisión, procedimiento o restricción local;
- owner o fuente de autoridad cuando no sea evidente;
- vigencia, versión o fecha cuando pueda caducar; y
- enlaces a fuentes relacionadas sin duplicarlas.

## Routers anidados

Crear otro nivel solo cuando reduzca contexto o ambigüedad. No crear un README por cada
carpeta vacía ni cadenas de índices que no aporten una decisión de routing.
