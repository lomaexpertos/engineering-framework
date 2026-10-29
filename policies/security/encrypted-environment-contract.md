# Encrypted environment contract

## Applicability

Esta Policy aplica a ambientes que distribuyen archivos dotenv cifrados.

## Required representations

Cada archivo **MUST** mantener cuatro representaciones coherentes:

| Representation | Content |
| --- | --- |
| Ciphertext | Nombres de claves visibles y valores secretos cifrados, más metadata SOPS. |
| Manifest cerrado | Unidad, ciphertext, destino runtime y lista exacta de claves; nunca valores. |
| Esquema sanitizado | Las mismas claves con placeholders inequívocos. |
| Contrato consumidor | Lectura, validación y uso de cada variable. |

Las rutas canónicas son `secrets/<servicio>.sops.env` para ciphertext,
`config/secret-files.conf` para el manifest y `config/sanitized/<destino>.env` para el
esquema sanitizado. El manifest usa una entrada por archivo:

```text
# unit|ciphertext|runtime|exact_keys_csv
<unidad>|<ciphertext>|<destino-runtime>|CLAVE_A,CLAVE_B
```

Las rutas `ciphertext` son relativas a la raíz del ambiente; los destinos runtime
son rutas relativas a `RUNTIME_DIR`, sin traversal, rutas absolutas ni symlinks.
Para un destino `app.env`, el esquema sanitizado es `config/sanitized/app.env`;
para `app`, es `config/sanitized/app.env`. Los destinos anidados conservan sus
subdirectorios. No se añade una segunda extensión `.env` a un destino que ya la tenga.
Las claves usan identificadores dotenv ASCII; el prefijo `sops_` queda reservado a
metadata. Cada línea es una asignación literal `CLAVE=valor`: no se evalúan shell,
`export`, interpolaciones ni archivos externos.

## Integrity requirements

1. Ciphertext, manifest y esquema sanitizado **MUST** contener exactamente el mismo
   conjunto de claves de variables; la metadata SOPS no forma parte de ese conjunto.
2. El manifest **MUST** actuar como allowlist y **MUST** rechazar ciphertext no
   declarado, destinos duplicados y claves adicionales, faltantes o duplicadas.
3. Un archivo consumido por runtime **MUST** estar declarado en el manifest.
4. El esquema sanitizado **MUST NOT** utilizarse como configuración runtime, fuente de
   cifrado ni respaldo.
5. Los placeholders de secretos **MUST** ser inequívocos, por ejemplo `<REDACTED>`, y
   **MUST NOT** parecer credenciales utilizables.
6. Cambiar el conjunto de variables **MUST** actualizar todas las representaciones
   afectadas en la misma unidad de revisión.
7. Un renombre incompatible **MUST** realizarse como migración: convivencia temporal,
   adopción por consumidores y retiro posterior de la clave anterior.
8. Antes de eliminar una clave, el cambio **MUST** comprobar que ninguna versión con
   posibilidad de ejecución o rollback continúe consumiéndola.

## Control estructural instalado

El check de contratos usa una lista independiente `runtime_files` declarada por el
proyecto junto con la raíz del ambiente. Su forma está en
[secret-contract.schema.json](../../schemas/secret-contract.schema.json). No se
deduce esa lista del propio manifest: ambos conjuntos deben coincidir exactamente.
Unidad y ciphertext pueden tener varias entradas por unidad; destinos, archivos y
claves no pueden duplicarse. Cuando existe `deployment.yaml`, cada unidad debe
pertenecer a su inventario.

El control exige ciphertexts dotenv declarados bajo `secrets/`, sin archivos extra,
claves de variables idénticas y placeholders sanitizados exactamente `<REDACTED>`.
Contrasta recipients age con la primera regla aplicable de `.sops.yaml` en la raíz
del repositorio y comprueba `encrypted: true` mediante SOPS. Un archivo ausente,
formato no soportado o herramienta faltante no cuenta como aprobación. La guía de
operación de checks explica cómo seleccionar y registrar el contrato.

La inspección no descifra, no materializa archivos, no ejecuta consumidores y no
acredita que una aplicación realmente lea cada variable. Revisar contrato consumidor,
compatibilidad de versiones y gates de publicación sigue siendo obligatorio.

## Publication gates

Antes de publicar, la automatización **MUST** validar contrato consumidor, igualdad de
claves, estado SOPS, descifrado autorizado y materialización en un directorio privado.
El conjunto **MUST** reemplazarse de forma atómica bajo lock. Solo después deben
recrearse los consumidores afectados y verificarse salud, logs y flujo funcional sin
mostrar valores.

Si falla cualquier gate anterior a la publicación, la configuración vigente
**MUST NOT** reemplazarse. Si falla la activación, debe restaurarse el conjunto
anterior completo, no archivos individuales.
