# Material privado: identidad y entrega de valores

## Alcance y rutas únicas

Perfil Linux/POSIX, incluido WSL, para operaciones reales SOPS/age. Consultar primero
[sops-age.md](sops-age.md). Las rutas siguientes son obligatorias, no ejemplos:

| Material | Ubicación | Permisos |
| --- | --- | --- |
| Identidad privada age, en formato nativo; admite varias autorizadas | `$HOME/.config/sops/age/keys.txt` | Archivo `0600`, directorios privados `0700` |
| Valor nuevo de una variable dotenv de una línea | `$HOME/.config/sops/inputs/<servicio>.<VARIABLE>` | Archivo `0600`, directorios privados `0700` |

`HOME` **MUST** corresponder al home real del usuario que ejecuta la operación;
**MUST NOT** modificarse para elegir otra ruta. Estación de preparación y servidor
son equipos distintos: ambos usan esta convención dentro del home de su usuario
operativo. No copiar la identidad a servidores por inferencia. En producción, el
materializador corre como `appmanager`; la aplicación no recibe su identidad.

Antes de crear, leer, ajustar permisos, importar o borrar, **MUST** validar propietario,
permisos, directorios reales y archivos regulares existentes, sin symlinks en sus
rutas/ancestros. El asistente prepara `.config/sops/` y subdirectorios privados y
ajusta archivos propios a los modos indicados antes de leer/descifrar, dentro de la
autorización existente. No cambiar permisos de `.config/` compartido. Un propietario
ajeno, privilegios insuficientes o un enlace exige detenerse, no `sudo` ni fallback.
No imprimir contenido. Identidad y entradas **MUST** permanecer fuera de checkout,
contexto de build, imágenes, artefactos, logs y mounts de aplicaciones.
Preparar este espacio privado es una fase del operador; no cambia `RUNTIME_DIR`
ni autoriza al deployment a escribir en otros destinos. El materializador usa la
identidad en lectura; los dotenv resultantes pertenecen al runtime de su unidad.

## Identidad ausente, incorrecta y ejecutores

- **MUST** consultar solo la ubicación canónica. Si falta al editar/materializar,
  indicar únicamente esa ruta para depositar la identidad existente. No recorrer
  disco, otros homes/equipos, pedirla por chat, generar otra ni cambiar recipients.
  Si no corresponde o falta quórum, informar desacuerdo sin datos privados y abortar
  sin modificar fuentes/runtime. Un archivo nuevo con públicas autorizadas no requiere
  la privada para cifrar; su posterior descifrado sí requiere acceso autorizado.
- Los ejecutores **MUST** fijar internamente la selección canónica; por ejemplo,
  `SOPS_AGE_KEY_FILE` apunta a `keys.txt` sin pedir exports/flags al usuario. XDG,
  variables de identidad, comandos de obtención o parámetros heredados **MUST NOT**
  redirigir ni agregar identidades silenciosamente: rechazar o normalizar de forma
  explícita, deshabilitando selecciones alternativas. No buscar otro material como
  recuperación automática. Los fixtures aislados pueden inyectar identidades
  sintéticas, distinguidos de operación real y sin acceso accidental al home real.

## Entrega e importación de valores

1. El usuario solo deposita el archivo de entrada. `<servicio>` **MUST** estar en el
   mapa del proyecto y `<VARIABLE>` ser un nombre dotenv válido; no permitir traversal,
   separadores o expansiones que escapen de `inputs/`.
2. La entrada contiene solo el valor, sin `VARIABLE=`, comillas añadidas ni instrucciones.
   Puede retirarse un único terminador final LF/CRLF; preservar los demás caracteres,
   incluidos espacios. Rechazar NUL y saltos internos. Valores multilínea requieren
   contrato distinto; esta restricción no altera el formato nativo de la identidad age.
3. El asistente/operador **MUST** importar y validar mediante SOPS, sin mostrar valores
   en chat/contexto, argumentos de procesos, logs, historial ni diffs. Usar stdin o
   memoria; no pedir al usuario ejecutar scripts ad hoc, Python o comandos con secretos.
4. Tras comprobar mediante descifrado autorizado que el valor se preservó y es
   recuperable en el ciphertext, retirar **solo** esa entrada temporal. Si falla o
   todavía no es posible verificarlo, conservarla privada para reintentar. Nunca
   retirar la identidad. Ante cambio concurrente de entrada/fuentes, detenerse;
   no sobrescribir ni borrar el archivo que otro proceso modificó.
5. No tomar valores de otros servicios ni usar sanitizados para generar producción.
   Un editor SOPS que necesite staging privado lo crea fuera del checkout; en el
   deployment usar el `RUNTIME_DIR` canónico. No exponer el buffer ni su contenido
   en errores del editor/proceso. No construir bloques `ENC[...]` manualmente.

Al faltar material, comunicar solo rutas y nombres necesarios. Al cerrar, informar
archivos/variables afectados, validaciones, commit/publicación/activación y pendientes,
sin valores. Recibir un archivo no autoriza nuevas operaciones sobre servidores.
