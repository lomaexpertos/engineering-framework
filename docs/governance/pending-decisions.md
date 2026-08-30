# Pending decisions and work

Este archivo registra deliberadamente lo que no quedó resuelto durante la primera
transformación de los estándares de infraestructura. Un pendiente no constituye una
Policy vigente.

## Decisions required

| Decision | Why it matters | Recommended default |
| --- | --- | --- |
| Alcance de SOPS + age | Debe definirse si es el único mecanismo permitido o un perfil aprobado entre varios. | Mantenerlo obligatorio solo para secretos productivos versionados como archivos. |
| Layout `infra/deploy/` | Puede ser universal para servicios desplegables pero innecesario para librerías o repositorios sin runtime. | Aplicarlo condicionalmente a repositorios que administren deployments. |
| Paths de Compose | Falta decidir si `compose/core.yml` y `compose/standalone/` son contrato corporativo o convención de un perfil Docker Compose. | Tratarlos como perfil condicional, no como regla universal. |
| Uso del sufijo `.example` | El estándar fuente lo prohíbe para datos operativos, pero muchos proyectos pueden usarlo legítimamente como contrato consumidor. | Prohibirlo solo cuando el archivo pretenda representar configuración operativa real. |
| Metadata de Policies | Faltan identificador estable, status, owners, versión de introducción y aplicabilidad legible por herramientas. | Diseñar un front matter mínimo antes de la primera release estable. |
| Excepciones | La Policy de precedencia define datos mínimos, pero falta formato, ubicación y aprobación corporativa ejecutable. | Definir schema y check antes de habilitar excepciones automatizadas. |

## Content to move into Skills

El contenido fuente siguiente es procedimental y **MUST NOT** duplicarse dentro de
Policies:

- `infrastructure-change`: evaluar, generar, adoptar y migrar infraestructura con plan
  aprobado;
- `deployment`: ejecutar prechecks, despliegue, validación, cutover y recuperación;
- `manage-secrets`: alta, rotación, renombre, eliminación y cambio de recipients.

Estas Skills todavía no están implementadas.

## Enforcement to implement

- Schema y validador de `deployment.yaml`.
- Consistencia entre ciphertext, manifest cerrado y esquema sanitizado.
- Verificación SOPS sin revelar valores.
- Detección de secretos en Git, logs y artefactos.
- Validación de rutas, relaciones, documentación y enlaces del layout de infraestructura.
- Check de que entrypoints declarados proporcionen diagnóstico y validación.
- Manifest de integridad para el contenido distribuido en `engineering/corporate/`.

## Corporate content still missing

Los estándares fuente no alcanzan para publicar Policies completas de:

- infrastructure as code;
- containers;
- observability más allá de health checks;
- encryption general en tránsito y reposo;
- networking;
- access control;
- backups y restauración organizacional.

## Distribution work deferred

En esta transformación no se implementó el builder ni el bot. Sigue pendiente generar
en cada consumidor únicamente:

```text
engineering/corporate/
├── README.md
├── policies/
└── metadata/
```

También permanece pendiente copiar cada Skill publicada desde una única fuente hacia
`.agents/skills/` y `.claude/skills/`. El contenido de `engineering/project/` queda
fuera del alcance actual por decisión explícita.
