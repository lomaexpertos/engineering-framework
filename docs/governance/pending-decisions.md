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
- Metadata de integridad generada por el workflow para el contenido corporativo.

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

## Distribution work deferred

En esta transformación no se implementó el workflow central ni la GitHub App. Sigue
pendiente generar en cada consumidor únicamente:

```text
engineering/corporate/
├── README.md
├── policies/
└── metadata/
```

También permanece pendiente copiar cada Skill publicada desde una única fuente hacia
`.agents/skills/` y `.claude/skills/`. El contenido de `engineering/project/` queda
fuera del alcance actual por decisión explícita.

La arquitectura del workflow, configuración del bot, registro de consumidores y
documentación de gobierno permanecen exclusivamente en este repositorio.
