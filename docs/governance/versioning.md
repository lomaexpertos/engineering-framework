# Versioning

Este contrato pertenece al productor del harness. Los productos consumidores usan
[releases de aplicaciones](../../policies/git/application-releases.md); su adopción
no activa publicación central ni cambia la autoridad de `VERSION` de este repositorio.

El framework está en desarrollo inicial, sin instalaciones, según confirmación del
responsable. La base es `0.1.0`, todavía sin publicar. Los números 1.x–4.x usados
durante el desarrollo fueron etiquetas internas; no representan releases adoptadas.
No se reescribe el historial ni la evidencia de aquellas iteraciones.

`VERSION` identifica la versión objetivo y `RELEASE_STATUS` su estado: `unreleased`
o `released`. Mientras sea un borrador inicial `0.x.x` con estado `unreleased`, los
cambios de código, Policies y Skills **MUST NOT** forzar incrementos por commit o
iniciativa. El SHA identifica cada iteración. Mantener `0.1.0` hasta preparar una
publicación explícita; publicar exige revisión del responsable, tag y actualización
del estado a `released`. Un push de rama no es una release.

El framework usa Semantic Versioning. Si se crea un tag de release, **MUST** usar
`vX.Y.Z` y coincidir con `VERSION`. El estado `released` significa versión publicada,
no instalación efectiva; la adopción de proyectos se informa por separado.

Después de publicar una versión, cambios al árbol distribuible **MUST** preparar
una nueva `VERSION`; su contenido publicado es inmutable. Un merge que modifica
solo documentación o automatización interna **MAY** conservarla; una publicación
idempotente no abre PRs cuando el consumidor ya tiene el mismo contenido.

- **Durante 0.x:** continuar en la serie inicial. Al preparar otra publicación,
  correcciones usan PATCH y cambios de capacidad o incompatibles usan MINOR con
  impacto documentado. Llegar a 1.0 requiere decisión explícita de estabilidad y
  publicación del responsable; no se deduce por cantidad de funciones o cambios.
- **PATCH desde 1.0:** erratas, enlaces, metadata o aclaraciones sin cambio material de
  obligación, procedimiento o contrato distribuido.
- **MINOR desde 1.0:** nuevas capacidades de distribución, Policies o Skills y reglas
  compatibles que aumentan requisitos sin invalidar integraciones soportadas.
- **MAJOR desde 1.0:** eliminación o debilitamiento de contratos, reorganización incompatible,
  cambios sustanciales de comportamiento esperado o migración obligatoria del
  formato consumidor.

Fuera del borrador inicial, cuando exista duda entre PATCH y MINOR, un cambio que pueda alterar una
decisión de implementación se trata como MINOR. Los MAJOR requieren revisión humana;
la configuración de auto-merge debe poder deshabilitarse por release o consumidor.

El validador exige estado explícito y limita la excepción de versión sin incremento
al borrador `0.x`. No desactiva hashes, ownership, validaciones ni protecciones contra
downgrade. El estado `unreleased` no puede usarse para alterar una versión publicada.
Esta última prohibición requiere revisión del cambio: el check lee el estado
declarado, no consulta releases remotas ni impide por sí solo editar ese estado.
Antes de activar publicación, su workflow debe comprobar tags existentes e impedir
reabrir/sobrescribir una versión publicada. Ese gate aún no está implementado.
