---
name: branch-quality-review
description: Revisa ramas completas, pull requests, commits, patches o áreas con riesgos combinados y genera un reporte trazable. Usar para auditoría general, revisión antes de entregar o cuando deban coordinarse varias dimensiones; usar security-review o data-integrity-review si el encargo está limitado exclusivamente a uno de esos dominios.
---

# Branch Quality Review

Ejecutar una auditoría técnica orientada a riesgo. Usar el cambio solicitado como punto de entrada y el repositorio como contexto: un diff pequeño puede afectar escritores, consumidores, contratos o invariantes existentes fuera del diff.

Revisar el código en modo de solo lectura. No modificar código, migraciones, pruebas ni configuración. La única escritura persistente permitida en el árbol es el reporte dentro de `engineering/quality-review/<slug>/`. Las validaciones pueden escribir artefactos efímeros dentro de contenedores, volúmenes descartables o directorios temporales fuera del árbol; no deben ensuciar archivos versionados.

## Resolver el alcance

Aceptar cualquiera de estas modalidades:

- **Rama:** comparar la rama actual o indicada contra su base real.
- **PR, commits o patch:** revisar el rango o artefacto entregado.
- **Dirigida:** revisar archivos, módulo, flujo o preocupación indicada aunque `HEAD` esté en `main` y no exista diff.
- **Repositorio:** revisar una superficie amplia cuando el usuario lo pida explícitamente.

No exigir una rama de feature. Si el usuario dice “revisa Stripe, saldos e inventarios”, traducirlo a superficies de código, presets y controles; buscar los flujos relacionados aunque no hayan cambiado en la rama actual.

Si el alcance sigue ambiguo después de inspeccionar el repo y la ambigüedad cambia materialmente las conclusiones, hacer una pregunta breve. No bloquear por detalles inferibles.

## Cargar referencias

Leer siempre:

- [review-workflow.md](references/review-workflow.md)
- [risk-routing-and-presets.md](references/risk-routing-and-presets.md)
- [core-correctness-and-architecture.md](references/core-correctness-and-architecture.md)
- [security-review.md](references/security-review.md)
- [report-format.md](references/report-format.md)

Leer según los presets activados:

- Integridad, concurrencia, saldos, inventarios, folios o idempotencia: [concurrency-idempotency-integrity.md](references/concurrency-idempotency-integrity.md).
- Pagos, Stripe, webhooks, jobs, colas o proveedores: [distributed-payments-and-integrations.md](references/distributed-payments-and-integrations.md).
- SQL, dinero, fechas, contratos, migraciones, backfills o volumen: [data-contracts-and-migrations.md](references/data-contracts-and-migrations.md).
- Frontend, formularios, componentes o flujos de usuario: [frontend-ux-review.md](references/frontend-ux-review.md).
- Pruebas, CI, observabilidad, despliegue o recuperación: [testing-operability.md](references/testing-operability.md).
- Asignación de trabajo especializado: [review-lanes.md](references/review-lanes.md).

No dejar controles importantes únicamente en `review-lanes.md`: los presets aplican también cuando no haya subagentes.

## Flujo obligatorio

1. Resolver modalidad, objetivo, base si aplica y artefactos incluidos.
2. Determinar stack, versiones, motor de datos, arquitectura y convenciones locales.
3. Leer documentación relevante en `engineering/` y convenciones raíz como `README`, `CONTRIBUTING`, `ARCHITECTURE` o `DDD`.
4. Detectar activos, fronteras, invariantes, escritores, consumidores y efectos laterales relacionados con el alcance.
5. Traducir automáticamente señales del código y énfasis del usuario a presets y nivel de rigor.
6. Registrar antes de profundizar qué presets se activaron y por qué.
7. Revisar el diff o superficie indicada y seguir el radio de impacto fuera de ella hasta obtener evidencia suficiente.
8. Ejecutar validaciones seguras y relevantes cuando el entorno lo permita. Usar la infraestructura oficial y aislada del proyecto; no instalar dependencias ni alterar código para hacer pasar checks.
9. Consolidar hallazgos, eliminar duplicados y calibrar severidad y confianza.
10. Generar un reporte que muestre hallazgos y cobertura, incluyendo lo no verificable.

## Routing automático

Aplicar siempre los presets base definidos en `risk-routing-and-presets.md`. Añadir presets por:

- nombres y lenguaje del usuario;
- rutas, módulos, tablas, endpoints y eventos tocados;
- tecnologías y proveedores detectados;
- invariantes y activos potencialmente afectados;
- escritores y consumidores fuera del diff;
- historial, incidentes, specs y documentación disponible.

El énfasis del usuario agrega profundidad, nunca elimina el baseline. No permitir que un preset explícito o automático desactive controles más amplios necesarios para encontrar el mismo riesgo.

## Integridad como gate obligatorio

Cuando exista estado crítico, no concluir “sin hallazgos” hasta documentar:

