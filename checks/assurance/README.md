# Controles de secretos y deployment

Consultar esta guía al adoptar los controles o cambiar infraestructura, secretos y
sus contratos. Los tres scopes se integran en `bash .harness/check.sh`.

| Scope | Activación y alcance |
| --- | --- |
| `security` | Explícito, o agregado al existir `assurance.json`; Gitleaks sobre archivos/índice y el historial seleccionado. |
| `deployment` | Manifests declarados más `deployment.yaml` encontrados bajo `infra/deploy/`. |
| `secrets` | Contratos declarados; detecta `config/secret-files.conf` bajo `infra/deploy/` y exige su adopción explícita. |

Una revisión `--scope context` o `documentation` no ejecuta estos controles. Ausencia
de infraestructura devuelve `not_applicable`; una herramienta requerida ausente
devuelve error, nunca aprobación. El agregado incorpora contratos descubiertos sin
crear carpetas ni desplegar. Los checks requeridos del proyecto/CI siguen vigentes.

## Herramientas transversales

Gitleaks 8.30.1 es necesario para `security`; SOPS 3.13.3 está disponible con el
instalador para contratos dotenv (el validador usa `filestatus`, sin descifrar).
Node.js 22/24, Bash y Git conservan su contrato. El parser YAML 2.9.1 viene incluido
con licencia ISC y procedencia; no requiere npm. No se interpreta YAML con aliases,
tags especiales, documentos múltiples o claves duplicadas.

Preparar el equipo desde la raíz del consumidor con un solo comando:

```bash
bash .harness/setup.sh
```

El setup reutiliza Node.js 22/24 y las versiones compatibles de Gitleaks/SOPS ya
disponibles; instala los faltantes en una caché del usuario con versiones y SHA256
fijados. Si falta Node compatible, prepara el runtime fijado. Admite Linux/macOS
x64/arm64, es repetible y no reemplaza ejecutables personales. Los wrappers y
validadores encuentran las herramientas administradas sin editar perfiles ni pedir
ajustes manuales de `PATH`. La caché predeterminada es
`~/.engineering-harness/cache/`: Node se guarda bajo `node/` y Gitleaks/SOPS bajo
`tools/`, separados por versión y plataforma. Ese directorio privado pertenece al
harness; no se cambian permisos de cachés compartidas ni de ejecutables personales.
La caché no pertenece al proyecto ni se versiona.

Bash, Git, `curl`, `tar` y las utilidades básicas del sistema son prerrequisitos;
su ausencia produce un diagnóstico concreto. El setup no usa `sudo`, instala
paquetes del sistema ni prepara dependencias de la aplicación. Tampoco configura
clientes/modelos de agentes, credenciales o identidades age.

Para diagnosticar sin descargar ni escribir, o preparar y validar en una sola llamada:

```bash
bash .harness/setup.sh --check
bash .harness/check.sh --setup --scope security --json
```

`check.sh --setup` completa primero la preparación y después ejecuta los checks
seleccionados; si falla la preparación no acredita aprobación. Un check normal y
una actualización conservan su operación sin descargas implícitas. El instalador
individual bajo `core/runtime/tooling/harness-tool-install.mjs` queda como opción
avanzada para destinos elegidos explícitamente, no como requisito de uso habitual.

## Adopción del proyecto

Crear `.harness/project/assurance.json` según
[assurance.schema.json](../../schemas/assurance.schema.json). Ejemplo adaptable:

```json
{
  "schema_version": 1,
  "secret_scan": {"mode": "worktree"},
  "deployments": ["infra/deploy/production/deployment.yaml"],
  "secret_contracts": [
    {"root": "infra/deploy/production", "runtime_files": ["api.env"]}
  ]
}
```

Omitir `deployments` o `secret_contracts` si esas capacidades no existen. La presencia
de `assurance.json` adopta escaneo en el agregado; sin `secret_scan` usa `worktree`.
Discovery considera archivos tracked y nuevos no ignorados, excluyendo cachés y
estado generado; las rutas declaradas se comprueban aunque estén ignoradas. Las rutas
de esta configuración son relativas al repositorio, sin traversal ni symlinks.
Rutas heredadas fuera de `infra/deploy/` requieren declaración explícita; el check
no migra infraestructura ni convierte archivos antiguos al contrato nuevo.

El modo `changes` requiere `base_ref` explícita y analiza commits desde esa base,
índice y cambios locales/untracked; `history` requiere historia completa. Los modos,
límites y tratamiento de falsos positivos están en
[detección de secretos](../security/README.md).

```bash
bash .harness/check.sh --scope security --json
bash .harness/check.sh --scope deployment --json
bash .harness/check.sh --scope secrets --json
```

Para mantener esta fuente productora, usar `node tooling/harness-assurance.mjs
--root . --scope security`; las mismas operaciones están distribuidas en runtime.

## Contratos y límites de evidencia

Deployment sigue
[su Policy](../../policies/infrastructure/deployment/manifest.md) y
[schema](../../schemas/deployment.schema.json): referencias a archivos relativas al
manifest, IDs únicos y referencias existentes, estrategias, salud y autoridad de
migración. Comprueba declaraciones y rutas; no ejecuta salud, scripts ni despliegues,
ni demuestra coherencia operativa con un servidor.

Secretos sigue
[el contrato dotenv](../../policies/security/encrypted-environment-contract.md),
[SOPS/age](../../policies/security/sops-age.md) y
[schema](../../schemas/secret-contract.schema.json): allowlist cerrada, claves,
placeholders, destinations y recipients. `runtime_files` declara los destinos
relativos a `RUNTIME_DIR`, no rutas a plaintext existente. El esquema sanitizado es
`config/sanitized/<destino>` cuando termina en `.env`; añade `.env` en otro caso.
No se permite simular cobertura con una lista de destinos inferida del mismo
manifest. Comprobar consumo real, lectura/validación en aplicación, descifrado
autorizado, rotación, materialización atómica y activación sigue siendo requisito
del deployment; este check estático no los acredita.

Los contratos SOPS admiten age directo y la primera regla aplicable de `.sops.yaml`
en raíz, con regex portable documentada. Otras autoridades anidadas, proveedores o
formas no soportadas fallan explícitamente. Un error no muestra ciphertext,
plaintext, stdout/stderr del proceso ni coincidencias de secretos.

Salidas: 0 aprobado o no aplicable; 1 incumplimientos; 2 configuración/herramienta o
ejecución incompleta. `not_applicable` no equivale a haber inspeccionado una capacidad.
Antes de entregar commits se ejecuta el escaneo aplicable según
[la Policy](../../policies/security/secret-scanning.md); no hay hook ni scheduler
instalado implícitamente. Los controles no conceden autorización operativa.
