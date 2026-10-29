# Investigación AS-IS de un dominio

Usar esta referencia al analizar, validar o documentar un módulo o dominio del
repositorio actual. El resultado es conocimiento duradero del comportamiento
vigente, conforme a `ai-assisted-development/domain-documentation.md`, no una
especificación de mejoras ni una implementación.

## Delimitación y autoridad

Partir del router y de la documentación canónica existente. Localizar el dominio
pedido en el código y delimitar sus capacidades, entradas y módulos vecinos; no
confundir una etiqueta de menú, un paquete o una tabla con todo el dominio. Si el
nombre tiene varias correspondencias materiales y el repositorio no permite
resolverlas, preguntar por ese límite. No pedir un cuestionario antes de investigar.
Si la petición se limita a una operación o un cambio local, cubrir su comportamiento
y conocimiento afectados sin investigar todo el módulo. Para dependencias vecinas,
explicar su contrato y efecto sobre el dominio y enlazar su fuente propia; no
convertir la investigación en una auditoría de todo el repositorio.

Una petición de investigación de un módulo o dominio de este sistema permite
investigar y documentar por defecto, salvo restricción explícita de salida.
«Solo analiza», sin pedir documentación, restringe la tarea a lectura y análisis;
«solo analiza y documenta» sí permite persistir documentación, sin modificar la
aplicación. Una explicación conceptual, TO-BE o sobre otro sistema se responde en
conversación: no inspeccionar este repositorio ni activar el CLI, un expediente o
documentación por asociación temática.

Contrastar la documentación con las fuentes vigentes. Si divergen, describir lo que
implementa el código y hacer visible la discrepancia; conservar las restricciones
normativas aplicables. No dar por cumplida una regla porque esté documentada ni
convertir un comportamiento accidental en una intención de negocio confirmada.
Seguir el recorrido proporcional al trabajo documental: estudiar contabilidad,
permisos o una integración no significa modificar dinero, seguridad o un contrato.
Investigar no acredita implementación ni ejecución de la funcionalidad.

No modificar código, esquemas ni datos como parte de esta Skill. Para verificar
comportamiento, respetar el ambiente de ejecución del proyecto; no ejecutar sus
runtimes ni instalar sus dependencias en el host. No iniciar servicios, migraciones
o seeds para rellenar una sección. Una conexión existente no autoriza consultar
producción: confirmar entorno y autorización antes de acceder; usar solo consultas
de lectura y el mínimo dato necesario. Sin acceso autorizado, continuar con fuentes
estáticas y declarar el límite. Nunca copiar credenciales, datos personales ni
valores sensibles a documentación o evidencia.

## Mapa de comportamiento y evidencia

Construir una explicación de las capacidades reales, no un inventario de archivos.
Investigar cada recorrido principal desde su entrada hasta sus efectos y seguir
las ramas que cambian permisos, estados, persistencia o comunicación con otros
módulos. Un dominio sin interfaz puede comenzar en un endpoint, job, comando o
evento. La ausencia de una capa solo se declara cuando se ha comprobado; lo que
no se revisó queda como desconocido.

Relacionar, según el sistema:

| Superficie | Conocimiento que debe quedar confirmado |
| --- | --- |
| Frontend | Rutas, navegación y estado de interfaz, pantallas, acciones, información presentada, formularios, validaciones y visibilidad por actor. Ocultar un botón no demuestra autorización del backend. |
| API o entrada | Operaciones, contratos relevantes, validación, autenticación/autorización, respuestas y errores que afectan al consumidor. |
| Backend y servicios | Responsabilidades de módulos, reglas, transiciones y coordinación; distinguir cálculo, consulta y efectos persistentes. |
| Persistencia | Conexiones lógicas, esquemas, tablas, vistas, relaciones y restricciones relevantes; identificar qué se lee y qué se escribe. |
| Procesamiento diferido | Jobs, productores/consumidores de eventos o colas, triggers y tareas programadas; efectos, fallas y garantías que realmente existan. |
| Integraciones | Sistemas llamados o que llaman al dominio, contratos, datos intercambiados y tratamiento observable de fallas. |

