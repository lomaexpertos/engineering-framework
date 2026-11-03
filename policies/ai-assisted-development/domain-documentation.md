# Conocimiento vigente de módulos y dominios

## Alcance e intención

Esta Policy rige la investigación y documentación retrospectiva del sistema actual
(AS-IS), y su mantenimiento posterior. No define un TO-BE, una spec de cambio ni
autoriza implementar mejoras encontradas.

El agente **MUST** resolver la intención antes de elegir recorrido o workflow:

| Solicitud | Respuesta y alcance |
| --- | --- |
| Explicar negocio, comparar otros sistemas o discutir cómo debería funcionar algo, sin pedir análisis del repositorio actual. | Conversación normal; usar fuentes o herramientas si la pregunta las necesita. No imponer inspección local, recorrido, expediente, CLI del harness, subagentes, checks ni cambios documentales. |
| Analizar, investigar, validar o documentar un módulo o dominio del repositorio actual, identificado por la solicitud o su contexto. | Investigar su funcionamiento vigente de extremo a extremo y consolidarlo con `spec-documentar` en las fuentes canónicas del proyecto. |
| Explicar el módulo actual con una restricción como «solo analiza», «solo explícame», «sin archivos», «todavía no hagas cambios» o «no documentes». | Respetar el límite: consultar evidencia pertinente y responder sin persistir documentos ni activar un workflow de entrega por defecto. «Solo analiza y documenta» sí autoriza documentación, sin implementar cambios. |

La unidad solicitada **MUST** delimitar la profundidad: analizar un módulo cubre su
recorrido completo; validar una operación o resolver un cambio local no autoriza
ni exige reconstruir o documentar todo el módulo. Mantener la superficie afectada
de forma proporcional y respetar las restricciones expresas de escritura.

Una mención de contabilidad, pagos u otro dominio sensible **MUST NOT** activar
riesgo financiero por sí misma. En una investigación documental el recorrido depende
de los efectos y restricciones reales del trabajo: leer una regla financiera no
modifica dinero. Acceder a datos sensibles, ejecutar operaciones o cambiar contratos
sí puede activar controles específicos. Aplicar
[proportional-delivery.md](proportional-delivery.md) a la ejecución autorizada.

## Fuente canónica y jerarquía

1. La documentación **MUST** explicar comportamiento observado, reglas y razones de
   negocio conocidas; distinguir hechos, inferencias, discrepancias y límites de
   evidencia. El código, configuración y esquema vigentes son autoridad de su
   realización actual; una página desactualizada no los reemplaza.
2. **MUST** reutilizar el layout existente sin crear una segunda autoridad. El router
   del proyecto dirige a producto/sistema y a dominios o módulos; cada dominio dirige
   a sus detalles. Un módulo pequeño puede vivir en un README. Separar negocio,
   frontend, backend, datos u operación solo cuando facilite su consulta.
3. Dentro del ámbito solicitado, un mapa superior **MUST** localizar módulos o piezas,
   responsabilidades, relaciones y vacíos conocidos. No exige inventariar áreas
   ajenas. Los detalles y reglas compartidas tienen una sola fuente; los módulos
   consumidores la enlazan. Un índice **MUST NOT** afirmar cobertura total no observada.
4. Las páginas **MUST** servir sin el expediente, reporte o conversación que las
   originó. Enlazar puntos de entrada estables del código y documentos vigentes;
   conservar resultados de comandos, bitácoras y evidencia minuciosa fuera de docs.

## Cobertura de una investigación

Dentro del módulo y sus límites reales, la explicación **MUST** cubrir:

- Propósito, actores, vocabulario, casos de uso, reglas e invariantes; documentar
  razones conocidas sin inventar motivos históricos o requisitos del negocio.
- Flujos completos desde la entrada: pantallas, navegación y estado del frontend;
  rutas/API, autorizaciones, servicios y decisiones del backend; persistencia,
  consultas, jobs, eventos e integraciones hasta resultado, errores y recuperación.
  Si una capa no existe o no puede comprobarse, hacerlo visible.
- Configuración que cambia el comportamiento, valores por defecto relevantes y
  dependencias internas/externas, sin secretos ni datos sensibles.
- Relaciones aguas arriba y abajo, superficies compartidas, efectos y restricciones
  que ayudan a evaluar qué puede impactar un cambio.

El alcance **MUST NOT** convertirse en auditoría de todo el repositorio. Investigar
dependencias hasta explicar el contrato y efecto que ejercen sobre el módulo;
enlazar su fuente propia cuando el detalle pertenezca a otro dominio.

## Inventario verificable

1. El inventario **MUST** identificar las piezas relevantes de frontend, backend,
   datos y operación y relacionarlas con los flujos; un listado de archivos no
   sustituye la explicación. Declarar alcance, autoridad y tipo de fuentes vigentes,
   fecha de comprobación y huecos que limiten su exhaustividad. Listas minuciosas de
   archivos revisados y resultados de comandos pertenecen a evidencia temporal.
2. Para datos, **MUST** distinguir tablas, vistas y rutinas, identidad de conexión o
   esquema cuando importe, ownership y uso de lectura/escritura. Separar objetos
   propios, compartidos y solo referenciados sin duplicar su descripción canónica.
3. Cuando existan tablas en el alcance, **MUST** entregar sus totales identificados
   por base/conexión y esquema, con vistas separadas y los límites del inventario.
   Si solo se identifica un subconjunto, declarar su cantidad como parcial, no como
   el total del dominio. Los conteos **MUST** ser reconciliables con el inventario: indicar
   qué se cuenta, agrupación y exclusiones; contar cada objeto único una vez dentro
   de su categoría. Un objeto compartido puede tener varias relaciones de uso sin
   multiplicar el total. No equiparar modelos a tablas ni migraciones al esquema
   desplegado sin comprobarlo.
4. El alcance observado **MUST** distinguir código, DDL/migraciones y esquema
   inspeccionado en ejecución. Ausencia de acceso no demuestra ausencia de objetos.
   La investigación no autoriza conexiones a producción, extracción de datos ni
   ejecución de efectos. Si necesita ejecutar código del proyecto, conserva el
   aislamiento y controles de acceso aplicables.

## Mantenimiento incremental

1. Antes de modificar comportamiento, el agente **MUST** consultar las fuentes del
   área y comprobar en la implementación vigente las premisas afectadas. Las
   preguntas ordinarias pueden apoyarse en documentación suficiente sin reconstruir
   el módulo en cada conversación.
2. Un cambio material **MUST** actualizar en la misma entrega las explicaciones,
   flujos, mapas, inventarios y conteos que realmente afecte, incluidos consumidores
   de contratos compartidos. No exige investigar de nuevo todos los módulos.
3. Invariantes y decisiones **MUST** cambiar solo por conocimiento duradero nuevo o
   modificado. No crear ADR por inventariar un comportamiento existente ni reescribir
   decisiones históricas; conservar su vigencia y sucesión según la convención local.
4. Documentar lo existente **MUST NOT** presentar una capacidad de producto como
   implementada ni mover su roadmap por esa razón. Actualizar progreso o continuidad
   solo cuando el resultado real lo justifique; no generar documentos por casilla.

Para ubicación y actualización de fuentes, aplicar
[project-artifact-layout.md](project-artifact-layout.md) y
[documentation-maintenance.md](documentation-maintenance.md). `spec-documentar`
aporta el workflow y sus referencias distribuidas; esta Policy conserva la autoridad
del contrato de conocimiento vigente.
