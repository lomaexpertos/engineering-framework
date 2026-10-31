# Aplicaciones en monorepo

## Alcance

Los proyectos nuevos de producto que usan el harness **MUST** iniciar con modelo
monorepo, incluso con una sola aplicación. Bibliotecas independientes, herramientas
y el propio productor del harness no necesitan simular aplicaciones. Repositorios
existentes conservan su arquitectura hasta una adopción autorizada; instalar o
actualizar el harness **MUST NOT** mover código ni activar CI o publicación.

## Estructura y fronteras

1. Cada aplicación nueva **MUST** vivir en `apps/<app-id>/`, con ID estable en
   lowercase kebab-case. API, frontend, worker, CLI y aplicaciones móviles o de
   escritorio pueden ser aplicaciones distintas; un módulo interno no se convierte
   en aplicación solo por tener un dominio de negocio diferente.
2. Cada aplicación **MUST** identificar su raíz de código, manifest nativo y lockfile
   cuando el gestor lo soporte, pruebas, contexto de construcción, comandos Docker
   y unidad de release. El perfil inicial **SHOULD** usar `Dockerfile`, `docker/`
   para configuración propia y `src/` para el proyecto nativo dentro de la app.
   Un stack con estructura propia puede usar la raíz de la app; documentar la ruta
   real, sin crear una segunda raíz ni mover código existente por uniformidad.
3. La separación entre apps **MUST** preservar fronteras: no importar código privado
   de una app desde otra. Reutilización real puede vivir en `packages/<package-id>/`
   con contrato, consumidores y ciclo de validación explícitos. No crear paquetes,
   workspaces, orquestadores o dependencias raíz sin necesidad actual.
4. Herramientas raíz compartidas no convierten el runtime de las apps en Node.
   Dependencias de ejecución, build y pruebas **MUST** permanecer en sus imágenes
   conforme a [aislamiento](../infrastructure/project-isolation.md).
5. Infraestructura de ambientes **MUST** conservar
   [su layout](../infrastructure/repository-layout.md); SQL conserva
   [su entrega canónica](../database/sql-change-delivery.md). No duplicarlos en cada
   app ni moverlos sin autorización. `docker/` de app no es otra raíz de deployment.
6. Documentación y memoria **MUST** conservar `docs/`, `.harness/` y `.harness_work/`
   según [el contrato existente](../ai-assisted-development/project-artifact-layout.md).
   Los README de raíz/app son entradas operativas breves, no autoridades paralelas
   sobre dominios, decisiones o roadmap.

## Gestión y cambios

- El README raíz **MUST** dirigir a `apps/README.md` cuando haya aplicaciones. Ese
  índice **MUST** identificar por app su propósito, raíz de código, runtime,
  build/contexto, validación, release y dependencias compartidas relevantes. Puede
  enlazar fuentes existentes en vez de duplicar comandos o inventarios.
- Un cambio compartido **MUST** determinar consumidores afectados, validación y
  releases necesarios; filtrar solamente por `apps/<id>/src/` es insuficiente para
  Dockerfiles, paquetes compartidos, lockfiles, configuración y automatización.
- Crear o retirar una app **MUST** actualizar el mapa, selección de CI y contrato
  de release afectados. Un cambio pequeño dentro de una app no reabre adopción ni
  auditoría de todo el monorepo: aplica
  [entrega proporcional](../ai-assisted-development/proportional-delivery.md).
- Versionado y automatización siguen
  [releases de aplicaciones](../git/application-releases.md); higiene de archivos
  sigue [repository-hygiene.md](../git/repository-hygiene.md).

## Adopción y controles

Usar [configure-monorepo](../../skills/configure-monorepo/SKILL.md) al inicializar
producto, agregar apps o adoptar el modelo. Un legado documenta diferencias y migra
solo el alcance autorizado. Excepciones normativas siguen
[precedence.md](../precedence.md).

Los checks de contexto/documentación comprueban disponibilidad y routing de estas
guías; no certifican la arquitectura ni el CI de cada producto. Esos controles
necesitan validación y runners del proyecto.
