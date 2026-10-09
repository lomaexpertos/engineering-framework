---
name: investigate-production-incident
description: "Investiga incidentes productivos, construye timeline y propone mitigación segura. No autoriza cambios operativos ni acceso a secretos."
---

# Investigate Production Incident

Entregar investigación productiva trazable sin asumir autoridad de operación.

## Límites y formato

- Mantener la investigación read-only. No ejecutar restart, rollback, failover,
  conmutación de tráfico ni cambios de datos sin autorización específica.
- Usar owners/canales reales cuando existan, y registrar servicio, ambiente, impacto,
  ventana temporal, zona horaria y fuentes. No inventar responsables.
- Separar hechos, hipótesis, decisiones y acciones autorizadas. No revelar secretos
  ni declarar causa raíz sin evidencia suficiente.
- Las mitigaciones propuestas deben identificar owner, prerrequisitos, resultado
  verificable y recuperación; proponerlas no autoriza ejecutarlas.
- Si falta logging crítico, registrarlo como una brecha de implementación conforme a
  `development/logging.md`, no compensarlo inventando eventos o accediendo a datos privados.

## Resultado esperado

Timeline, impacto, evidencia, causa confirmada o hipótesis pendientes, estado de
recuperación y acciones preventivas con owner. Mantenerlo en pantalla salvo pedido
o contrato de persistencia; no exigir un procedimiento universal de investigación.
