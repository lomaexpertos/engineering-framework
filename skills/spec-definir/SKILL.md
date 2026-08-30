---
name: spec-definir
description: Crea o actualiza una spec bajo engineering/specs/, separando AS-IS, Best Practices y TO-BE para convertir una iniciativa en requisitos verificables antes de planear.
---

# Spec Definir

Convertir una solicitud de cambio en una especificación práctica y suficiente para planear, sin diseñar prematuramente la implementación. Separar el estado observado (`AS-IS`), el referente investigado (`Best Practice`) y el destino aprobado (`TO-BE`). Usar `$spec-documentar` sólo cuando el AS-IS deba preservarse como referencia arquitectónica permanente.

Usar `$explorador-de-dominio` sin crear una spec cuando el usuario sólo quiera aprender o construir un referente de Best Practice y todavía no exista una iniciativa concreta. Activar ambos flujos cuando ese conocimiento deba incorporarse a una iniciativa.

## Frontera

- Escribir artefactos únicamente en `engineering/specs/<slug>/`.
- Usar exactamente la carpeta raíz `engineering/`.
- Leer documentación relevante en `engineering/architecture/` como contexto, sin modificarla.
- No crear plan técnico, tareas ni código.
- Mantener la spec en español.

Usar para cada expediente nuevo el formato `YYYYMMDD_nombre_descriptivo`: fecha de creación en la zona horaria del proyecto o del entorno, seguida por un nombre `snake_case` en minúsculas, números y guiones bajos, sin espacios, acentos ni `ñ`. Mantener la fecha al actualizar el expediente. Si otro expediente distinto tiene el mismo nombre y fecha, añadir `_02`, `_03` o el siguiente consecutivo. No renombrar slugs legados por iniciativa propia.

## Obtener contexto proporcional

1. Identificar el cambio, módulo afectado y resultado operativo esperado.
2. Buscar `engineering/architecture/index.md` y leer los snapshots vigentes aplicables.
3. Verificar en el repositorio las zonas afectadas, ambiguas o desactualizadas. En brownfield no omitir esta revisión; ajustar su profundidad al riesgo.
4. Distinguir comportamiento observado, decisiones del usuario y supuestos.

La documentación arquitectónica acelera el descubrimiento, pero no sustituye comprobar aquello que el cambio contradiga o vaya a modificar.
Si no existe `engineering/architecture/index.md` o no contiene el módulo, continuar con descubrimiento proporcional y registrar la ausencia como contexto faltante; no inventar una ruta ni bloquear un cambio que pueda definirse con evidencia suficiente.

## Crear o actualizar el miniproyecto

1. Elegir o reutilizar el slug fechado del expediente.
2. Crear o actualizar `engineering/specs/<slug>/spec.md` preservando información válida.
3. Crear `as-is.md` cuando la iniciativa requiera evidencia propia del estado actual.
4. Crear `best-practices.md` cuando se investiguen estándares, referentes o prácticas recomendadas.
5. Crear `brechas.md` cuando la comparación afecte alcance, decisiones o planeación.
6. Crear `preguntas.md` sólo si existen dudas que puedan cambiar materialmente la solución.
7. Crear o actualizar `checklist.md` como control ligero.
8. Integrar respuestas obtenidas durante la misma ejecución y usar `$spec-clarificar` para respuestas posteriores.

Crear sólo artefactos con contenido real. En iniciativas pequeñas, integrar AS-IS, Best Practice y brechas como secciones claras de `spec.md` en vez de producir archivos vacíos. No convertir `spec.md` en una minuta histórica. Registrar decisiones integradas en `preguntas.md` o `clarificaciones.md` cuando corresponda.

## Separar las tres dimensiones

