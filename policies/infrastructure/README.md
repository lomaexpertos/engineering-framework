# Infrastructure policies router

Consulta únicamente las Policies relacionadas con la tarea actual. Este README es un
router; no obliga a cargar todo el dominio.

## Routing

| Tarea | Policies aplicables |
| --- | --- |
| Crear o reorganizar `infra/` | [`repository-layout.md`](repository-layout.md) |
| Cambiar configuración versionada | [`configuration.md`](configuration.md) |
| Modificar locks, slots, tags o archivos generados | [`runtime-state.md`](runtime-state.md) |
| Crear o modificar un ambiente | [`environments/`](environments/README.md) |
| Elegir estrategia, automatizar o ejecutar un deployment | [`deployment/`](deployment/README.md) |
| Definir o revisar señales de salud | [`health-checks.md`](health-checks.md) |
| Cambiar secretos productivos | `policies/security/README.md` |
| Cambiar esquema durante un deployment | `policies/database/deployment-compatibility.md` |

## Planned coverage

Los siguientes temas continúan planeados y todavía no constituyen Policies vigentes:

- `infrastructure-as-code.md` para recursos aprovisionados declarativamente;
- `containers.md` para construcción y ejecución segura de contenedores;
- `observability.md` para métricas, logs, trazas y alertamiento más allá de health checks.
