# Releases de aplicaciones

## Alcance y autoridad

Aplica a aplicaciones de producto del
[modelo monorepo](../development/monorepo.md). No sustituye el versionado del
productor del harness, su `VERSION`, sus snapshots ni el canal central suspendido.
Repositorios heredados conservan su contrato vigente hasta una adopción autorizada.

## Identidad y versión

1. El estándar inicial **MUST** ser release independiente por aplicación mediante
   **semantic-release**, SemVer y Conventional Commits. Cada app **MUST** tener una
   configuración versionada `.releaserc.*` o `release.config.*` con raíz de ejecución,
   ramas, plugins y formato de tag inequívocos; no depender de defaults desconocidos.
2. El tag inicial **MUST** usar `<app-id>-v${version}`, por ejemplo `api-v1.4.0`,
   sin colisiones entre apps. Un esquema coordinado diferente necesita razón y
   contrato explícitos; no introducir un `VERSION` global como autoridad accidental.
3. El cálculo **MUST** analizar solo los cambios atribuibles a la app y los cambios
   compartidos que le afecten. El scope del commit por sí solo no selecciona apps:
   `semantic-release` sin adaptación no filtra por rutas. Elegir una integración
   monorepo compatible y comprobar su selección antes de publicar.
4. El contrato **MUST** definir cambios incompatibles como major, funcionalidades
   como minor y correcciones como patch. Docs, tests o cambios sin impacto publicado
   no fuerzan release por defecto. Cambios operativos o compartidos que sí alteren
   el artefacto **MUST** tener tratamiento explícito y comprobado.
5. Tags y resultado del publicador **MUST** ser autoridad de versión publicada.
   Un `package.json` auxiliar puede identificar apps no Node y usar `private: true`
   booleano; no implica publicar npm ni actualizar manifests nativos automáticamente.

## Publicación y CI

- Las apps **MUST** declarar rama estable protegida; canales prerelease como `rc`
  se crean solo si el producto los usa y con SemVer, tags y destino definidos.
  Un archivo `.releaserc` no es un canal RC; un preview por PR no exige release.
- GitHub Actions **MUST** definir verificación de PR y publicación desde referencias
  confiables, con historial/tags suficientes, herramientas fijadas y serialización
  que impida carreras de tags. Pruebas/build del mismo SHA **MUST** aprobarse antes
  de publicar; no publicar una versión vacía por ejecutar siempre el workflow.
- Una app desplegable con revisión remota **MUST** definir creación/actualización
  de previews y limpieza al cerrar el PR, con expiración de huérfanos y responsable.
  Apps sin preview viable documentan esa limitación y su validación alternativa;
  no se exige crear infraestructura ficticia.
- Release, construcción/publicación de artefactos y deployment **MUST** tener
  responsabilidades y permisos distinguibles. El deployment usa el artefacto
  inmutable del SHA/version publicados, con gates y recuperación de
  [producción](../infrastructure/environments/production.md).
- Los workflows **MUST NOT** ejecutar código no confiable con secretos/permisos
  privilegiados. Permisos mínimos por job, datos de PR tratados como entrada,
  actions fijadas a SHA revisado y aislamiento/limpieza de
  [preview](../infrastructure/environments/preview.md) son parte de la adopción.

## Implementación y límites

La [guía de workflows y releases](../../skills/configure-monorepo/references/releases-and-workflows.md)
describe decisiones y criterios verificables, sin imponer proveedor de hosting,
registry ni plugins obsoletos. Instalar el harness **MUST NOT** instalar npm del
producto, crear tokens, habilitar Actions, publicar tags ni desplegar. Adoptar estas
reglas no autoriza operaciones externas. Excepciones siguen
[precedence.md](../precedence.md).
