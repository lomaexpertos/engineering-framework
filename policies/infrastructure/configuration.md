# Infrastructure configuration

## Purpose

Separar configuración versionable, secretos, plantillas operativas y estado generado
para impedir ambigüedad sobre ownership y ciclo de vida.

## Classification

Todo archivo consumido por un deployment **MUST** clasificarse como uno de estos tipos:

| Type | Versioning rule |
| --- | --- |
| Configuración no secreta | **MUST** versionarse. |
| Secreto | **MAY** versionarse únicamente cifrado y conforme a las Policies de seguridad. |
| Credencial deliberadamente efímera | **MAY** versionarse solo si está aislada de producción y es descartable. |
| Estado runtime | **MUST NOT** versionarse como configuración. |
| Plantilla operativa | **MUST** versionarse. |

## Requirements

1. Los nombres y rutas **SHOULD** expresar la clasificación del archivo.
2. La configuración no secreta **MUST** almacenarse bajo una ruta explícita como
   `config/` y contener valores operativos correctos para su ambiente.
3. Cuando una clave no secreta cambie entre ambientes, cada ambiente **MUST** declarar
   su valor sin depender de diferencias implícitas.
4. Un valor productivo **MUST NOT** copiarse a local o preview para simplificar la
   configuración.
5. Los contratos consumidores **MUST** declarar cómo se leen y validan las variables
   requeridas.
6. Los cambios incompatibles de configuración **MUST** definir el orden de rollout y
   su efecto sobre versiones que puedan coexistir.

Los valores secretos se rigen por `policies/security/secrets.md`; el estado generado
se rige por [`runtime-state.md`](runtime-state.md).
