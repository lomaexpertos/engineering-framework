---
name: add-observability
description: "Agrega logs, métricas, trazas, salud o alertas, incluida la reconstrucción de operaciones críticas y la salida productiva stdout/stderr."
---

# Add Observability

Entregar las señales solicitadas o necesarias para cumplir el contrato operativo del proyecto.

## Contratos y límites

- Para operaciones críticas, consultar `development/logging.md`. Su logging es parte
  del desarrollo aunque nadie invoque esta Skill expresamente; no diferirlo hasta un incidente.
- Para salida productiva/Docker, consultar `development/logging.md` e
  `infrastructure/container-logging.md`; para otras señales, `infrastructure/observability.md`.
  Cargar únicamente el perfil afectado.
- Conservar naming de eventos, campos y correlación del proyecto. Reutilizar su
  logger/instrumentación; no instalar otro backend o collector por iniciativa propia.
- No exigir métricas, trazas, alertas, dashboards ni runbooks por un cambio que solo
  necesita logs. Agregarlos cuando pertenezcan al alcance o respondan a un riesgo real.
- No añadir logging a cambios triviales sin valor diagnóstico ni registrar secretos
  o datos personales innecesarios. No eliminar evidencia crítica para reducir ruido.

## Resultado esperado

Señales que permitan responder la pregunta operativa acordada y evidencia de su
emisión, correlación y protección de datos. En operaciones críticas, demostrar que
se reconstruyen decisiones, cálculos, resultado y falla conforme a la Policy.
El modelo decide la instrumentación; no se exige un checklist universal.
