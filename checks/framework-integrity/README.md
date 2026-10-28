# Integridad administrada

El manifest registra paths y hashes SHA-256 del contenido distribuido. El scope
installation comprueba archivos presentes, rutas seguras y coincidencia de hashes.
El sincronizador protege cambios Git locales antes de reemplazar contenido.

Se excluyen del hash del manifest el propio manifest y los archivos mixtos de
instrucciones raíz; sus regiones y límites se comprueban por contratos específicos.
Los hashes no son firmas ni detectan por sí solos un origen comprometido.

Las copias de skills para Codex y Claude proceden de la misma fuente. Los perfiles
seleccionan discovery; las skills locales adaptadas usan namespace project-* y no
permiten sobrescribir una skill corporativa o una salida local sin ownership previo.
