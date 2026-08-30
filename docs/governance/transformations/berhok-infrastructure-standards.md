# Berhok infrastructure standards transformation

## Source

Material del repositorio `berhok-logistics`, ruta `infra/standards/`, analizado el
2026-08-30. La transformación separa reglas normativas, procedimientos y enforcement;
no copia el paquete como una unidad monolítica.

## Mapping

| Source content | Canonical destination | Treatment |
| --- | --- | --- |
| `README.md`: lenguaje normativo | `policies/README.md` | Convención común existente. |
| `README.md`: orden de lectura | Routers de `policies/infrastructure/` | Reemplazado por routing por tarea. |
| `README.md`: primera lectura e instalación | `policies/ai-assisted-development/infrastructure-change-safety.md` | Solo límites normativos; el workflow queda pendiente. |
| `README.md`: estructura y directorios condicionales | `policies/infrastructure/repository-layout.md` | Policy canónica. |
| `README.md`: contrato documental | `policies/infrastructure/repository-layout.md` | Integrado sin datos propios de Berhok. |
| `README.md`: regla de adopción | `policies/ai-assisted-development/infrastructure-change-safety.md` | Separación entre evaluación, plan y ejecución. |
| `configuration-secrets-and-state.md`: clasificación | `policies/infrastructure/configuration.md` | Configuración y ownership. |
| `configuration-secrets-and-state.md`: SOPS y age | `policies/security/sops-age.md` | Estándar técnico condicionado por aplicabilidad. |
| `configuration-secrets-and-state.md`: cuatro representaciones | `policies/security/encrypted-environment-contract.md` | Contrato normativo canónico. |
| `configuration-secrets-and-state.md`: evolución de variables | Skill futura `manage-secrets` | Procedimiento, no Policy. |
| `configuration-secrets-and-state.md`: gates | Policy de contrato y checks futuros | Requisito normativo más enforcement pendiente. |
| `configuration-secrets-and-state.md`: local y preview | `policies/security/secrets.md` | Credenciales efímeras condicionadas. |
| `configuration-secrets-and-state.md`: configuración pública | `policies/infrastructure/configuration.md` | Policy canónica. |
| `configuration-secrets-and-state.md`: estado runtime | `policies/infrastructure/runtime-state.md` | Policy canónica. |
| `deployment-strategies.md`: catálogo y blue/green | `policies/infrastructure/deployment/strategies.md` | Policy canónica. |
| `deployment-strategies.md`: contrato declarativo | `policies/infrastructure/deployment/manifest.md` | Contrato verificable. |
| `deployment-strategies.md`: migraciones | `policies/database/deployment-compatibility.md` | Regla transversal de base de datos. |
| `local-and-preview.md`: local | `policies/infrastructure/environments/local.md` | Policy específica por ambiente. |
| `local-and-preview.md`: preview | `policies/infrastructure/environments/preview.md` | Policy específica por ambiente. |
| `local-and-preview.md`: paridad | `policies/infrastructure/environments/parity.md` | Policy compartida. |
| `local-and-preview.md`: capacidades de base de datos | `policies/database/deployment-compatibility.md` | Fuente canónica transversal. |
| `production-deployment.md`: unidades y documentación | `policies/infrastructure/environments/production.md` | Policy específica del ambiente. |
| `production-deployment.md`: convenciones de rutas | `policies/infrastructure/repository-layout.md` | Generalizado; paths de Compose quedan pendientes. |
| `production-deployment.md`: entrypoints | `policies/infrastructure/deployment/automation.md` | Policy canónica. |
| `production-deployment.md`: edge y tráfico | `policies/infrastructure/deployment/traffic-management.md` | Policy condicional. |
| `production-deployment.md`: salud y recuperación | `policies/infrastructure/health-checks.md` y `policies/infrastructure/deployment/rollback.md` | Separado por trigger operativo. |
| `validation-and-adoption.md`: modos y autoridad | `policies/ai-assisted-development/infrastructure-change-safety.md` | Límites normativos. |
| `validation-and-adoption.md`: generación y adopción | Skill futura `infrastructure-change` | Workflow pendiente. |
| `validation-and-adoption.md`: validación del manifest | Checks futuros | Enforcement pendiente. |

## Result

La extracción produjo 18 Policies: 13 de infraestructura, 3 de seguridad, 1 de base
de datos y 1 de desarrollo asistido por agentes. Los READMEs son routers y no cuentan
como Policies.
