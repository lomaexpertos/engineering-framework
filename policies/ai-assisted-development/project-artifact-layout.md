# Project artifact layout

## Purpose

Mantener separadas la documentación vigente, la definición de cambios y la evidencia
temporal producida durante el trabajo de ingeniería.

## Canonical layout

```text
engineering/
├── corporate/                         # contenido generado por el framework
├── docs/
│   ├── index.md
│   └── <modulo>/README.md
├── specs/<YYYYMMDD_nombre_descriptivo>/
└── quality-review/<YYYYMMDD_nombre_descriptivo>/
```

## Requirements

1. `engineering/corporate/` **MUST** contener únicamente contenido generado por el
   Engineering Framework y **MUST NOT** editarse como fuente en el consumidor.
2. `engineering/docs/` **MUST** ser la fuente canónica del comportamiento vigente del
   proyecto. Cada módulo **SHOULD** mantener un nombre estable en `snake_case` y un
   `README.md`; `index.md` debe actuar únicamente como router.
3. `engineering/specs/` **MUST** contener iniciativas y comportamiento futuro aprobado,
   no documentación presentada como estado vigente.
4. `engineering/quality-review/` **MUST** contener evidencia temporal de revisiones y
   **MUST NOT** convertirse en la fuente canónica del sistema.
5. Un expediente nuevo de spec o revisión **MUST** usar
   `YYYYMMDD_nombre_descriptivo`, con fecha de creación y `snake_case` ASCII. Una
   revisión relacionada con una spec **MUST** reutilizar su slug.
6. `engineering/architecture/` y `engineering/project/` **MUST NOT** crearse como
   rutas canónicas nuevas. Si un repositorio ya las utiliza, pueden leerse como
   evidencia, pero su migración requiere alcance explícito y no debe producir dos
   autoridades vigentes.
7. Artefactos ejecutables de aplicación, infraestructura o base de datos **MUST NOT**
   almacenarse bajo `engineering/`; este namespace conserva conocimiento y evidencia.
8. No deben crearse directorios ni documentos vacíos para representar capacidades que
   el proyecto todavía no utiliza.

Las reglas específicas para SQL literal pertenecen al dominio `database/`; las rutas
de infraestructura pertenecen a `infrastructure/repository-layout.md`.
