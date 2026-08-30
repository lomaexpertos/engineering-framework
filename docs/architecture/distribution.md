# Distribution architecture

## Flujo objetivo

1. Se publica un tag `vX.Y.Z` que coincide con `VERSION`.
2. CI valida la fuente y construye un artefacto determinista.
3. Una GitHub App obtiene un installation token temporal.
4. Por cada entrada habilitada en `projects.yml`, el publisher crea o reutiliza una
   branch estable para la versión destino.
5. El sincronizador actualiza contenido corporativo, Skills y `FRAMEWORK_VERSION`.
6. El bot crea o actualiza un Pull Request y solicita auto-merge cuando la política
   del consumidor lo permite.
7. Branch protection integra únicamente después de todos los checks requeridos.

## Idempotencia

La identidad lógica de una actualización es `(repository, framework_version)`. Se
reutilizará una branch determinista, por ejemplo
`engineering-framework/update-vX.Y.Z`. Reejecutar la publicación actualizará el
mismo PR abierto; si el repositorio ya contiene la versión y los mismos checksums,
no producirá cambios.

No se cerrará y recreará un PR salvo que su estado haga imposible actualizarlo. Esto
preserva conversación, auditoría y estabilidad de URLs.

## Seguridad

La automatización usará GitHub App con `Contents: read/write`,
`Pull requests: read/write` y `Metadata: read`. No usará PATs personales ni hará push
directo a la rama protegida.
