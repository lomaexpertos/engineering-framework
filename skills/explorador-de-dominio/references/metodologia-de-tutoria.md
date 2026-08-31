# Metodología de tutoría de dominio

## Contenido

1. Contrato de aprendizaje
2. Fases de exploración
3. Diseño de cada ciclo
4. Comprobación de comprensión
5. Adaptación de profundidad
6. Cierre y transferencia

## 1. Contrato de aprendizaje

Definir al inicio:

- Qué debe poder explicar, diagnosticar o decidir la persona al terminar.
- Para qué etapa o situación concreta necesita ese criterio.
- Qué profundidad no es necesaria todavía.
- Qué experiencia previa puede reutilizar.
- Qué evidencia del aprendizaje será suficiente: explicación, caso resuelto, preguntas preparadas o revisión de una propuesta.

Convertir objetivos vagos como “entender inventarios” en capacidades observables, por ejemplo: “explicar por qué el stock físico, disponible, reservado y contable pueden diferir, y preparar preguntas para decidir cómo tratarlos en este proyecto”.

## 2. Fases de exploración

### Fase A. Orientación

Explicar:

- Qué problema de negocio origina el proceso.
- Qué valor, obligación o riesgo atiende.
- Qué actores participan y quién responde por el resultado.
- Qué evento lo inicia y qué evidencia demuestra que terminó.
- Un ejemplo mínimo de inicio a fin.
- Dos o tres confusiones frecuentes.

Evitar aún una solución tecnológica.

### Fase B. Mapa del dominio

Identificar, cuando aplique:

- Propósito, actores y responsabilidades.
- Entradas, salidas, documentos y evidencias.
- Eventos, estados, transiciones y momentos de irreversibilidad.
- Reglas, cálculos, autorizaciones y segregación de funciones.
- Dinero, inventario, capacidad, contabilidad, impuestos o contratos.
- Excepciones, correcciones, cancelaciones, reversión y conciliación.
- Integraciones, terceros y operación degradada.
- Auditoría, privacidad, fraude, conservación y métricas.
- Dependencias anteriores y efectos posteriores.

Clasificar cada nodo como `fundamental`, `importante`, `contextual`, `avanzado` o `no aplicable por ahora`. Añadir una razón; no clasificar por intuición sin relacionarlo con el objetivo actual.

### Fase C. Puntos ciegos

Por cada punto ciego relevante explicar:

1. Qué es.
2. Por qué suele omitirse.
3. Qué daño o inconsistencia puede producir.
4. Qué pregunta lo descubre.
5. Qué rol y evidencia pueden resolverlo.
6. Cuándo debe resolverse.

Priorizar por impacto y probabilidad. No recitar toda la lista de heurísticas.

### Fase D. Ruta de aprendizaje

Ordenar el mapa en:

- Entender primero: prerrequisitos conceptuales.
- Entender antes de definir el módulo: reglas y excepciones que cambian el alcance.
- Confirmar con responsables: hechos particulares y decisiones no deducibles.
- Revisar después: conocimiento valioso que no bloquea.

Enseñar de una a tres tarjetas por ciclo. Relacionar cada tarjeta con una decisión real.

### Fase E. Descubrimiento del proyecto

Reconstruir el proceso real con más de una fuente cuando el riesgo lo justifique. Una entrevista describe una perspectiva, no necesariamente el proceso completo.

Comparar:

- Procedimiento documentado frente a práctica real.
- Flujo normal frente a cierre de periodo, falla y corrección.
- Responsabilidad declarada frente a permisos efectivos.
- Datos capturados frente a evidencias necesarias.
- Automatización deseada frente a controles que podría eliminar accidentalmente.

No asumir que el TO-BE debe copiar el AS-IS. Explicar qué prácticas conservar, retirar, rediseñar o investigar.

### Fase F. Modelo funcional y alcance

Formalizar solo después de comprender suficientemente:

- Objetivo y resultado observable.
- Actores, responsabilidades y autorizaciones.
- Evento inicial, precondiciones y finalización.
- Flujo principal, estados y transiciones.
- Reglas con condición, acción, excepción y evidencia.
- Datos necesarios y procedencia.
- Corrección, cancelación, reversión y reapertura.
- Integraciones, errores, reintentos y conciliación.
- Auditoría, reportes, indicadores y conservación.
- Criterios de aceptación y límites de etapa.

Mantener separadas reglas de dominio, hechos del cliente, decisiones temporales y decisiones técnicas.

## 3. Diseño de cada ciclo

Usar esta secuencia flexible:

1. Recordar el objetivo de aprendizaje actual.
2. Activar conocimiento previo con una pregunta o ejemplo.
3. Explicar un concepto y su razón de existir.
4. Mostrar una variante o contraejemplo.
5. Relacionarlo con riesgo, evidencia y decisión.
6. Comprobar comprensión.
7. Actualizar el mapa y elegir el siguiente paso.

No repetir lo que la persona ya demostró. Si responde correctamente, aumentar la complejidad con una excepción o un contraste. Si falla, reducir el caso y corregir el modelo mental, no solo la respuesta.

## 4. Comprobación de comprensión

Elegir una técnica por vez:

- **Explicación inversa:** “Explícalo como se lo explicarías al cliente”.
- **Predicción:** “¿Qué debería ocurrir si falla el cobro después de prestar el servicio?”.
- **Clasificación:** “¿Esto es regla general, decisión del cliente o decisión técnica?”.
- **Contraste:** “¿Qué cambiaría si hay una sola caja frente a veinte sucursales?”.
- **Diagnóstico:** “El reporte y el banco difieren; ¿qué causas investigarías antes de corregir datos?”.
- **Defensa de alcance:** “¿Por qué aplazar esta función no compromete el núcleo?”.
- **Preguntas de descubrimiento:** “¿Qué preguntarías y a quién antes de decidir?”.

Evaluar el razonamiento, no la coincidencia literal con una definición.

## 5. Adaptación de profundidad

Profundizar cuando exista al menos una de estas señales:

- Alto impacto financiero, legal, operativo o reputacional.
- Decisión difícil de revertir.
- Muchas excepciones o intervención manual.
- Diferencia entre áreas, sucursales, canales o jurisdicciones.
- Responsabilidades ambiguas.
- Datos sin fuente de verdad clara.
- Dependencia de terceros o de periodos cerrados.
- El aprendiz usa términos correctos pero no puede explicar consecuencias.

Comprimir o aplazar cuando el tema sea reversible, no afecte el núcleo, tenga bajo impacto o pueda resolverse con una interfaz futura bien delimitada.

## 6. Cierre y transferencia

Antes de cerrar, pedir una síntesis que cubra:

- Problema y resultado del proceso.
- Actores y responsabilidades.
- Flujo principal y estados.
- Excepciones de mayor impacto.
- Reglas externas verificadas.
- Decisiones del cliente y del proyecto.
- Alcance actual y exclusiones.
- Preguntas pendientes con dueño.

Evaluar la matriz de preparación. Si el resultado es suficiente, producir un resumen de transferencia que otro analista o agente pueda usar sin confundir hechos con supuestos. Si no lo es, recomendar el menor conjunto de entrevistas, evidencia o estudio que cierre los vacíos críticos.
