---
name: branch-quality-review
description: Revisa una rama, PR, rango de commits o patch contra su base para decidir si es entregable. Reporta defectos con evidencia y separa bloqueantes, recomendaciones y mejoras opcionales; no audita todo el repositorio.
---

# Branch Quality Review

Evaluar si un cambio cumple su objetivo y puede entregarse con seguridad. La meta no
es encontrar la mayor cantidad de problemas, sino identificar los defectos que
realmente cambian la decisión de merge y separar el resto por su valor.

La revisión es de solo lectura sobre el código. No modificar código, pruebas,
migraciones ni configuración. La única escritura permitida es el reporte de revisión.

## Alcance

1. Identificar la rama o artefacto solicitado, su base real, el rango de commits y el
   diff completo. Si la base o el rango no son evidentes, leer
   [review-workflow.md](references/review-workflow.md).
2. Entender el objetivo mediante la solicitud, criterios de aceptación, convenciones
   vigentes y código directamente relacionado.
3. Revisar primero las superficies modificadas y ampliar al código vecino sólo para
   comprobar una interacción, contrato o riesgo concreto.
4. Evaluar comportamiento, seguridad, integridad, concurrencia, consultas,
   compatibilidad, arquitectura, UX y pruebas únicamente donde el cambio toque esas
   superficies.

No reportar deuda preexistente salvo que el cambio la agrave o dependa de ella para
funcionar. No convertir la revisión en una auditoría general del repositorio ni exigir
cambios ajenos a su objetivo.

No usar subagentes por defecto. Delegar partes de la revisión solamente cuando el
usuario solicite trabajo paralelo y existan superficies suficientemente independientes.

## Referencias condicionales

- Si el cambio toca autenticación, permisos, SQL, migraciones, dinero, estado
  compartido o concurrencia, leer
  [security-sql-concurrency.md](references/security-sql-concurrency.md).
- Si toca pantallas, componentes, formularios, navegación o UX, leer
  [frontend-ux-review.md](references/frontend-ux-review.md).
- No cargar referencias de áreas que el cambio no afecte.

## Umbral de evidencia

Cada hallazgo debe explicar:

- el cambio observado, con archivo y línea cuando sea posible;
- las condiciones concretas que activan el problema;
- el comportamiento incorrecto o impacto probable;
- la evidencia y las protecciones existentes consideradas;
- la corrección mínima razonable.

Un patrón sospechoso, una posibilidad teórica o una preferencia de diseño no
constituyen por sí solos un defecto. Si falta información para confirmar el impacto,
registrarla como pregunta o limitación, no como hallazgo. No existe una cuota mínima:
una revisión correcta puede terminar sin hallazgos.

## Clasificación

### Bloqueante

Bloquear únicamente cuando la rama introduzca o agrave un defecto con escenario
realista, impacto material, protección insuficiente y evidencia de confianza alta.
Ejemplos habituales son incumplir aceptación, corromper datos, omitir autorización,
romper una invariante concurrente, introducir una vulnerabilidad explotable, quebrar
un contrato consumido o dejar fallando una validación relevante.

La severidad potencial no basta si el escenario es especulativo. Una prueba nueva
faltante tampoco bloquea por sí sola, salvo regla explícita o ausencia de otra
evidencia razonable para un flujo crítico.

### Recomendado

Usar esta categoría para un problema concreto introducido por el cambio cuyo impacto
sea limitado, poco probable o recuperable. Puede incluir casos borde plausibles,
observabilidad insuficiente, pruebas valiosas faltantes, deuda nueva próxima o
problemas de rendimiento y UX que no impidan el objetivo.

### Opcional

Reservar esta categoría para refactors, alternativas arquitectónicas, nombres,
componentización u optimizaciones sin impacto demostrado. Incluir como máximo cinco y
dejar explícito que no requieren acción para entregar.

## Calibración

- **Concurrencia:** exigir escritor plausible, invariante vulnerable y protección
  insuficiente; considerar constraints, operaciones atómicas, control optimista y
  transacciones antes de prescribir locks.
- **SQL y rendimiento:** demostrar multiplicación de trabajo o degradación con ruta y
  volumen realistas; no exigir índices, caché o batching por intuición.
- **Arquitectura:** aplicar reglas declaradas del repositorio; otra preferencia de
  patrón es opcional mientras no rompa una frontera o cause un defecto.
- **Frontend y UX:** distinguir riesgo para datos o acciones críticas de una mejora de
  experiencia protegida correctamente por backend.
- **Pruebas:** una prueba existente rota puede bloquear; una prueba faltante suele ser
  recomendación según el riesgo.
- **Mantenibilidad:** no exigir Strategy, Factory, Repository, interfaces ni
  componentes reutilizables sin variación, convención o costo concreto.

## Validaciones

Usar primero análisis del diff y comprobaciones de solo lectura. Ejecutar pruebas o
análisis estático enfocados cuando puedan confirmar un comportamiento material y
exista infraestructura aislada del proyecto. Una validación no ejecutada se registra
como limitación, no automáticamente como defecto.

## Reporte y veredicto

Crear exactamente un reporte por ejecución en:

```text
engineering/quality-review/<YYYYMMDD_nombre_descriptivo>/YYYY-MM-DD-HHMM-branch-quality-review.md
```

Reutilizar el slug de una spec relacionada. En otro caso, derivarlo del cambio con la
fecha de creación y `snake_case` ASCII. El reporte debe incluir metadata y alcance,
veredicto, bloqueantes, recomendaciones, mejoras opcionales, preguntas, validaciones,
limitaciones y un plan mínimo únicamente para los bloqueantes.

El reporte es evidencia temporal: no crear ni actualizar índices o routers permanentes
únicamente para enlazarlo.

Usar uno de estos veredictos:

- **No entregable:** existe al menos un bloqueante demostrado.
- **Entregable con recomendaciones:** no hay bloqueantes, pero existen correcciones
  valiosas no obligatorias.
- **Entregable:** no se encontraron defectos materiales.

Si no hay bloqueantes, afirmar que recomendaciones y mejoras opcionales no impiden el
merge ni convertirlas en una lista obligatoria de tareas.
