---
name: investigate-production-incident
description: "Usar para investigar un incidente productivo activo o reciente, construir timeline, evaluar impacto e hipótesis y proponer mitigación segura. No autoriza cambios operativos ni acceso a secretos."
---

# Investigate Production Incident

Priorizar seguridad operativa, evidencia temporal y recuperación controlada.

## Inicio

1. Confirmar servicio, ambiente, ventana temporal, impacto y estado actual.
2. Identificar incident commander, owners y canales autorizados cuando existan.
3. Registrar fuentes, zona horaria y reloj de referencia.
4. Mantener la investigación read-only hasta recibir autoridad específica.

## Workflow

1. Construir timeline de síntomas, alertas, deployments, cambios y acciones humanas.
2. Correlacionar logs, métricas, trazas, health checks y eventos sin revelar secretos.
3. Separar hechos, hipótesis, descartes y brechas de observabilidad.
4. Evaluar blast radius, degradación progresiva y riesgo de datos.
5. Priorizar hipótesis por evidencia y costo seguro de verificación.
6. Proponer mitigaciones reversibles con prechecks, owner, validación y rollback.
7. No ejecutar restart, rollback, failover, cambios de tráfico o datos sin autorización.
8. Tras estabilizar, identificar causa contribuyente y acciones preventivas verificables.

## Entrega

Mantener timeline, impacto, evidencia, hipótesis, decisiones, acciones autorizadas,
estado de recuperación y follow-ups con owner. No declarar causa raíz antes de tener
evidencia suficiente.