El mapa debe permitir seguir `entrada → autorización/regla → servicio → datos y
efectos` y entender quién consume el resultado. No basta con listar frontend,
backend y tablas sin explicar sus relaciones. Apoyar las conclusiones en rutas,
handlers, servicios, SQL/mappings, tests y configuración que las implementen;
una convención de nombres o una importación por sí sola no confirma el flujo.

Derivar un catálogo de capacidades con sus actores, permisos, condiciones de
entrada, resultados y estados/transiciones relevantes. Explicar reglas e
invariantes en lenguaje del dominio y su realización técnica cuando sea necesaria
para comprenderlas. Las razones de negocio requieren una fuente confirmada
—documentación vigente, decisión o aclaración del responsable—; si solo se conoce
la mecánica, documentarla sin inventar el motivo. Distinguir las restricciones
implementadas de las garantías que aún no se comprobaron.

## Inventario de datos sin inflar cobertura

Identificar bases o conexiones lógicas y esquemas antes de agrupar objetos. Usar
nombres confirmados en configuración pública, esquema, consultas o mappings. Un
nombre de entidad ORM, repositorio o clase no prueba el nombre físico de la tabla.
Si prefijos, tenants, sinónimos o configuración dinámica impiden resolverlo,
documentar esa resolución y el dato pendiente sin proponer nombres como hechos.

Para cada objeto relevante, conservar su identidad, propósito y relación con el
dominio. Un formato útil, adaptable al motor, es:

| Base/conexión lógica | Esquema | Objeto y tipo | Propiedad y uso | Responsabilidad y relaciones |
| --- | --- | --- | --- | --- |
| Nombre confirmado o límite de resolución | Esquema confirmado o no aplicable al motor | Nombre confirmado; tabla, vista u otro objeto | Propio/compartido/externo/desconocido; lectura, escritura o ambas | Qué representa, claves y relaciones necesarias para entender el dominio |

Propiedad y acceso son dimensiones distintas: una tabla compartida puede ser de
lectura y escritura. No inferir propiedad exclusiva porque el módulo escribe;
comprobar otros lectores/escritores relevantes. Describir columnas, claves,
restricciones y relaciones que expliquen comportamiento e integridad, sin copiar
todo el DDL si no aporta consulta independiente. Distinguir relaciones lógicas del
código de restricciones efectivamente declaradas en el esquema. Separar las vistas
de las tablas base y reconocer procedimientos, triggers u otros objetos cuando
cambien el flujo.

Cuando el dominio use tablas, entregar el total identificado por base/conexión y
esquema a partir del inventario, con vistas separadas. Si la cobertura es parcial,
indicar cuántas se identificaron y qué falta confirmar, sin fingir un total completo.
Declarar alcance, criterio y nivel de evidencia. Contar
cada objeto físico una sola vez por identidad base/esquema/nombre dentro del
alcance; no sumar aliases, modelos, joins, referencias repetidas ni categorías de
lectura y escritura como tablas distintas. Contar vistas por separado. Si varias
conexiones podrían apuntar al mismo objeto y no se puede confirmar, expresar la
incertidumbre antes de dar un total físico. No convertir conteos parciales en el
total de la base o de todo el sistema.

Distinguir un inventario declarado o referenciado en código/migraciones de un
inventario observado en una base real. Las migraciones pueden incluir objetos
retirados; las consultas pueden construir nombres dinámicos. Comprobar su vigencia
hasta donde permitan las fuentes y declarar los huecos. Para afirmar validación de
una base real se necesita introspección de lectura en el entorno autorizado;
identificar el entorno por su función, sin publicar hosts ni credenciales privados.
Un inventario estático puede ser útil y completo respecto de las fuentes revisadas
sin acreditar el estado desplegado.

## Dependencias, configuración y límites

Explicar relaciones entrantes y salientes: otros módulos que invocan o consumen el
dominio, servicios que este requiere, lectores/escritores de datos compartidos,
eventos, jobs e integraciones. Indicar el intercambio y el efecto de cada relación;
una lista de imports o nombres de servicios no explica el impacto.
Explicitar el radio de impacto al variar un contrato, configuración o tabla: qué
capacidades, consumidores y datos podrían afectarse, cómo se propaga el efecto y
dónde termina. Distinguir vínculos observados de impactos inferidos y sus límites.

