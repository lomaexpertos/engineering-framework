# Verificación y alcance

Implementación: d9b2ed4. Contrato canónico en policies/infrastructure/runtime-state.md;
callers en producción, automatización, seguridad de cambios y Skills de infraestructura.

Se corrigió la exigencia previa de basename runtime solo para producción. La regla
nueva fija /home/appmanager/<project>-runtime, identidad estable, rechazo previo a
mutación, ausencia de fallback y migración explícita. El almacenamiento interno de
Docker no se traslada por deducción. Ver review.md para revisión independiente.

Validación en imagen engineering-harness-validation:monorepo, target validation del
Dockerfile existente (Node 22.19.0 Alpine 3.22 por digest). Contenedores efímeros sin
red, UID/GID del operador y fuente montada read-only para tests. Comandos y evidencia
en closure.json; cuatro suites enfocadas aprobadas, además de fuente y lint. El
escaneo real usó engineering-harness-validation:monorepo-security con Gitleaks 8.30.1.
El motor de cierre tuvo montaje de escritura solo para registrar el expediente.

Los checks de contexto/documentación detectan Policy ausente o routing perdido.
No analizan semánticamente scripts ajenos ni inspeccionan servidores. Los prechecks
y fixtures requeridos por la Policy deben implementarse/validarse al adoptar cada
proyecto. No se ejecutó deploy, SSH, descifrado, migración ni preparación de host.

La ruta antes permitida y ahora prohibida hace incompatible el contrato; VERSION
4.0.0 e INSTALL documentan --allow-major, sin ampliar permiso sobre estado productivo.
No se necesita inventar formato de manifest ni CLI nuevo para la solicitud normativa.

Huecos adicionales informados: identidad Compose/redes/volúmenes, rutas Compose aún
SHOULD, subestructura runtime, persistencia, configuración privilegiada del host,
previews y parámetros operativos. Quedan como decisiones explícitas pendientes;
no fueron convertidos en defaults ni nuevas capacidades por esta tarea.
