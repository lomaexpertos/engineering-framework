# Releases y workflows del monorepo

Consultar al configurar versionado o automatización. Autoridad:
`.harness/core/policies/git/application-releases.md`, desde la raíz del consumidor.

## Contrato de release por app

Registrar raíz de ejecución, configuración, ramas/canales, selector de cambios,
plugins, tag, artefacto y permisos. Un patrón de `.releaserc.yml` para una app
`api` es el siguiente; requiere instalar y comprobar versiones compatibles de
semantic-release, su integración monorepo y plugins en la imagen CI:

```yaml
branches:
  - main
extends:
  - semantic-release-monorepo
tagFormat: 'api-v${version}'
plugins:
  - - '@semantic-release/commit-analyzer'
    - preset: conventionalcommits
  - - '@semantic-release/release-notes-generator'
    - preset: conventionalcommits
  - '@semantic-release/github'
```

No es una plantilla ejecutada por el harness ni una certificación de plugins. La
imagen debe incluir `conventional-changelog-conventionalcommits` compatible con los
plugins y su configuración de preset. Comprobar que `!` y el footer de ruptura se
interpretan como major; el parser Angular por defecto no ofrece ese mismo contrato.
La integración elegida debe probar qué commits entran al ejecutar desde la raíz de
release, y si sobrescribe `tagFormat` u otros parámetros. Con
`semantic-release-monorepo`, la identidad npm de la app y su raíz de ejecución
participan en selección/tags: mantener nombre único alineado al ID y verificar el
tag efectivo. Su filtrado por directorio no cubre automáticamente un Dockerfile
fuera de esa raíz ni paquetes compartidos: resolverlo explícitamente, no asumir que
un filtro `paths` del workflow modifica el análisis de commits del publicador.

El proyecto elige integración compatible o un adaptador probado; no fijar aquí
versiones de producto que envejecen. Manifest y lockfile fijan las versiones elegidas.
Configurar plugins explícitos evita publicar npm en apps que solo generan imágenes,
binarios o GitHub Releases. El publicador puede producir release sin publicar npm.

SemVer inicial: `fix` → patch, `feat` → minor, `!`/`BREAKING CHANGE` → major. Comprobar
prioridad de reglas personalizadas y el formato real de commits después del merge
(incluido squash). No copiar reglas que conviertan cualquier docs/test/refactor en
minor. Para cambios compartidos, documentar consumidores y cómo reciben su release
cuando el selector no ve archivos en su raíz.

Si se adopta canal `rc`, declarar rama prerelease, identificador/canal `rc` y tags
como `api-v1.5.0-rc.1`; probar promoción a estable. No crearlo solo por tener
`.releaserc`. Mantener historial y tags completos para el cálculo. No editar a mano
una versión publicada ni reutilizar tags/artefactos; una falla parcial se recupera
reconciliando tag, release y artefacto existentes, sin force-push.

## Responsabilidades de GitHub Actions

Los nombres de archivos siguientes son sugeridos; pueden combinarse jobs si
mantienen gates y permisos separados. Se crean solo para capacidades existentes.

| Workflow | Evento y contrato |
| --- | --- |
| `verify.yml` | PR y referencias confiables: seleccionar apps afectadas incluyendo dependencias compartidas, validar harness y checks aplicables del producto en Docker. Un check requerido mantiene un resultado explícito aun si no hay apps afectadas; filtros por ruta no deben dejarlo pendiente indefinidamente. |
| `release.yml` | Push a rama estable/prerelease autorizada o ejecución manual restringida: exigir verificación/build del mismo SHA, historial/tags completos, dependencias fijadas y semantic-release por app. Usar resultado estructurado del publicador para distinguir release/no release, no inferirlo de logs. |
| `publish-artifacts.yml` o job de release | Publicar imagen/binario del SHA verificado y versión calculada, con digest o identidad inmutable y trazabilidad app-versión-SHA. Puede integrarse en el ciclo de plugins; definir recuperación si tag/release se publicó y el artefacto falló. |
| `preview.yml` | Abrir/actualizar/reabrir PR autorizado: desplegar su SHA en ambiente aislado, comprobar salud y entregar endpoints. Serializar por PR y evitar que un job viejo reemplace una versión nueva. |
| `preview-cleanup.yml` | PR cerrado/mergeado y reconciliación de expirados: destruir solo recursos del PR, de forma idempotente, con TTL, owner y registro de residuos. La limpieza también cubre previews creados parcialmente o PR que después dejan de afectar apps. |
| `deploy-production.yml` | Solo cuando exista producción: promover artefacto publicado inmutable con gates/autorización del ambiente, salud y recuperación según las Policies de deployment. Publicar una release no autoriza por sí solo el despliegue. |

La serialización de releases debe cubrir cualquier writer del mismo tag/canal;
en una integración monorepo que no garantice ejecución concurrente, serializar a
nivel repositorio. No cancelar a mitad una publicación; las cancelaciones de
verificación/preview necesitan limpieza y reconciliación. No confiar en que un tag
creado con `GITHUB_TOKEN` dispare otro workflow: integrar jobs o diseñar explícitamente
el encadenamiento y sus permisos. Un éxito de build no significa rollout aprobado.

## Confianza, operación y aceptación

- PR de forks o código no confiable: verificación sin secretos de publicación,
  producción ni acceso a runners privilegiados. Un job privilegiado no hace checkout
  ni ejecuta código arbitrario del PR; `pull_request_target`/`workflow_run` no hacen
  confiable ese código o sus artefactos. Validar origen, SHA y entradas antes de actuar.
- Permisos de lectura por defecto; escritura solo por job/capacidad necesaria.
  Preferir credenciales breves/OIDC cuando el destino lo soporte. Actions fijadas a
  SHA revisado y dependencias instaladas desde lockfile en la imagen correspondiente.
- Previews siguen `.harness/core/policies/infrastructure/environments/preview.md`:
  identidad sin colisiones, datos sintéticos, DNS/red/storage/credenciales separados,
  cuotas cuando apliquen, salud, destrucción y recuperación parcial. No exigir
  proveedores concretos ni exponer secretos al comentar URLs en un PR.
- Antes de activar publicación, comprobar selección con casos app A, app B,
  cambios compartidos, Dockerfile fuera de `src/`, sin release y breaking change;
  después, primer release, repetición del mismo SHA, concurrencia y falla parcial
  en un destino de prueba autorizado. `--dry-run` puede consultar red/credenciales
  y no prueba publicación, cleanup ni deploy; no tratarlo como simulador aislado.
- Documentar en `docs/` decisiones, mapas y operación duraderos; evidencia y
  experimentos en `.harness_work/`. No duplicar contratos ni trasladar documentos
  al layout del repositorio usado como referencia.

El harness distribuye estas guías y valida su presencia/enlaces. La implementación
de workflows, plugins, permisos y la evidencia de ejecución pertenece al consumidor;
no hay un linter semántico de sus releases ni Actions activado por instalarlo.

Fuentes primarias para comprobar compatibilidad al implementar:
[configuración de semantic-release](https://semantic-release.org/usage/configuration/),
[integración monorepo](https://github.com/pmowrer/semantic-release-monorepo),
[receta GitHub Actions](https://semantic-release.org/recipes/ci-configurations/github-actions/)
y [seguridad de Actions](https://docs.github.com/en/actions/reference/security/secure-use).
