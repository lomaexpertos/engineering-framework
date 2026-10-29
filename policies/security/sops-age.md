# SOPS and age secret management

## Applicability

Esta Policy aplica cuando un repositorio distribuye secretos productivos versionados
como archivos. En ese caso, SOPS con age es el mecanismo corporativo definido por este
estándar.

## Requirements

1. Todo archivo de secretos productivos versionado **MUST** permanecer cifrado por
   SOPS. La configuración pública sigue la clasificación de
   [secrets.md](secrets.md).
2. Los archivos **MUST** identificar su condición cifrada mediante `.sops` antes de la
   extensión del formato, por ejemplo `service.sops.env` o `tls-key.sops.pem`.
3. El repositorio **MUST** incluir una política `.sops.yaml` que cubra explícitamente
   las rutas y recipients autorizados.
4. Los recipients públicos de age **MAY** versionarse como configuración pública, con
   una ruta y formato explícitos.
5. Las identidades privadas de age **MUST NOT** almacenarse en el repositorio,
   artefactos de CI, imágenes ni logs.
6. Un secreto **MUST** editarse mediante SOPS en un entorno confiable; bloques `ENC[...]`
   **MUST NOT** modificarse manualmente.
7. El plaintext **MUST NOT** imprimirse en terminal ni conservarse dentro del checkout.
8. Cambiar recipients **MUST** tratarse como operación autorizada independiente del
   cambio de variables.
9. Agregar o retirar recipients **MUST** actualizar la política, ejecutar
   `sops updatekeys` sobre cada ciphertext afectado y validar acceso antes de retirar
   la identidad anterior.
10. CI **SHOULD** comprobar que `sops filestatus` informe `encrypted: true` para cada
    archivo; el código de salida por sí solo no prueba ese estado. Los recipients
    **SHOULD** contrastarse por separado entre la metadata del ciphertext y la regla
    aplicable de `.sops.yaml`, sin mostrar valores. `filestatus` no verifica recipients
    ni demuestra acceso de descifrado; esa comprobación autorizada conserva sus gates.

Esta Policy complementa [`secrets.md`](secrets.md). El contrato de archivos dotenv se
define en [`encrypted-environment-contract.md`](encrypted-environment-contract.md).
