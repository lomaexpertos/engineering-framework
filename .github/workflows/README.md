# Workflows

Esta carpeta contiene:

- `validate-framework.yml`: valida cada push o merge recibido por `main` y puede
  ejecutarse manualmente;
- `publish-framework.yml`: se ejecuta manualmente desde `main`, autentica la GitHub
  App, itera `projects.yml`, copia únicamente el árbol permitido y crea o actualiza
  los PRs.

La instalación asistida de [`../../INSTALL.md`](../../INSTALL.md) es independiente
de estos workflows y no necesita GitHub App ni registro de consumidores. El canal
central queda disponible como alternativa: todas las entradas actuales de
`projects.yml` están deshabilitadas; sin habilitarlas no se publican cambios externos
ni se solicita un token de la App.

Los helpers, credenciales y detalles de publicación permanecen en este repositorio y
no se copian a consumidores. No se incluyen workflows vacíos porque producirían una
señal de control inexistente.

La publicación vuelve a ejecutar validación antes de solicitar credenciales; una
falla en `main` bloquea distribución aunque no revierta el commit.

El workflow publica el SHA inmutable seleccionado por el dispatch, fija las Actions
por commit completo y ejecuta un preflight de todos los consumidores antes de hacer
push. Los logs usan grupos por etapa y repositorio, anotaciones de error y un Step
Summary acumulativo. El job expira a los 45 minutos, antes de la expiración normal del
installation token.

## Repository configuration

`publish-framework.yml` consume estas configuraciones del repositorio central:

- variable `ENGINEERING_FRAMEWORK_GITHUB_APP_CLIENT_ID`;
- secret `ENGINEERING_FRAMEWORK_GITHUB_APP_PRIVATE_KEY`; y
- variable `ENGINEERING_FRAMEWORK_CONSUMER_ORGANIZATION`.

Además, cada consumidor con `auto_merge: true` debe habilitar squash merge, auto-merge
y eliminación automática de head branches, y proteger `main` con sus required checks.
Estas configuraciones no las cambia la App porque no tiene permisos administrativos.
