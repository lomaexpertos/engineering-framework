# Lanes de revisión

Usar lanes sólo para repartir presets ya seleccionados. El routing y los controles siguen siendo obligatorios sin subagentes.

## Integrador

- Resolver alcance, rigor y presets.
- Mantener el mapa de activos, invariantes y radio de impacto.
- Deduplicar hallazgos y resolver contradicciones.
- Verificar matriz de cobertura y escribir el reporte.

## Integridad crítica

Aplicar `critical-state-integrity`: invariantes, escritores, transacciones, concurrencia, idempotencia, saldos, inventarios, folios y reconciliación.

## Seguridad

Aplicar `security-baseline`, `api-exposure`, `tenant-authorization`, `identity-access`, `sensitive-data` y `files-and-uploads` según selección.

## Pagos y distribución

Aplicar `payments-financial`, `webhooks-event-ingestion` y `async-distributed`: proveedores, webhooks, retries, orden, outbox/inbox, compensación y recuperación.

## Datos y despliegue

Aplicar `data-contracts-transactions` y `database-migrations`: contratos, precisión, SQL, backfills, compatibilidad y rollout.

## Performance y operabilidad

Aplicar `performance-scale`, `supply-chain-deployment` y controles de observabilidad, recursos y recuperación.

## Frontend y UX

Aplicar `frontend-critical-flow`: estado, doble submit, respuestas fuera de orden, seguridad, componentes, accesibilidad y experiencia de acciones críticas.

## Pruebas y regresión

Verificar evidencia por riesgo, determinismo, concurrencia, contratos, migraciones y defectos corregidos.

## Contrato de salida de cada lane

- Presets y controles aplicados.
- Archivos, símbolos y evidencia inspeccionados.
- Hallazgos con severidad y confianza.
- Controles revisados sin hallazgos.
- Limitaciones y asuntos no verificables.
- Preguntas que podrían cambiar la conclusión.
