# Versión y procedencia

La distribución actual identifica versión, origen y SHA en `.harness/core/manifest.json`.
El preflight del sincronizador valida SemVer y procedencia coherentes, detecta
instalación incompleta y rechaza downgrades implícitos.

`FRAMEWORK_VERSION` corresponde al formato heredado probado en fixtures. Se reconoce
durante migración; no es una segunda autoridad vigente de versión.

La base inicial 0.1.0 aún no está publicada ni instalada. `RELEASE_STATUS` indica
el estado del productor; los borradores iniciales no exigen incrementar VERSION
por iteración. El schema de metadata es 2, independiente de SemVer. Node.js 22 o 24
es requisito del harness; no implica una release 3.x.

El scope installation del runtime consumidor comprueba presencia/formato de manifest
y contenido administrado. La validación de una futura release sigue requiriendo el
preflight de distribución; registrar un SHA no es autenticar al publicador.