- **AS-IS:** describir lo observado en código, configuración, pruebas, datos, operación o fuentes internas. Registrar evidencia, commit, fecha y confianza. No presentarlo como cobertura absoluta del módulo si sólo se investigó la superficie de la iniciativa.
- **Best Practice:** registrar obligaciones verificadas, estándares reconocidos, prácticas recomendadas, variantes habituales e hipótesis propuestas por IA sin mezclarlas. Incluir fuente, vigencia, jurisdicción o versión, aplicabilidad y confianza. No convertir una recomendación en regla universal ni en requisito aprobado.
- **TO-BE:** mantener en `spec.md` únicamente el comportamiento elegido por el cliente o proyecto, aunque coincida sólo parcialmente con el referente. Expresar las decisiones implementables mediante RF y criterios de aceptación.

Usar `$explorador-de-dominio` cuando haga falta aprender el dominio, comparar variantes, buscar puntos ciegos o construir el referente de Best Practice. Esa skill aporta conocimiento estructurado; `$spec-definir` conserva la autoridad sobre los artefactos de la iniciativa.

## Analizar brechas

Distinguir:

- `AS-IS → Best Practice`: brecha de referencia, útil para oportunidades y riesgos pero no equivalente a alcance;
- `AS-IS → TO-BE`: brecha de implementación que debe quedar cubierta, diferida o excluida;
- `TO-BE → Best Practice`: desviación residual aceptada, diferida, descartada o pendiente.

Usar IDs `BR-001` y siguientes. Relacionar cada brecha de implementación aprobada con uno o más RF. No generar requisitos automáticamente por toda diferencia contra Best Practice.

## Decidir cuándo preguntar

Preguntar si la respuesta:

- define alcance, autoridad o comportamiento esencial;
- cambia datos, permisos, integraciones, seguridad, contabilidad, inventario, cumplimiento o UX de forma relevante;
- resuelve una contradicción peligrosa;
- determina si una afirmación es regla confirmada o inferencia no verificable.

Documentar como supuesto los detalles menores que tengan una opción segura y reversible. No suponer reglas de negocio con impacto material.

Para solicitudes demasiado amplias, crear una definición inicial sólo cuando exista base suficiente, registrar un mapa de alcance y formular una ronda breve de discovery. No simular cobertura de un dominio que no fue investigado.

## Escribir la spec

Leer [formatos.md](references/formatos.md) antes de crear o normalizar artefactos. Mantener como núcleo de `spec.md`:

- resumen, problema y objetivo;
- alcance y fuera de alcance;
- reglas de negocio;
- requisitos funcionales `RF-###`;
- casos principales y criterios de aceptación;
- riesgos, supuestos e impacto esperado.

Agregar únicamente cuando aporten valor: referencias resumidas al AS-IS y Best Practice, actores, casos borde, datos y estados, permisos, integraciones, compatibilidad, requisitos no funcionales, observabilidad y criterios medibles de éxito. Mantener `spec.md` como autoridad del TO-BE; enlazar los otros artefactos en vez de duplicarlos.

Preservar una estructura existente que siga siendo clara; no reordenar por ceremonia. Usar RF como convención corporativa. No generar historias de usuario, story points ni fases por iniciativa propia, pero conservarlos o incorporarlos si el usuario o el proyecto los requiere. Una entrega por fases debe declarar qué RF incluye y qué queda pendiente.

## Criterio de preparación

Considerar la definición suficientemente estructurada cuando:

- el alcance y las exclusiones sean comprensibles;
- los RF y criterios de aceptación sean verificables;
- las reglas críticas distingan hechos, decisiones y supuestos;
- toda brecha de implementación aprobada esté cubierta por RF o tenga una disposición explícita;
- las desviaciones respecto de Best Practice estén aceptadas, diferidas, descartadas o pendientes sin disfrazarlas como cumplimiento;
- datos, permisos, integraciones y compatibilidad estén tratados cuando apliquen;
- toda pregunta capaz de cambiar materialmente la solución esté registrada.

Declarar `Lista para planear` sólo cuando no queden preguntas materiales pendientes. Si existen, declarar `Lista para clarificar` y recomendar `$spec-clarificar`. Informar archivos creados o modificados en ambos casos.
