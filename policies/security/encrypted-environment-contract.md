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

Estas rutas son relativas a la raíz del ambiente, normalmente
`infra/deploy/production/`. `.sops.yaml` vive en la raíz Git; las públicas van bajo
`config/age-recipients/<unidad>.age.pub` del ambiente según [sops-age.md](sops-age.md).
La identidad y los valores entregados siguen [material privado](sops-private-material.md),
fuera del repo. Producción materializa destinos bajo
`/home/appmanager/<project>-runtime`, conforme a
[runtime-state.md](../infrastructure/runtime-state.md); no es otro directorio de fuentes.

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
9. El contrato consumidor **MUST** declarar lectura, validación, obligatoriedad y
   defaults compatibles. Ciphertext/manifest/sanitizado son tres archivos coherentes;
   el consumidor es su contrato de uso, no otra copia de los valores. Sanitizar
   sustituye secretos por `<REDACTED>`, no crea otra fuente operativa.

## Cambios de variables

| Cambio | Acción en una misma revisión/commit |
| --- | --- |
| Alta | Importar valor mediante SOPS; añadir nombre a manifiesto/sanitizado y ajustar consumidor cuando corresponda. |
| Rotación del valor, mismo nombre | Cambiar valor cifrado; verificar manifiesto/sanitizado sin modificaciones artificiales. |
| Renombre | Añadir nuevo, mantener compatibilidad, desplegar/verificar y retirar anterior después; coherencia en cada fase. |
| Eliminación | Comprobar consumidores/rollback y retirar nombre de las tres fuentes. |
| Archivo nuevo | Declarar públicas/regla SOPS, ciphertext real, manifest, sanitizado, consumidor y destino runtime. Nunca derivar producción del sanitizado. |

No mostrar valores al comprobar preservación y compatibilidad. Preparar un commit
no publica configuración ni activa consumidores; los gates siguientes tienen su
propio alcance y autorización.

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
Tampoco comprueba permisos/ruta de identidad, archivos de entrega, ejecutores ni
archivos de públicas. Son obligaciones de adopción del proyecto, no cobertura
acreditada por el check de contratos. No requiere privada para una validación estática.

## Publication gates

Para publicar configuración/activar una unidad, la automatización **MUST** seguir,
sin revelar valores y dentro de autorización, este orden:

El materializador corre como usuario operativo, valida identidad/permisos y descifra
únicamente la unidad solicitada. Las claves privadas no se transmiten a consumidores.

1. Validar contrato consumidor.
2. Comprobar igualdad exacta de claves, sin duplicados; destinos/nombres válidos.
3. Verificar estado cifrado y recipients autorizados.
4. Descifrar de forma autorizada y comprobar preservación de valores.
5. Materializar `--check`: staging privado, validar conjunto y limpiar también al fallar, sin reemplazar
   el runtime vigente. El proyecto implementa esta interfaz; no es un comando del harness.
6. Publicar el conjunto completo, atómico bajo lock, con recuperación del anterior.
7. Activar exclusivamente consumidores afectados según su estrategia de deployment.
8. Verificar salud y flujo consumidor real, incluidos logs, sin credenciales.

Si falla cualquier gate anterior a la publicación, la configuración vigente
**MUST NOT** reemplazarse. Si falla la activación, restaurar el conjunto anterior
completo y la versión de consumidores según su estrategia de rollback, no archivos
individuales ni combinaciones de versiones.
No mezclar archivos de versiones distintas. La aplicación recibe dotenv reales
materializados, no sanitizados/ciphertexts ni claves age. Modificar un archivo
runtime no recarga el proceso: la activación es una operación explícita. Un gate
pendiente se declara pendiente; documentación o commit no acreditan haberlo ejecutado.
