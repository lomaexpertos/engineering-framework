# Versión y procedencia

La instalación 2.x identifica versión, origen y SHA en `.harness/core/manifest.json`.
El preflight del sincronizador valida SemVer y procedencia coherentes, detecta
instalación incompleta y rechaza downgrades implícitos.

`FRAMEWORK_VERSION` corresponde al formato 1.x. Se reconoce durante migración, no es
una segunda autoridad vigente de versión en instalaciones 2.x.

El scope installation del runtime consumidor comprueba presencia/formato de manifest
y contenido administrado. La validación de una futura release sigue requiriendo el
preflight de distribución; registrar un SHA no es autenticar al publicador.
