# Skills

Las Skills son workflows reutilizables para realizar correctamente una clase de
tarea. Pueden consultar Policies corporativas, documentación del proyecto,
implementación existente, pruebas, configuración y herramientas disponibles.

Una Skill no debe existir para repetir una sola regla transversal. Tampoco se publica
un directorio con `SKILL.md` hasta que el procedimiento sea ejecutable y aporte
criterios reales de decisión y verificación.

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
| [`implement-deployment-automation`](implement-deployment-automation/SKILL.md) | Crear automatización sin desplegar. |
| [`manage-secrets`](manage-secrets/SKILL.md) | Gestionar el ciclo de vida de secretos. |
| [`add-observability`](add-observability/SKILL.md) | Incorporar señales y trazabilidad de operaciones críticas. |
| [`investigate-production-incident`](investigate-production-incident/SKILL.md) | Investigar incidentes sin asumir autoridad operativa. |

### Dominio y especificaciones

| Skill | Propósito |
| --- | --- |
| [`explorador-de-dominio`](explorador-de-dominio/SKILL.md) | Aprender un dominio, cuestionar supuestos y evaluar preparación. |
| [`research-best-practices`](research-best-practices/SKILL.md) | Investigar evidencia externa actual. |
| [`discover-business-process`](discover-business-process/SKILL.md) | Reconstruir un proceso AS-IS. |
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

## Distribución

`skills/<nombre>/` es la única fuente. El workflow central copia el directorio completo
—incluyendo `SKILL.md` y sus referencias— a `.agents/skills/<nombre>/` y
`.claude/skills/<nombre>/`. Las diferencias inevitables entre plataformas deben
resolverse en el workflow o metadata compatible, no manteniendo dos Skills.
