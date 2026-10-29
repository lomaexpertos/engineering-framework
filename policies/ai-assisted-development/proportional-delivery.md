# Entrega proporcional

## Alcance y autoridad

Esta Policy es la fuente única para elegir recorrido, definición, delegación,
revisión y registro de cierre. Las Policies especializadas conservan sus controles
intrínsecos. El tamaño del diff por sí solo no determina el riesgo.
El esfuerzo de coordinación debe aportar confianza o continuidad: una etapa o un
documento sin ese valor añade costo sin mejorar la entrega.

## Selección del recorrido

La selección aplica al trabajo de entrega autorizado. Explicar negocio, comparar
sistemas o discutir un deber ser puede resolverse en conversación sin recorrido,
expediente, CLI ni delegación; la frontera con investigar el repositorio actual está
en [domain-documentation.md](domain-documentation.md).

El coordinador **MUST** elegir el recorrido según impacto, incertidumbre,
reversibilidad y superficies afectadas, usando la solicitud y el repositorio.
**MUST NOT** pedir al usuario que clasifique la tarea ni crear un formulario,
matriz de triage o preguntas de trámite. Solo una decisión material que no pueda
resolverse con evidencia requiere aclaración. Si aparece un riesgo nuevo, **MUST**
elevar el recorrido antes de continuar la decisión afectada.

| Recorrido | Condición | Ejecución y revisión |
| --- | --- | --- |
| Mínimo (`minimal`) | Cambio claro, local, fácilmente reversible y sin impacto material ni incertidumbre relevante. | Ejecución directa o un trabajador; comprobación del coordinador, sin definición ni revisores adicionales obligatorios. |
| Estándar (`standard`) | Cambio acotado que supera el mínimo; incluye superficie compartida o incertidumbre material. | Un trabajador y un revisor funcional independiente que agrupa las dimensiones aplicables. Definición solo si la incertidumbre la requiere. |
| Reforzado (`reinforced`) | Riesgo material en seguridad, integridad de datos, dinero, migraciones, contratos públicos, producción o efectos irreversibles. | Definición y flujo completo; revisiones independientes de las dimensiones activadas por el riesgo y cierre de ocho categorías. |

Los riesgos `security`, `data_integrity`, `financial`, `migration`,
`public_contract`, `production` e `irreversible` **MUST** forzar reforzado.
`shared_surface` y `uncertainty` **MUST** exigir al menos estándar.
Estos identificadores expresan riesgos afectados, no una obligación de marcar
todos los dominios que existan en el repositorio. Leer y documentar reglas de dinero
no activa `financial` por el nombre del módulo: clasificar efectos y restricciones
reales del trabajo, incluidos acceso sensible y operaciones que se ejecutarán.
Ausencia de `track` en un
expediente o workflow heredado conserva reforzado; no autoriza rebajar controles.
Un mínimo de proyecto más estricto prevalece.

## Artefactos y continuidad

1. En mínimo directo, el registro de iniciativa **MAY** omitirse. No son requisitos
   los perfiles personales, el CLI de agentes, una spec, un plan ni preguntas.
   Si se usa un trabajador del ejecutor, **MUST** existir el registro mínimo que
   necesita su encargo; `work create --track minimal --reason ...` lo crea compacto.
2. Un registro nuevo mínimo o estándar **MUST** conservar recorrido y razón breve;
   no requiere `brief.md`, `resume.md` ni una carpeta por etapa por defecto.
   Registrar riesgos observados permite comprobar el piso del recorrido.
3. Definición **MUST** resolver incertidumbre de comportamiento, alcance o
   aceptación; **MUST NOT** activarse solo porque existe el rol `definition`.
   En estándar se activa por `needs_definition` o riesgo `uncertainty`.
   Una definición no obliga a crear una spec formal si el encargo basta.
4. Specs y planes **MUST** crearse solo por solicitud, conocimiento significativo
   que deba aprobarse o complejidad que necesite esa continuidad. Documentación,
   decisiones, invariantes, roadmap y memoria **MUST** actualizarse cuando cambie
   conocimiento significativo o sea necesario continuar el trabajo; **MUST NOT**
   generar cambios por casilla ni repetir evidencia de ejecución en docs.

## Validación, revisión y cierre

1. Todo recorrido **MUST** verificar el resultado integrado y declarar pruebas
   ejecutadas, fallidas u omitidas con evidencia. **MUST NOT** reducir checks de CI,
   controles del proyecto, pruebas necesarias, aislamiento ni dependencias del
   ambiente. Logging crítico y controles de seguridad/datos siguen siendo exigibles.
2. Mínimo **MUST NOT** imponer matriz de dimensiones, motivos por cada no aplicable,
   revisión independiente ni ocho categorías de cierre. La respuesta puede resumir
   cambio y comprobación. Si existe expediente, usa cierre compacto.
3. Estándar **MUST** tener un revisor funcional distinto del implementador que cubra
   comportamiento, pruebas y dimensiones afectadas dentro del mismo encargo.
   No requiere un revisor por dimensión ni motivos para dimensiones ausentes.
4. Reforzado **MUST** conservar revisiones independientes por riesgo, cobertura
   explícita de dimensiones aplicables y cierre completo de ocho categorías según
   [change-review.md](change-review.md) e
   [initiative-lifecycle.md](initiative-lifecycle.md).
5. Sin capacidad o autorización para una revisión requerida, el coordinador
   **MUST** declarar la limitación y mantenerla pendiente; **MUST NOT** presentar
   autoevaluación como independencia. Delegación nunca amplía autorización.
6. El cierre compacto de mínimo/estándar **MUST** identificar responsable, fecha,
   resumen, validación y fuentes útiles existentes; admite fuentes vacías si la
   evidencia está en el registro. No exige ocho declaraciones `not_applicable`.
   Un expediente cerrado conserva las mismas protecciones de retención y purga.

## Excepciones y controles

Una excepción usa [precedence.md](../precedence.md); elegir mínimo no es una
excepción a una Policy. Los esquemas y el runtime comprueban campos, pisos de riesgo,
transiciones y cierre; el coordinador sigue respondiendo por la clasificación,
la evidencia, la independencia y la suficiencia semántica de la entrega.