- la invariante y autoridad del dato;
- todos los escritores encontrados mediante una búsqueda razonable, junto con accesos externos o escritores que no pudieron verificarse;
- la frontera transaccional real;
- la estrategia de concurrencia elegida y por qué protege la invariante;
- el comportamiento ante duplicado, retry, timeout, orden distinto y fallo parcial;
- constraints, locks, versiones o operaciones atómicas relevantes;
- reconciliación, reparación o recálculo disponible;
- evidencia de pruebas concurrentes o la limitación que impidió ejecutarlas.

No exigir `SELECT ... FOR UPDATE` como receta universal. Evaluar la estrategia contra el conflicto real.

## Niveles de rigor

Seleccionar automáticamente:

- **Baseline:** cambio interno de bajo impacto y sin activos sensibles.
- **Standard:** aplicación web, API, persistencia o integración con riesgo normal; usarlo por defecto si hay duda.
- **High assurance:** dinero, saldos, inventario, folios, identidad, permisos privilegiados, datos sensibles, cumplimiento o procesos difíciles de revertir.

El nivel determina profundidad y evidencia, no la cantidad de texto. Una revisión estática no debe afirmar cumplimiento integral de un estándar externo.

## Subagentes

Cuando la plataforma y las instrucciones activas lo permitan, asignar agentes por presets y fronteras independientes, no sólo por cantidad de archivos. Mantener un integrador responsable de alcance, contradicciones, deduplicación y reporte.

Cada lane debe devolver:

- controles aplicados;
- evidencia inspeccionada;
- hallazgos con severidad y confianza;
- controles sin hallazgo;
- limitaciones o asuntos no verificables.

No dejar procesos pendientes al cerrar.

## Evidencia y severidad

Cada hallazgo debe incluir ubicación, comportamiento observado, escenario de fallo o abuso, impacto, dirección de corrección, preset que lo detectó y confianza.

Calibrar severidad por impacto, probabilidad, alcance, reversibilidad y evidencia:

- **Crítica:** explotación o corrupción grave plausible con exposición inmediata o recuperación muy costosa.
- **Alta:** bug, bypass o inconsistencia probable que debe bloquear entrega.
- **Media:** riesgo real acotado o defensa insuficiente que conviene resolver antes de considerar estable.
- **Baja:** mejora con impacto limitado y demostrable.

No convertir preferencias, patrones arquitectónicos o cobertura nominal en bloqueantes sin un daño concreto.

## Criterios bloqueantes

Marcar como no entregable, entre otros, cuando exista riesgo probable de:

- corrupción, pérdida, doble aplicación o inconsistencia de datos;
- carrera sobre saldos, stock, inventario, pólizas, folios, cupos o límites;
- cobro, reembolso, webhook o job duplicable sin protección adecuada;
- bypass de autenticación, autorización, tenant, ownership o segregación de funciones;
- injection, ejecución no confiable, SSRF, path traversal o exposición sensible;
- commit parcial, evento perdido o estado distribuido sin recuperación viable;
- migración destructiva o backfill no reanudable con impacto material;
- ruptura incompatible de contrato o despliegue;
- falta de pruebas o evidencia en comportamiento financiero, crítico o irreversible.

## Reporte

Crear exactamente un reporte por ejecución en:

```text
engineering/quality-review/<slug>/YYYY-MM-DD-HHMM-branch-quality-review.md
```

Tratar `engineering/quality-review/` como namespace fijo y usar una carpeta de expediente con este formato:

```text
YYYYMMDD_nombre_descriptivo
```

Usar la fecha de creación del expediente en la zona horaria del proyecto o, si no está definida, la del entorno. Mantener esa fecha al agregar revisiones posteriores al mismo expediente. Escribir el nombre descriptivo en `snake_case`, con minúsculas, números y guiones bajos, sin espacios, acentos ni `ñ`. Reutilizar la carpeta si representa el mismo alcance; si en la misma fecha existe otra revisión distinta con igual nombre, añadir `_02`, `_03` o el siguiente consecutivo disponible.

Reutilizar exactamente el slug de una spec relacionada cuando ya cumpla la convención. No renombrar desde esta skill carpetas legadas ni otros artefactos de `engineering/`; si conservar un slug anterior es necesario para no fragmentar un expediente existente, registrar la excepción y su ruta en el reporte. Cuando no exista una spec relacionada, derivar el nombre de la rama, PR, módulo o preocupación revisada.

El reporte debe declarar modalidad de alcance, rigor, presets detectados, motivo de activación, cobertura por dominio, hallazgos, decisión de entrega, validaciones, limitaciones y plan de corrección.

Usar estos estados de cobertura:

- `hallazgo`
- `revisado-sin-hallazgos`
- `no-aplicable`
- `no-verificable`

No usar “sin hallazgos” como sinónimo de “no revisado”.

## Checklist final

- Confirmar alcance, base o superficie dirigida.
- Confirmar contexto detectado, rigor y presets activados.
- Confirmar que el radio de impacto incluyó escritores y consumidores relevantes fuera del diff.
- Confirmar matriz de cobertura y evidencia.
- Separar hallazgos bloqueantes, no bloqueantes y preguntas.
- Ordenar correcciones por dependencia.
- Declarar validaciones ejecutadas y riesgos residuales.
- Confirmar ruta del reporte y ausencia de cambios al código revisado.
