# Plantillas de instalación del consumidor

El sincronizador utiliza el router [AGENTS.md](AGENTS.md) y los wrappers bajo
`.harness/` como recursos administrados. Calcula el AGENTS resultante completo antes
de escribir y conserva las instrucciones locales fuera de sus marcadores.

El núcleo instalado y las adaptaciones de skills se generan desde fuentes únicas;
no se mantiene una copia corporativa editable dentro de esta plantilla. La metadata
vigente usa `.harness/core/manifest.json`, sin directorio corporate del layout 1.x.

`docs/`, `.harness_work/` y `.harness/project/` pertenecen al proyecto. La instalación
no los rellena ni traslada contenido heredado como efecto de actualizar metodología.

Para crear documentación o memoria cuando exista contenido real, consultar las
[plantillas opcionales de contexto](../context/README.md). Son recursos de referencia,
no un árbol que deba instalarse completo. No crear carpetas vacías por capacidad.
