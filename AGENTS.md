# Agent instructions

Este archivo es un router, no un manual. Consulta únicamente las fuentes necesarias
para la tarea actual.

## Invariantes

- Inspecciona el repositorio y sus convenciones antes de modificarlo.
- No debilites ni eludas Policies, validaciones o pruebas para completar una tarea.
- Evita refactors no relacionados y verifica el trabajo antes de declararlo terminado.
- No edites como fuente archivos generados o vendorizados.

## Routing

- Producto nuevo, nueva app o adopción de monorepo: consulta
  [`monorepo.md`](policies/development/monorepo.md) y
  [`configure-monorepo`](skills/configure-monorepo/SKILL.md).
- Antes de modificar comportamiento, consulta la documentación vigente del dominio
  afectado, si existe.

- Preguntas de negocio, otros sistemas o deber ser: responder en conversación sin
  activar workflows por defecto. Analizar un módulo del repositorio actual usa
  [`spec-documentar`](skills/spec-documentar/SKILL.md) para investigar y documentar
  AS-IS; respetar límites como «solo analiza» o «sin archivos». La frontera está en
  [`domain-documentation.md`](policies/ai-assisted-development/domain-documentation.md).
- Para instalar o actualizar el framework en un consumidor desde su rama actual,
  sigue [`INSTALL.md`](INSTALL.md).
- Para reglas normativas, comienza en [`policies/README.md`](policies/README.md) y
  sigue el router del dominio aplicable.
- Para elegir recorrido mínimo, estándar o reforzado según riesgo, consulta
  [`proportional-delivery.md`](policies/ai-assisted-development/proportional-delivery.md).
- Para ejecutar un workflow repetible, consulta [`skills/README.md`](skills/README.md)
  y después la Skill correspondiente.
- Para arquitectura, distribución o contratos, consulta
  [`docs/architecture/README.md`](docs/architecture/README.md).
- Para conocimiento duradero, invariantes y roadmap, consulta
  [`docs/README.md`](docs/README.md).
- Para retomar trabajo, consulta `.harness_work/README.md` y solo el expediente activo.
- Para versionado, ownership o cambios, consulta
  [`docs/governance/README.md`](docs/governance/README.md).
- Para validaciones automáticas, consulta [`checks/README.md`](checks/README.md)
  y ejecuta las aplicables sin reducir controles requeridos del proyecto o CI.
- Para scripts de construcción o sincronización, consulta
  [`tooling/README.md`](tooling/README.md).
- Para crear, adelgazar o recablear `AGENTS.md`, READMEs, índices o arquitectura de
  contexto, consulta
  [`policies/ai-assisted-development/context-management.md`](policies/ai-assisted-development/context-management.md)
  y usa `configure-agent-context`; para auditar sin modificar, usa
  `audit-agent-context`.

## Precedencia

1. Policies corporativas aplicables.
2. Restricciones documentadas del proyecto, cuando sean más estrictas.
3. Arquitectura y convenciones existentes del proyecto.
4. Preferencias del agente.

Una regla local no puede debilitar silenciosamente una Policy corporativa. Si existe
conflicto o se necesita una excepción, detén la decisión afectada, haz visible el
conflicto y utiliza el mecanismo de excepción documentado.
