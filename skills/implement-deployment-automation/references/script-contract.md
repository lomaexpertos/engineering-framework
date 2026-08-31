# Script and artifact contract

Cargar esta referencia cuando se creen o modifiquen scripts, librerías, runtime o el
layout productivo.

## Estructura canónica

```text
infra/deploy/production/
├── README.md
├── deployment.yaml
├── compose/
│   ├── core.yml
│   └── standalone/
├── config/
├── secrets/
├── edge/
├── cron/
├── scripts/
│   ├── deploy.sh
│   ├── lib/
│   └── privileged/
└── runbooks/
```

Solo crear directorios correspondientes a capacidades reales. El `RUNTIME_DIR` es un
directorio operativo explícito llamado `runtime`; no es una fuente versionada. Cuando
contenga secretos materializados debe vivir fuera del checkout.

## Interfaz pública

```text
deploy.sh <precheck|install|release|status|diagnose|rollback> <unidad> [versión]
```

| Command | Contract |
| --- | --- |
| `precheck` | Verifica prerrequisitos y reporta bloqueos sin modificar el ambiente. |
| `install` | Prepara por primera vez una unidad sin asumir que está ausente. |
| `release` | Converge la unidad hacia una versión validada y explícita. |
| `status` | Describe estado observado y declarado sin modificarlo. |
| `diagnose` | Reúne evidencia segura sin revelar secretos ni reparar automáticamente. |
| `rollback` | Restaura un objetivo conocido; no adivina una versión recuperable. |

La unidad siempre es explícita. `install`, `release` y `rollback` deben rechazar una
versión ausente cuando la operación necesite identificar un artefacto concreto.

## Bash

- Resolver la ruta del script mediante `BASH_SOURCE`, no mediante el directorio actual.
- Conservar `scripts/deploy.sh` como archivo ejecutable y con shebang de Bash.
- Usar modo estricto compatible con el flujo y manejar errores con códigos inequívocos.
- Validar argumentos antes de crear locks o archivos.
- Obtener `RUNTIME_DIR` mediante un contrato explícito y validar que su directorio
  final se llame `runtime`; no usar `/tmp` como fallback silencioso.
- Encapsular funciones reutilizables en `scripts/lib/`.
- Mantener secretos fuera de argumentos, logs, trazas y mensajes de error.
- Crear temporales dentro de `RUNTIME_DIR`, con limpieza también ante fallas.
- Mantener locks por unidad y compartirlos con operaciones incompatibles.
- Reemplazar estado relacionado de forma atómica cuando una lectura concurrente pueda
  observar resultados parciales.
- No modificar artefactos versionados durante una ejecución operativa.

## Consistencia

`deployment.yaml`, Compose, scripts, README, health checks, configuración, secretos y
runbooks deben usar los mismos identificadores, rutas, estrategias y unidades. Una
ruta declarada debe existir y ningún entrypoint heredado puede quedar como alternativa
rival sin una decisión explícita de compatibilidad o retiro.
