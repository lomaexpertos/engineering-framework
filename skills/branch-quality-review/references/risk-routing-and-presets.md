# Routing de riesgos y presets

## Contenido

1. Presets base
2. Presets automáticos
3. Niveles de rigor
4. Traducción de solicitudes
5. Reglas de selección

## 1. Presets base

Aplicar en toda revisión:

- `core-correctness`: comportamiento, invariantes, estados, errores, contratos y regresiones.
- `security-baseline`: autenticación/autorización aplicable, entradas, salidas, secretos y configuración.
- `testing-regression`: evidencia, pruebas pertinentes, determinismo y riesgos residuales.

## 2. Presets automáticos

Activar uno o varios:

| Preset | Señales de activación |
|---|---|
| `critical-state-integrity` | saldos, balances, inventario, stock, reservaciones, cupos, crédito, pólizas, folios, consecutivos, límites, contadores o “una sola vez” |
| `payments-financial` | Stripe, pagos, cobros, devoluciones, reembolsos, contracargos, conciliación o proveedor financiero |
| `webhooks-event-ingestion` | webhook, callback, firma, replay, evento entrante, duplicado o entrega fuera de orden |
| `async-distributed` | jobs, queues, workers, cron, outbox, inbox, DLQ, retries, eventos durables/interproceso o múltiples servicios/bases |
| `data-contracts-transactions` | SQL, escrituras persistentes, dinero, fechas, IDs, contratos, aislamiento, precisión o caché derivada |
| `database-migrations` | DDL, ORM schema, migración, backfill, reparación, trigger, procedure, importación o escritura masiva |
| `api-exposure` | endpoints públicos o internos, tokens, API keys, GraphQL, callbacks, límites, errores o versionado API |
| `tenant-authorization` | tenants, empresas, ownership, roles, admin, delegación, segregación o filtros por propietario |
| `identity-access` | login, sesión, MFA, recuperación, federación, impersonación, cuentas de servicio o permisos privilegiados |
| `sensitive-data` | PII, salud, fiscal, financiero personal, biométricos, credenciales almacenadas o datos regulados |
| `frontend-critical-flow` | checkout, pago, aprobación, wizard, formularios críticos, doble submit, estado optimista o acciones irreversibles |
| `performance-scale` | listas o payloads grandes, fan-out, loops con I/O, N+1, batch, memoria, caché, rate limit o costo por request |
| `supply-chain-deployment` | dependencias, lockfiles, imágenes, CI/CD, actions, scripts de instalación, feature flags o configuración productiva |
| `files-and-uploads` | uploads, rutas, archivos temporales, generación o extracción de documentos, almacenamiento y descargas |

## 3. Niveles de rigor

- `baseline`: bajo impacto, interno, reversible, sin persistencia o activos sensibles.
- `standard`: persistencia, aplicación web, API o integración normal. Usar por defecto cuando haya duda.
- `high-assurance`: dinero, inventario, identidad, privilegios, datos sensibles, cumplimiento, efectos externos costosos o decisiones difíciles de revertir.

Elevar rigor por impacto acumulado aunque cada archivo parezca pequeño.

## 4. Traducción de solicitudes

Traducir lenguaje funcional, no sólo keywords:

- “Stripe y actualización de saldos” → `payments-financial` + `critical-state-integrity` + `data-contracts-transactions`; añadir `webhooks-event-ingestion` y `async-distributed` si existen webhooks/jobs; rigor `high-assurance`.
- “Evita vender más inventario del disponible” → `critical-state-integrity` + `data-contracts-transactions`; añadir `database-migrations` si cambian constraints y `frontend-critical-flow` si existe reservación desde UI.
- “Revisa permisos entre empresas” → `tenant-authorization` + `identity-access` + `security-baseline`; añadir `api-exposure` si la operación cruza una API y `sensitive-data` si expone datos protegidos; rigor al menos `standard`.
- “Valida un backfill de folios” → `database-migrations` + `data-contracts-transactions` + `critical-state-integrity` + `testing-regression`, rigor `high-assurance`.

## 5. Reglas de selección

- Activar presets por énfasis del usuario y por evidencia encontrada; unir ambos conjuntos.
- `payments-financial` y `webhooks-event-ingestion` son independientes: un pago no prueba que exista webhook y un webhook no prueba que mueva dinero. Si coinciden, aplicar ambos.
- `api-exposure` y `tenant-authorization` son independientes: una API monotenant no requiere controles cross-tenant y una fuga entre tenants puede existir fuera de una API pública.
- `data-contracts-transactions` aplica a datos persistentes aunque no exista una migración; `database-migrations` agrega controles de cambio y despliegue del esquema o datos.
- No desactivar presets base.
- No marcar `no-aplicable` sólo porque el diff no contenga una palabra: revisar la semántica y el radio de impacto.
- No ejecutar todo el catálogo siempre. Seleccionar proporcionalmente y explicar omisiones.
- Registrar preset, rigor, motivo, evidencia y estado de cobertura en el reporte.
- Tratar los presets como checklists de razonamiento, no como certificaciones.
