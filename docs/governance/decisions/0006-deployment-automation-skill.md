# ADR-0006: Deployment automation Skill

- Status: Accepted
- Date: 2026-08-30

## Decision

1. La Skill se llama `implement-deployment-automation`.
2. Su primer perfil soportado es producción con Bash y Docker Compose.
3. Crea automatización que posteriormente ejecuta una persona o un sistema autorizado;
   la Skill no ejecuta deployments.
4. El entrypoint canónico vive en
   `infra/deploy/production/scripts/deploy.sh` y expone:

   ```text
   deploy.sh <precheck|install|release|status|diagnose|rollback> <unidad> [versión]
   ```

5. El código compartido vive bajo `scripts/lib/`; los helpers privilegiados, cuando
   sean imprescindibles, viven bajo `scripts/privileged/`.
6. Todo estado mutable, lock, temporal y secreto materializado vive bajo un
   `RUNTIME_DIR` explícito cuyo directorio se llama `runtime`. La automatización no
   escribe fuera de la raíz del repositorio y de ese runtime.
7. La Skill puede ejecutar validaciones locales sin efectos operativos, pero no puede
   invocar el entrypoint generado, SSH, `docker compose up`, recargas, cambios cloud ni
   acciones privilegiadas.
8. Cuando una API no tenga estrategia documentada, debe aclararse si utilizará
   `blue-green` o `recreate` antes de generar su automatización.

## Consequences

La creación de scripts queda separada de la operación de producción. La interfaz
estable permite documentar, validar y ejecutar cada deployment de forma determinista
sin convertir al agente que edita el repositorio en operador del ambiente.
