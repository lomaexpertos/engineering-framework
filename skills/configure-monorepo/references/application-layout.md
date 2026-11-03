# Estructura y archivos de aplicaciones

Consultar al inicializar un producto, agregar apps o reconciliar un monorepo existente.
Autoridad: `.harness/core/policies/development/monorepo.md`, desde la raíz del consumidor.

## Perfil inicial

```text
proyecto/
├── apps/
│   ├── README.md
│   ├── api/
│   │   ├── README.md
│   │   ├── Dockerfile
│   │   ├── docker/                   # Configuración de imagen propia, si existe
│   │   └── src/                      # Raíz nativa; p. ej. composer.json y tests/
│   │       └── .releaserc.yml         # Ejecutado desde esta raíz
│   └── web/
│       ├── Dockerfile
│       └── src/                      # P. ej. package.json, lockfile y tests/
├── packages/                         # Solo reutilización real con contrato
├── .github/workflows/                # Solo automatizaciones adoptadas
├── infra/deploy/                     # Ambientes según Policy existente
├── docs/                            # Conocimiento duradero vigente
├── .harness/                        # Núcleo y extensiones; sin cambios de layout
└── .harness_work/                    # Continuidad y evidencia descartable
```

Es un perfil, no una lista de carpetas a crear. Apps con herramientas que esperan
manifest, tests o código en la raíz pueden conservarlos en `apps/<id>/`;
`src/` no es obligatorio en esos casos. Dockerfile/contexto y rutas CI deben apuntar
a la raíz real. App ID no tiene que coincidir con un dominio ni con una unidad de
deployment: declarar su correspondencia cuando sea relevante.

Un `package.json` raíz con lockfile puede centralizar tooling de release; sus
dependencias se instalan en una imagen de herramientas/CI. No exige workspaces
JavaScript ni sustituye Composer, pip, Flutter o .NET de cada app. Un manifest npm
auxiliar de release en una app no define su lenguaje de ejecución.

## Mapa operativo propio

`apps/README.md` mantiene el índice de apps. Para cada una, identificar:

- ID, propósito y enlace a conocimiento canónico del dominio si existe.
- Raíz de código, manifest/lockfile, runtime y dependencias de otras unidades.
- Dockerfile/contexto, comandos de build/pruebas y check/runner que aporta evidencia.
- Raíz/configuración de release, prefijo de tag y workflow responsable.
- Artefacto resultante y relación con deployment, si la app se despliega.

Un README de app puede contener comandos y enlazar el mapa; no necesita duplicar
explicaciones de negocio. Al cerrar cambios, actualizar solo las relaciones afectadas.
Usar rutas relativas; no copiar rutas de máquina ni inventarios de otro producto.

## Gitignore y contexto de build

La Policy `.harness/core/policies/git/repository-hygiene.md` gobierna qué se versiona.
Componer `.gitignore` según stacks reales y comprobar patrones con `git check-ignore
-v --no-index` sobre rutas representativas, incluidas excepciones. No ignorar todo
`apps/`, `docs/`, `.harness/` ni `.harness_work/`: esta última conserva memoria y
estado compartidos; solo runtime local y evidencia sensible/no versionable se omiten.

| Contenido | Criterio |
| --- | --- |
| Dependencias y builds | Ignorar `node_modules/`, `vendor/`, `.venv/`, caches, coverage y salidas de build en rutas concretas del stack. No usar un patrón global `bin/` o `dist/` si contiene fuentes o vendorizados intencionales. |
| Entornos y secretos | Ignorar `.env`/`.env.*` privados; mantener excepciones verificadas para ejemplos sanitizados y `*.sops.env` cifrados donde se adopten. Una regla amplia no debe ocultar contratos requeridos. |
| SQL y datos | Versionar SQL canónico y fixtures aprobados; ignorar dumps, datos reales, backups y volúmenes. No ignorar todos los `*.sql`. |
| Infra local | Ignorar estado Terraform, material descifrado, volúmenes y locks operativos. Conservar lockfiles de dependencias como `.terraform.lock.hcl` y manifests/configuración pública. |
| Harness y agentes | Versionar núcleo administrado, adaptadores, reglas propias y contexto compartido; ignorar `.harness_work/runtime/`, logs locales y credenciales. Perfiles personales viven fuera del repo. |

`.gitignore` no elimina contenido ya tracked ni es una protección de secretos por
sí mismo. Verificar también `git ls-files`; aplicar escaneo según
`.harness/core/policies/security/secret-scanning.md`.

Cada contexto Docker tiene `.dockerignore` ajustado a sus límites: excluir Git,
secretos, caches y evidencia temporal; incluir código y paquetes realmente necesarios.
Si una app necesita un paquete hermano, usar contexto de repo y Dockerfile explícito
o un paquete resuelto; no ampliar montajes ni copiar secretos para resolver el build.
El harness instalado no reescribe estos archivos del producto.
