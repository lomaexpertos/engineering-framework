# Deployment strategy selection

Cargar esta referencia únicamente cuando una estrategia esté ausente, cambie o deba
validarse contra la topología real.

## Selección

1. Identificar tipo de servicio, estado local, réplicas, tráfico, dependencias y
   tolerancia documentada a interrupción.
2. Para una API sin decisión previa, preguntar si se requiere `blue-green` o
   `recreate` antes de generar scripts.
3. No declarar `blue-green` sin doble capacidad, health check, control de tráfico,
   drenado, compatibilidad entre versiones y rollback al slot anterior.
4. Usar `recreate` cuando se acepte interrupción y exista verificación y recuperación.
5. Usar `rolling` solo cuando el runtime soporte sustitución gradual, readiness y
   límites de indisponibilidad.
6. Usar `stateful` para unidades con estado local que requieran integridad, respaldo y
   recuperación específicos.
7. Usar `external` cuando otro sistema sea owner del deployment; documentar el límite
   y no generar automatización que invada esa responsabilidad.

## Artefactos condicionales

- `blue-green`: slots explícitos, control de tráfico, validación previa al cutover,
  drenado y rollback.
- `rolling`: configuración de réplicas, readiness y disponibilidad mínima.
- `recreate`: secuencia de reemplazo, health check y recuperación de versión.
- `stateful`: respaldo, compatibilidad, migraciones y recuperación especializada.
- `external`: owner, contrato de salud y dependencias, sin entrypoint operativo local.

Registrar la estrategia por servicio en `deployment.yaml`; no inferirla desde nombres
de archivos ni aplicar una estrategia global por conveniencia.
