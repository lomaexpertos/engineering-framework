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

La instalación de herramientas es explícita desde la raíz del consumidor:

```bash
node .harness/core/runtime/tooling/harness-tool-install.mjs gitleaks
node .harness/core/runtime/tooling/harness-tool-install.mjs sops
```

El instalador requiere `curl` y `tar` para Gitleaks, admite Linux/macOS x64/arm64,
verifica SHA256 fijado antes de instalar y no reemplaza archivos existentes.
El destino predeterminado es `~/.local/bin`; agregarlo al `PATH` del agente y del
terminal. `--destination DIR` permite un directorio personal diferente. Actualizar
el harness no instala binarios ni cambia ese PATH. El directorio de herramientas no
debe versionarse en un proyecto.

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
