# Integridad administrada

El manifest registra paths y hashes SHA-256 del contenido distribuido. El scope
installation comprueba archivos presentes, rutas seguras y coincidencia de hashes.
El sincronizador protege cambios Git locales antes de reemplazar contenido.
El inventario incluye los wrappers y su helper `environment.sh`; el runtime nativo
distribuido no necesita un Dockerfile propio. Los hashes y el ownership se conservan
al pasar al contrato 3.x.

Se excluyen del hash del manifest el propio manifest y los archivos mixtos de
instrucciones raíz; sus regiones y límites se comprueban por contratos específicos.
Los hashes no son firmas ni detectan por sí solos un origen comprometido.

Las copias de skills para Codex y Claude proceden de la misma fuente. Los perfiles
seleccionan discovery; las skills locales adaptadas usan namespace project-* y no
permiten sobrescribir una skill corporativa o una salida local sin ownership previo.
