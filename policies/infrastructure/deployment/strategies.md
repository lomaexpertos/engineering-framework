# Deployment strategies

## Requirements

1. Cada servicio **MUST** declarar su estrategia en el manifest productivo.
2. La estrategia **MUST NOT** inferirse desde texto libre ni aplicarse globalmente por
   conveniencia.
3. Zero downtime **MUST** tratarse como una propiedad demostrable de un servicio y una
   operación concreta.

## Allowed strategies

| Strategy | Applicability | Minimum evidence |
| --- | --- | --- |
| `blue-green` | Servicio stateless con dos slots | Capacidad doble, health check, control de tráfico, drenado y rollback. |
| `rolling` | Servicio replicado | Réplicas múltiples, readiness y límite de indisponibilidad. |
| `recreate` | Singleton o interrupción aceptada | Verificación operativa y recuperación de versión. |
| `stateful` | Base de datos, cache persistente o estado local | Integridad, respaldo y recuperación específicos. |
| `external` | Componente administrado fuera del deployment | Owner, dependencia, salud y límites de responsabilidad. |

## Blue/green eligibility

Un servicio **MAY** declarar `blue-green` únicamente si:

- dos versiones pueden coexistir sin colisionar;
- existe un health check representativo;
- el tráfico puede conmutarse y verificarse;
- la versión nueva es compatible con dependencias y esquemas vigentes;
- las conexiones anteriores pueden drenarse o terminarse controladamente;
- existe rollback al slot anterior; y
- hay capacidad para ambas versiones.

Un worker acoplado **MUST** declararse como servicio separado. Compartir imagen con una
API **MUST NOT** convertirlo implícitamente en blue-green.