Incluir configuración que cambie comportamiento: nombre público de opción o
variable, alcance —global, entorno, tenant, usuario o ejecución—, propósito,
condición y default público comprobado. Distinguir el default del código de la
configuración efectiva del despliegue; no suponer esta última. Para secretos,
explicar solamente su función y mecanismo de provisión sin valores. No copiar
archivos `.env` ni datos privados para aparentar detalle.

Documentar diagnóstico y límites reales cuando aporten comprensión: errores
relevantes, señales y correlación disponibles, fallas parciales, consistencia,
reintentos o idempotencia comprobados. Si una garantía o trazabilidad esperada falta,
dejar la brecha visible; documentarla no la implementa ni exige iniciar un proyecto
de corrección.

Calibrar cada afirmación con su evidencia:

- **Estática:** el código, esquema declarado o configuración permiten concluir el
  comportamiento implementado o esperado; no prueban el despliegue.
- **Prueba ejecutada:** acredita el caso y ambiente ensayados, con su cobertura y
  límites. Leer un test no equivale a ejecutarlo.
- **Observada en ejecución:** comportamiento o metadata comprobados en un entorno
  identificado y autorizado; no generalizar a otros entornos.
- **Desconocida o pendiente:** faltan fuentes, acceso o validación material. No
  sustituirla por «no aplica». Usar «no aplica» cuando la superficie esté ausente o
  fuera del alcance confirmado y explicar ese límite cuando sea relevante.

Estas distinciones pueden expresarse en prosa o junto al inventario, sin etiquetar
cada frase. Declarar el alcance y la fecha de comprobación del inventario, qué
fuentes vigentes lo sustentan y su autoridad —implementación, esquema declarado o
entorno observado—, sin un catálogo minucioso de archivos. Las incertidumbres
materiales deben seguir visibles en la documentación; los comandos, resultados de
pruebas aplicadas y evidencia detallada de investigación pertenecen al registro
temporal, si se necesita, o al resumen de entrega.

## Fuente permanente y actualización incremental

Actualizar primero la fuente canónica. Para un dominio sin ella, usar el recorrido
`docs/README.md` → `docs/domains/<dominio>/README.md`; respetar una organización
existente equivalente, sin migración implícita. La plantilla opcional está en
`templates/context/docs/domain.md` del núcleo. No copiar secciones vacías ni dejar
preguntas de la plantilla como si describieran el producto.

El README del dominio es una explicación moderadamente detallada: propósito y
límites, lenguaje, capacidades, actores/permisos, reglas, estados y flujos, datos,
dependencias/configuración y brechas conocidas. Debe permitir responder preguntas
habituales sin reconstruir todo el módulo desde el código. Una tabla, diagrama o
enlace a otro documento complementa la explicación, no la reemplaza.

Separar `data.md`, `flows.md` o `dependencies.md` únicamente si su extensión y
consulta independiente aportan valor; el README mantiene la visión general y
enlaces con condiciones de lectura. Un dominio pequeño conserva todo en su README.
No crear automáticamente una página por tabla o capacidad, carpetas vacías,
catálogos de archivos revisados ni un log de sesiones. Un mapa de código es opcional
y sirve para localizar implementación, no como única explicación del dominio. Las
razones y contratos deben poder entenderse sin abrir una spec, un reporte o una rama.

Al terminar la investigación y en cada cierre posterior con conocimiento nuevo o
cambio material, integrar solo las secciones afectadas, retirar afirmaciones
obsoletas y reparar el routing en el mismo cambio. No generar versiones paralelas,
reescribir el dominio por cada tarea ni añadir documentación por casilla. Para
consultas futuras, comenzar en esta fuente y revisar código de forma dirigida si
hay cambios, contradicciones, dudas o una decisión que requiera más certeza; no
prometer que nunca será necesario volver al código.

Comprobar correspondencia entre explicación, flujos y conteos, así como enlaces y
ubicación canónica. En la entrega, resumir alcance investigado, fuentes creadas o
actualizadas, validación realizada y límites relevantes. No afirmar que un análisis
estático equivale a pruebas ejecutadas, inventario de producción o cierre de una
implementación.
