# Secrets

## Purpose

Evitar la exposición de credenciales, llaves y otros valores sensibles durante su
creación, almacenamiento, distribución, uso y eliminación.

## Requirements

1. Los secretos **MUST** permanecer cifrados en reposo mediante un mecanismo aprobado.
2. Secretos en texto plano e identidades privadas **MUST NOT** incorporarse a Git.
3. Los secretos **MUST NOT** aparecer en logs, salida de comandos, mensajes de error,
   fixtures, documentación, diffs ni artefactos de CI.
4. Los secretos **MUST NOT** quedar embebidos en imágenes o capas de contenedores.
5. Los repositorios **MUST** documentar el mecanismo aprobado, responsables y contrato
   de consumo sin revelar valores.
6. Configuración pública **MUST NOT** cifrarse por costumbre; debe conservarse como
   configuración versionada y auditable.
7. Secretos de aplicación y credenciales exclusivas de automatización **MUST**
   mantenerse separados y exponerse solo al consumidor necesario.
8. Archivos descifrados **MUST** generarse fuera del checkout, con permisos
   restrictivos, y eliminarse cuando termine su uso.
9. Cuando deban persistir temporalmente, su ruta, retención, reemplazo atómico y
   recuperación **MUST** documentarse.
10. Un cambio de secretos **MUST** validar que ningún plaintext, export, respaldo,
    archivo de editor o identidad privada haya quedado en el estado de Git.

## Ephemeral credentials

Una credencial local o de preview **MAY** versionarse en texto plano únicamente si:

- fue creada específicamente para un ambiente desechable;
- no concede acceso a producción;
- funciona solo en recursos o redes aisladas;
- puede revocarse o recrearse sin impacto operativo; y
- su clasificación está documentada en el ambiente.

Copiar una credencial productiva a otro ambiente **MUST NOT** reclasificarla como
efímera.
