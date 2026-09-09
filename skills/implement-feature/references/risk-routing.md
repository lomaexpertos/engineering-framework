# Risk routing for implementation

Leer esta referencia cuando el cambio cruce varias áreas o no sea evidente qué
workflow especializado debe aplicarse.

## Base de todo cambio productivo

Verificar siempre:

- comportamiento esperado, errores y autorización aplicable;
- convenciones y contratos existentes;
- pruebas proporcionales y observabilidad necesaria;
- compatibilidad con consumidores; y
- ausencia de secretos o cambios incidentales.

## Routing condicional

| Señal del cambio | Contexto adicional |
| --- | --- |
| Pantallas, componentes, formularios o interacción | Policies frontend y `implement-ui-change` |
| APIs entre servicios, eventos, colas o webhooks | Policies distributed systems y `implement-distributed-integration` |
| Pagos, saldos, inventario, folios o transición crítica | Policies de dominio/concurrencia y `implement-critical-state-change` |
| Tablas, datos, rutinas o consultas | Router de Policies database y Skill de base de datos por efecto |
| Latencia, throughput, CPU, memoria o I/O | Policy de performance y `optimize-performance` |
| Logs, métricas, trazas o alertas | `add-observability` |
| Infraestructura, deployment o secretos | Skill de infraestructura correspondiente |

## Rigor

- **Normal:** cambio localizado, reversible y sin contrato, datos o permisos críticos.
- **Reforzado:** toca persistencia, autorización, integración, migración, asincronía o
  compatibilidad. Exige pruebas de frontera y revisión del radio de impacto.
- **Alto:** dinero, fiscalidad, nómina, secretos, datos irreversibles o efectos
  distribuidos de alto impacto. Exige invariantes explícitas, escenarios de falla y
  recuperación; usar `branch-quality-review` cuando se prepare la entrega, el usuario
  lo solicite o una Policy lo exija.

El tamaño del diff no reduce por sí mismo el rigor.
