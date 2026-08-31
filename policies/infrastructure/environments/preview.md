# Preview environment

## Purpose

Crear ambientes remotos, efímeros y aislados para validación compartida.

## Requirements

1. Cada preview **MUST** tener un identificador validado y libre de colisiones.
2. Su creación y destrucción **MUST** ser repetibles.
3. Datos utilizados **MUST** ser sintéticos, anonimizados o aprobados expresamente para
   ese ambiente.
4. Red, storage, DNS y credenciales **MUST** aislarse de producción.
5. Los recursos que sobrevivan a la destrucción **MUST** declararse explícitamente.
6. El ambiente **MUST** validar salud después del aprovisionamiento y del deployment.
7. Costos, cuotas o límites **MUST** documentarse cuando se creen recursos facturables.
8. Su README **MUST** documentar ciclo de vida, naming, componentes, automatización,
   variables, endpoints, verificación, destrucción y recuperación ante creación parcial.

Las tecnologías utilizadas pertenecen al ciclo del ambiente y **SHOULD** agruparse
bajo su directorio, no como raíces tecnológicas paralelas.
