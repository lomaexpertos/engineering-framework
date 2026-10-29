# Controles de seguridad e infraestructura

Los scopes security, deployment y secrets comprueban fuentes y declaraciones;
no conceden permisos para desplegar, descifrar, rotar ni modificar servicios.

## Selección y autoridad

El proyecto adopta controles en `.harness/project/assurance.json`, separado de los
perfiles personales. Su presencia activa Gitleaks en el agregado; seleccionar
security explícitamente permite comprobarlo antes de adoptar ese agregado.
Contexto y documentación conservan independencia de esas herramientas.

Los contratos se descubren en fuentes bajo infra/deploy y pueden declararse en
rutas propias. Cachés ignoradas no abren obligaciones nuevas. Una ruta declarada
ausente, insegura o un contrato no soportado falla; una capacidad inexistente es
no aplicable. La operación está en [la guía instalada](../../checks/assurance/README.md).

## Alcance de la evidencia

Gitleaks fija versión y reglas. Analiza copias privadas y evita exclusiones locales
silenciosas. Distingue árbol/índice, cambios desde base explícita e historial local
disponible. El resultado conserva regla y ubicación; no valores, coincidencias,
parches ni salida cruda. Un resultado limpio no demuestra ausencia de todo secreto.

Deployment comprueba estructura, identidades, referencias, archivos, estrategias y
responsabilidades de migración/recuperación. No demuestra que la estrategia funcione,
exista capacidad suficiente o un servicio esté sano; eso requiere evidencia operativa.

Secretos compara listas independientes de destinos, ciphertexts y variables, verifica
placeholders y recipients contra la primera regla soportada y consulta estado cifrado
sin descifrar. No prueba autenticidad del MAC, acceso de descifrado, consumo correcto
por código ni activación; los gates operativos siguen vigentes.

## Dependencias y distribución

El núcleo distribuye un parser YAML fijado con licencia y procedencia, conservando
sus bytes originales. No mantiene una gramática propia ni requiere npm para operar.
Gitleaks y SOPS son herramientas transversales nativas: instalación explícita,
hashes fijados y conservación de ejecutables personales. Check y update no instalan.

Herramientas ausentes, timeout, reportes inválidos o cobertura incompleta impiden
acreditar aprobación. Los checks del producto conservan sus runners reproducibles.
