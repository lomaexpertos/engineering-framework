# Integridad, concurrencia e idempotencia

## Contenido

1. Partir de invariantes
2. Inventariar escritores
3. Reconstruir transacciones
4. Analizar anomalías
5. Evaluar estrategias
6. Revisar idempotencia
7. Aplicar por dominio
8. Exigir evidencia

## 1. Partir de invariantes

Expresar cada condición crítica con alcance y excepción, por ejemplo:

- un movimiento confirmado afecta el saldo exactamente una vez;
- el disponible no se reserva por encima del límite permitido;
- un folio es único dentro de empresa, serie y periodo;
- una transición sólo ocurre desde estados autorizados;
- un reembolso no supera lo efectivamente cobrado salvo regla explícita.

Identificar autoridad y fuente de verdad. Distinguir ledger, snapshot, caché, saldo derivado y proyección. No revisar locks antes de saber qué deben proteger.

## 2. Inventariar escritores

Buscar mediante una inspección razonable todos los caminos observables que crean, actualizan, cancelan, revierten o recalculan el estado:

- HTTP, RPC, GraphQL y UI;
- casos de uso y servicios;
- jobs, workers, cron y consumidores;
- webhooks y callbacks;
- CLI, importadores, scripts y backfills;
- triggers, procedures y callbacks ORM;
- otros módulos, servicios o conexiones.

Documentar si todos pasan por la misma autoridad. Un único escritor visible en el diff no demuestra exclusividad. Registrar como `no-verificable` accesos directos, servicios externos o escritores cuya cobertura completa no pueda demostrarse.

## 3. Reconstruir transacciones

Verificar:

- inicio, commit y rollback reales;
- conexión y sesión usadas por cada repositorio;
- lecturas, validaciones y escrituras incluidas;
- excepciones capturadas que podrían confirmar estado parcial;
- trabajo lento o externo dentro de la transacción;
- cobertura real cuando hay varias bases, servicios o brokers;
- aislamiento configurado frente al asumido.

## 4. Analizar anomalías

Simular al menos:

- dos solicitudes leen el mismo valor y escriben resultados incompatibles;
- dos actores consumen el último recurso disponible;
- dos procesos calculan el mismo `max + 1`;
- un duplicate/retry llega antes de que termine el primer intento;
- un evento llega después de una cancelación o en orden inverso;
- el proveedor completa la operación, pero la respuesta local se pierde;
- la base confirma y la publicación externa falla;
- un deadlock causa retry después de un efecto no idempotente.

Buscar lost update, write skew, phantoms, TOCTOU, locks sobre filas inexistentes y orden de adquisición inconsistente según motor y estrategia.

## 5. Evaluar estrategias

Elegir por invariante y contención:

| Conflicto | Protecciones posibles |
|---|---|
| Exclusión estructural | `unique`, `check`, FK o índice único parcial compatible con el motor |
| Reserva o decremento simple | operación atómica condicionada y verificación de filas afectadas |
| Edición con baja colisión | versión o optimistic locking |
| Serialización acotada | lock de fila o recurso padre dentro de transacción |
| Consecutivo | secuencia/identity o asignador serializado; evitar `max + 1` |
| Varias escrituras del mismo agregado | transacción con orden consistente de locks |
| Frontera distribuida | estados intermedios, outbox/inbox, saga, compensación y reconciliación |

No aceptar la mera presencia de un lock. Confirmar que protege la fila o recurso correcto, funciona dentro de una transacción, usa predicados indexados y cubre todos los escritores. No exigir un lock cuando una operación atómica o constraint ofrece mejor garantía.

## 6. Revisar idempotencia

Definir el contrato:

- operación lógica y efecto que se deduplican;
- origen, entropía y alcance de la clave;
- vínculo entre clave, actor, tenant y payload;
- persistencia y constraint de unicidad;
- estados `processing`, `succeeded`, `failed` o equivalentes;
- respuesta repetida y comportamiento concurrente;
- expiración y reutilización;
- atomicidad entre registrar la clave y aplicar el efecto;
- recuperación de intentos abandonados;
- interacción con reintentos del proveedor, cola y cliente.

Una consulta previa “si no existe” seguida de insert no es suficiente sin constraint u operación atómica.

## 7. Aplicar por dominio

### Saldos y contabilidad

- Distinguir movimientos fuente de saldos materializados.
- Confirmar signo, moneda, precisión y periodo.
- Verificar reversos en vez de borrado histórico cuando corresponda.
- Detectar múltiples actualizadores y recálculos que compitan.
- Exigir conciliación y posibilidad de reconstrucción para estado derivado crítico.

### Inventario y cupos

- Separar físico, disponible, reservado, comprometido y en tránsito según el dominio.
- Confirmar alcance por ubicación, lote, serie o unidad.
- Probar última unidad, cancelación, expiración, transferencia y retry.
- Verificar política explícita para negativos o backorders.

### Folios y consecutivos

- Definir alcance de unicidad y si se permiten huecos.
- Evitar `count + 1` y `max + 1` sin serialización.
- No reutilizar folios después de rollback o cancelación salvo regla demostrada.
- Verificar constraints además del generador.

## 8. Exigir evidencia

Para rigor alto, buscar pruebas con dos o más operaciones coordinadas mediante barreras, no sleeps arbitrarios. Comprobar el resultado final y la invariante, no sólo respuestas individuales.

Cubrir duplicados, orden inverso, retry, rollback, deadlock y recuperación cuando apliquen. Si no puede ejecutarse una prueba representativa, marcar `no-verificable` y explicar el riesgo residual.

Bloquear entrega cuando una invariante crítica dependa de una validación no atómica, existan escritores con estrategias incompatibles, el retry pueda duplicar efectos o no haya recuperación para un fallo parcial plausible.
