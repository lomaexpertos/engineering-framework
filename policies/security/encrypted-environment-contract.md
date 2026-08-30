# Encrypted environment contract

## Applicability

Esta Policy aplica a ambientes que distribuyen archivos dotenv cifrados.

## Required representations

Cada archivo **MUST** mantener cuatro representaciones coherentes:

| Representation | Content |
| --- | --- |
| Ciphertext | Nombres y valores productivos cifrados. |
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

## Integrity requirements

1. Ciphertext, manifest y esquema sanitizado **MUST** contener exactamente el mismo
   conjunto de claves.
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

## Publication gates

Antes de publicar, la automatización **MUST** validar contrato consumidor, igualdad de
claves, estado SOPS, descifrado autorizado y materialización en un directorio privado.
El conjunto **MUST** reemplazarse de forma atómica bajo lock. Solo después deben
recrearse los consumidores afectados y verificarse salud, logs y flujo funcional sin
mostrar valores.

Si falla cualquier gate anterior a la publicación, la configuración vigente
**MUST NOT** reemplazarse. Si falla la activación, debe restaurarse el conjunto
anterior completo, no archivos individuales.
