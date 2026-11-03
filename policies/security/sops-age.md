# SOPS and age secret management

## Applicability

Esta Policy aplica cuando un repositorio distribuye secretos productivos versionados
como archivos. En ese caso, SOPS con age es el mecanismo corporativo definido por este
estándar.

## Lectura por operación

- Identidad privada, entrega de valores y selección de ejecutores:
  [material privado](sops-private-material.md).
- Rutas versionadas, alta/rotación/renombre y gates de dotenv:
  [contrato de entorno](encrypted-environment-contract.md).
- Un proyecto nuevo o existente **MUST** adoptar estas fuentes como autoridad única;
  sus README/instrucciones enlazan las reglas y documentan solo mapa de unidades,
  servicios, usuarios operativos, públicas y consumidores. No copiar manuales por app.
  Adoptar documentación no autoriza generar/rotar identidades ni operar servidores.

## Claves y responsabilidades

SOPS cifra valores con una clave simétrica interna; age protege esa clave para las
públicas autorizadas. La privada recupera la clave interna; no sustituye a la pública
para cifrar. En una edición normal se recupera y reutiliza la clave interna, sin pedir
otro archivo de pública. Crear documento, rotar clave interna, cambiar recipients y
rotar una credencial son operaciones distintas.

| Operación | Material y responsable |
| --- | --- |
| Documento nuevo | Operador/asistente: públicas autorizadas y valores reales; no requiere privada para cifrar. |
| Editar existente | Operador/asistente: privada correspondiente, conservando recipients y demás valores. |
| Materializar una unidad | Usuario operativo del servidor: identidad autorizada en su propio home. |
| Build/publicación de imagen, checks estáticos CI | Ninguna identidad age ni secretos reales de aplicación. |
| Ejecutar backend | Variables reales materializadas; nunca identidad age ni ciphertext/sanitizado como configuración. |

La pública no descifra; disponer de privada en la estación no habilita al servidor.
Si hay grupos/umbral, documentar el quórum; no asumir que una privada basta. El perfil
estático actual no soporta esos grupos. Referencia:
[edición de SOPS](https://github.com/getsops/sops/blob/v3.13.3/cmd/sops/edit.go).

## Requirements

1. Todo archivo de secretos productivos versionado **MUST** permanecer cifrado por
   SOPS. La configuración pública sigue la clasificación de
   [secrets.md](secrets.md).
2. Los archivos **MUST** identificar su condición cifrada mediante `.sops` antes de la
   extensión del formato, por ejemplo `service.sops.env` o `tls-key.sops.pem`.
3. El repositorio **MUST** incluir una política `.sops.yaml` que cubra explícitamente
   las rutas y recipients autorizados.
4. Las públicas autorizadas **MUST** versionarse en
   `config/age-recipients/<unidad>.age.pub`, relativas a la raíz del ambiente para
   deployments adoptados. Un legado puede mantener una ruta canónica equivalente
   explícitamente documentada; no elegir rutas distintas en cada intervención.
   `.sops.yaml` de raíz vincula ciphertexts con esas públicas; mantener su coherencia.
5. Las identidades privadas de age **MUST NOT** almacenarse en el repositorio,
   artefactos de CI, imágenes ni logs.
6. Un secreto **MUST** editarse mediante SOPS en un entorno confiable; bloques `ENC[...]`
   **MUST NOT** modificarse manualmente.
7. El plaintext **MUST NOT** imprimirse en terminal ni conservarse dentro del checkout.
8. Cambiar recipients **MUST** tratarse como operación autorizada independiente del
   cambio de variables.
   No agregar un recipient propio ni usar `updatekeys` para resolver una privada
   ausente o añadir una variable ordinaria. No generar identidades automáticamente.
9. Agregar o retirar recipients **MUST** actualizar la política, ejecutar
   `sops updatekeys` sobre cada ciphertext afectado y validar acceso antes de retirar
   la identidad anterior.
10. CI **SHOULD** comprobar que `sops filestatus` informe `encrypted: true` para cada
    archivo; el código de salida por sí solo no prueba ese estado. Los recipients
    **SHOULD** contrastarse por separado entre la metadata del ciphertext y la regla
    aplicable de `.sops.yaml`, sin mostrar valores. `filestatus` no verifica recipients
    ni demuestra acceso de descifrado; esa comprobación autorizada conserva sus gates.
11. **MUST** verificar sin mostrar contenido que los valores no afectados se preservan
    y las claves finales son las esperadas; ciphertext distinto no implica valor
    cambiado. Detenerse ante cambios concurrentes. Identidades de aplicación y
    credenciales SSH/registry del automatizador **MUST** mantenerse separadas.

Esta Policy complementa [`secrets.md`](secrets.md). El contrato de archivos dotenv se
define en [`encrypted-environment-contract.md`](encrypted-environment-contract.md).

## Perfil de comprobación estática

Al configurar reglas para el check del harness, consultar su
[perfil soportado](../../checks/assurance/sops-profile.md). Formatos/proveedores fuera
de ese perfil necesitan controles propios o ampliación explícita, sin rebajar esta
Policy. `filestatus` no sustituye descifrado autorizado ni activación.
