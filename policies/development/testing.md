# Testing

## Requirements

1. Un cambio de comportamiento **MUST** incluir evidencia de validación proporcional a
   su riesgo.
2. Una corrección **SHOULD** añadir una prueba que reproduzca el defecto antes de
   corregirlo.
3. Las pruebas **MUST NOT** eliminarse, omitirse, debilitarse ni hacerse menos
   deterministas únicamente para conseguir que CI pase.
4. Los dobles de prueba **MUST NOT** ocultar el contrato o efecto que el test pretende
   verificar.
5. Una prueba **SHOULD** comprobar resultados observables e invariantes, no detalles de
   implementación innecesarios.
6. Fallas preexistentes o validaciones no ejecutadas **MUST** reportarse; no deben
   atribuirse silenciosamente al cambio ni ocultarse.
7. Cambios de concurrencia, idempotencia, autorización o integridad **MUST** cubrir sus
   escenarios de riesgo relevantes.
