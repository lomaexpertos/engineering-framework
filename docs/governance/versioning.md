# Versioning

El framework usa Semantic Versioning. `VERSION` es la autoridad de la actualización
distribuida desde un snapshot de `main`, por cualquiera de los dos canales. Si se crea
un tag, **MUST** usar `vX.Y.Z` y coincidir con `VERSION`.

Todo cambio al árbol distribuible **MUST** actualizar `VERSION`. Un merge que modifica
solo documentación o automatización interna **MAY** conservarla; una publicación
idempotente no abre PRs cuando el consumidor ya tiene el mismo contenido.

- **PATCH:** erratas, enlaces, metadata o aclaraciones sin cambio material de
  obligación, procedimiento o contrato distribuido.
- **MINOR:** nuevas capacidades de distribución, Policies o Skills y reglas
  compatibles que aumentan requisitos sin invalidar integraciones soportadas.
- **MAJOR:** eliminación o debilitamiento de contratos, reorganización incompatible,
  cambios sustanciales de comportamiento esperado o migración obligatoria del
  formato consumidor.

Cuando exista duda entre PATCH y MINOR, cualquier cambio que pueda alterar una
decisión de implementación se trata como MINOR. Los MAJOR requieren revisión humana;
la configuración de auto-merge debe poder deshabilitarse por release o consumidor.

Antes de la primera publicación efectiva de una versión, una corrección **MAY** avanzar
como PATCH aunque retire contenido que ningún consumidor recibió. La ausencia de
ejecuciones de publicación y de instalaciones de esa versión **MUST** verificarse y
quedar visible en el cambio. Después de distribuirla, aplican sin excepción las reglas
de compatibilidad anteriores.
