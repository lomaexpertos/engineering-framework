# Versioning

El framework usa Semantic Versioning. `VERSION`, el tag `vX.Y.Z` y la versión del
artefacto deben coincidir.

- **PATCH:** erratas, enlaces, metadata o aclaraciones sin cambio material de
  obligación, procedimiento o contrato distribuido.
- **MINOR:** nuevas Policies o Skills y reglas compatibles que aumentan requisitos
  sin invalidar integraciones soportadas.
- **MAJOR:** eliminación o debilitamiento de contratos, reorganización incompatible,
  cambios sustanciales de comportamiento esperado o migración obligatoria del
  formato consumidor.

Cuando exista duda entre PATCH y MINOR, cualquier cambio que pueda alterar una
decisión de implementación se trata como MINOR. Los MAJOR requieren revisión humana;
la configuración de auto-merge debe poder deshabilitarse por release o consumidor.
