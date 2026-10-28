# Revisión de cambios

## Aplicabilidad

Todo cambio recibe triage y revisión del resultado integrado, proporcionales a sus
riesgos. Una dimensión no aplicable conserva motivo, no una aprobación ficticia.

| Dimensión | Trigger y evidencia |
| --- | --- |
| Código | Código modificado: corrección, contratos, compatibilidad, integración y regresiones. |
| Seguridad | Auth, permisos, secretos, entradas o dependencias: amenazas alcanzables y controles afectados. |
| Integridad | Escrituras críticas/concurrencia/reintentos: invariantes, duplicados y recuperación. |
| UI | Interfaz visible: coherencia, estados, responsive y accesibilidad afectada. |
| UX | Flujos/interacciones: comprensión, feedback, errores, vacíos y recuperación. |
| Comentarios | Código afectado: razones e invariantes no evidentes; comentarios vigentes y sin secretos. |
| Logging | Flujos críticos o diagnóstico: eventos útiles y correlacionados, éxito/falla y datos permitidos. |
| Cierre | Cambio material: docs, decisiones, invariantes, roadmap y memoria sin dependencia temporal. |

## Contrato

1. La revisión **MUST** evaluar el cambio integrado y sus interacciones concretas,
   no auditar todo el repositorio por defecto.
2. El revisor **SHOULD** ser distinto del autor cuando exista capacidad; alto riesgo
   **MUST** tener revisión independiente o quedar explícitamente pendiente. Una
   autoevaluación no se presenta como independencia.
3. Los roles funcional, seguridad, logging/comentarios, UI y UX **MUST** tener
   cobertura explícita según aplicabilidad. Pueden compartir perfil/modelo y
   ejecutarse por turnos; un revisor puede cubrir varias dimensiones cuando se
   conserve la independencia requerida. UI/UX no aplicables conservan motivo.
4. Hallazgos **MUST** incluir ubicación, condición, impacto y evidencia; separar
   bloqueantes demostrados, recomendaciones y mejoras opcionales. No imponer cuotas
   ni convertir preferencias estéticas en defectos materiales.
5. Verificación omitida **MUST** distinguirse de éxito. Leer UI no es observación visual;
   si falta entorno o captura requerida, esa aceptación sigue pendiente.
6. Comentarios **SHOULD** explicar por qué o qué invariante se conserva. **MUST NOT**
   exigirse comentarios/logs por función ni instrumentación sin valor diagnóstico.
7. Logging crítico sigue [logging.md](../development/logging.md); su ausencia requerida
   impide completar la entrega, no es una mejora opcional.
8. Reportes y evidencia **MUST** vivir en `reviews/` y `evidence/` del expediente.
   La revisión no concede permisos para publicar, mergear o modificar producción.
