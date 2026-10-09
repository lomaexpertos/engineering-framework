# Skills

Las Skills definen nuestras restricciones, el resultado esperado y las nomenclaturas,
convenciones o formas de realizar el trabajo propias del estilo organizacional.
El modelo decide cómo alcanzarlo dentro de ellas. El criterio normativo está en
[`skill-design.md`](../policies/ai-assisted-development/skill-design.md).

Consultan únicamente Policies y contexto pertinentes; no son manuales de técnicas
generales ni convierten una referencia a otra Skill en permiso para ampliar el trabajo.

Una Skill no debe existir para repetir una sola regla transversal. Tampoco se publica
un directorio con `SKILL.md` hasta que su contrato aporte una decisión propia,
una convención o un límite de autoridad útil para esa clase de tarea.

El logging crítico se implementa desde el desarrollo conforme a la Policy
[`logging.md`](../policies/development/logging.md), aunque no se invoque
`add-observability`. Cambios triviales sin valor diagnóstico no necesitan nuevos logs.

## Catálogo publicado

### Contexto y gobernanza

| Skill | Propósito |
| --- | --- |
| [`configure-agent-context`](configure-agent-context/SKILL.md) | Inicializar, adelgazar o recablear el contexto del repositorio. |
| [`audit-agent-context`](audit-agent-context/SKILL.md) | Auditar progressive disclosure sin modificar archivos. |

### Infraestructura y operación

| Skill | Propósito |
| --- | --- |
| [`infra-change`](infra-change/SKILL.md) | Modificar infraestructura ya adoptada. |
| [`infra-adopt-framework`](infra-adopt-framework/SKILL.md) | Migrar un repositorio al layout corporativo. |
| [`implement-deployment-automation`](implement-deployment-automation/SKILL.md) | Automatizar con Bash deployments de servidor fijo sin ejecutarlos. |
| [`manage-secrets`](manage-secrets/SKILL.md) | Gestionar el ciclo de vida de secretos. |
| [`add-observability`](add-observability/SKILL.md) | Incorporar señales y trazabilidad de operaciones críticas. |
| [`investigate-production-incident`](investigate-production-incident/SKILL.md) | Investigar incidentes sin asumir autoridad operativa. |

### Dominio y especificaciones

| Skill | Propósito |
| --- | --- |
| [`explorador-de-dominio`](explorador-de-dominio/SKILL.md) | Contrastar proceso actual, referente y necesidad real, sin imponer un curso. |
| [`research-best-practices`](research-best-practices/SKILL.md) | Investigar evidencia externa actual. |
| [`spec-definir`](spec-definir/SKILL.md) | Definir o refinar el TO-BE y sus requisitos verificables. |
| [`spec-planear`](spec-planear/SKILL.md) | Crear un plan técnico proporcional y verificable. |
| [`spec-implementar`](spec-implementar/SKILL.md) | Ejecutar una spec planificada. |
| [`spec-documentar`](spec-documentar/SKILL.md) | Mantener documentación AS-IS permanente. |

### Implementación

| Skill | Propósito |
| --- | --- |
| [`implement-feature`](implement-feature/SKILL.md) | Implementar una capacidad de extremo a extremo. |
| [`implement-ui-change`](implement-ui-change/SKILL.md) | Modificar UI mediante reuse before create. |
| [`implement-distributed-integration`](implement-distributed-integration/SKILL.md) | Implementar APIs, eventos, colas o webhooks. |
| [`implement-critical-state-change`](implement-critical-state-change/SKILL.md) | Proteger estados de negocio críticos. |
| [`optimize-performance`](optimize-performance/SKILL.md) | Mejorar performance con mediciones. |
| [`debug-error`](debug-error/SKILL.md) | Reproducir y corregir una falla. |

### Base de datos

| Skill | Propósito |
| --- | --- |
| [`database-schema-change`](database-schema-change/SKILL.md) | Evolucionar tablas, relaciones e índices. |
| [`database-data-change`](database-data-change/SKILL.md) | Ejecutar backfills y reparaciones seguras. |
| [`database-routine-change`](database-routine-change/SKILL.md) | Modificar funciones, procedimientos y triggers. |
| [`optimize-database-query`](optimize-database-query/SKILL.md) | Optimizar consultas con planes y medición. |

### Revisión

| Skill | Propósito |
| --- | --- |
| [`branch-quality-review`](branch-quality-review/SKILL.md) | Decidir si una rama, PR o patch es entregable con evidencia. |
| [`security-review`](security-review/SKILL.md) | Auditar amenazas y controles de seguridad. |
| [`data-integrity-review`](data-integrity-review/SKILL.md) | Auditar concurrencia, idempotencia e integridad. |

### Git

| Skill | Propósito |
| --- | --- |
| [`gitcommit`](gitcommit/SKILL.md) | Crear commits locales lógicos, seguros y semánticos. |

## Distribución

`skills/<nombre>/` es la única fuente. El sincronizador compartido por ambos canales
copia el directorio completo
—incluyendo `SKILL.md` y sus referencias— a `.agents/skills/<nombre>/` y
`.claude/skills/<nombre>/`. Las diferencias inevitables entre plataformas deben
resolverse en distribución o metadata compatible, no manteniendo dos Skills.
