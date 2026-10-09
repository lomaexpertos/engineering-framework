# Pending decisions and work

Este archivo registra deliberadamente lo que no quedó resuelto durante la primera
transformación de los estándares de infraestructura. Un pendiente no constituye una
Policy vigente.

## Decisions required

Las decisiones de aplicabilidad originales quedaron aceptadas en
[`decisions/0004-infrastructure-policy-applicability.md`](decisions/0004-infrastructure-policy-applicability.md).
Permanecen por definir únicamente estos contratos de implementación:

| Decision | Why it matters | Recommended default |
| --- | --- | --- |
| Schema de metadata de Policies | Falta convertir la metadata aprobada en un contrato legible por herramientas. | Front matter mínimo con identificador estable, status, owners, versión de introducción y aplicabilidad. |
| Schema de excepciones | Ya se aprobaron sus datos mínimos, pero faltan formato, ubicación y reglas de aprobación verificables. | Un archivo estructurado por repositorio consumidor y JSON Schema compartido. |

## Enforcement to implement

- Schema y validador de `deployment.yaml`.
- Consistencia entre ciphertext, manifest cerrado y esquema sanitizado.
- Verificación SOPS sin revelar valores.
- Detección de secretos en Git, logs y artefactos.
- Validación de rutas, relaciones, documentación y enlaces del layout de infraestructura.
- Check de que entrypoints declarados proporcionen diagnóstico y validación.
- Metadata de checksums de integridad generada por el sincronizador para el contenido
  corporativo; la metadata de procedencia/versionado ya existe.

## Corporate content still missing

Los estándares fuente no alcanzan para publicar Policies completas de:

- infrastructure as code;
- containers;
- encryption general en tránsito y reposo;
- networking;
- access control;
- backups y restauración organizacional.

La plataforma central de recolección, almacenamiento y consulta de observabilidad
permanece deliberadamente fuera del repositorio aplicativo. El framework solo define
el contrato de emisión y la configuración de runtime que sí corresponde al consumidor.

## Distribution status

`INSTALL.md` define instalación y actualización asistidas desde el último snapshot
de `main`, con previsualización y reporte de documentación heredada.
`publish-framework.yml` conserva el canal central opcional mediante GitHub App.
Cada consumidor recibe únicamente este contenido bajo `engineering/corporate/`:

```text
engineering/corporate/
├── README.md
├── policies/
└── metadata/
```

Cada Skill se copia desde una sola fuente hacia `.agents/skills/` y
`.claude/skills/`. Los namespaces `engineering/docs/`, `engineering/specs/` y
`engineering/quality-review/` pertenecen al proyecto y no son administrados por el
sincronizador. `berhok-logistics` y `timbrado` permanecen registrados pero
deshabilitados en `projects.yml`. Sigue pendiente probar una instalación asistida
en un consumidor real; el canal central queda sin consumidores habilitados.

La arquitectura del workflow, configuración del bot, registro de consumidores y
documentación de gobierno permanecen exclusivamente en este repositorio.

Después del primer piloto exitoso deben desactivarse las copias personales homónimas
de Skills corporativas en los equipos adoptados. Codex no fusiona Skills de distinto
scope con el mismo nombre; mantener ambas activas introduce routing ambiguo y consume
el presupuesto de discovery.
