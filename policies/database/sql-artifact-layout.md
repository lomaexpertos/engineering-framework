# SQL artifact layout

## Canonical layout

Los artefactos SQL literales **SHOULD** almacenarse por finalidad:

```text
database/
├── migrations/<YYYYMMDD_nombre_descriptivo>.sql
├── backfills/<YYYYMMDD_nombre_descriptivo>.sql
├── repairs/<YYYYMMDD_nombre_descriptivo>.sql
└── routines/<YYYYMMDD_nombre_descriptivo>.sql
```

## Requirements

1. El nombre **MUST** usar fecha de creación y slug `snake_case` ASCII; actualizar el mismo trabajo **MUST NOT** cambiar su fecha.
2. Una migración cambia estructura; un backfill completa o transforma datos válidos; una reparación corrige datos anómalos; una rutina instala lógica permanente. El artefacto **MUST** clasificarse por su efecto real.
3. Un cambio SQL manual **SHOULD** usar un único archivo con secciones ordenadas de
   `PREFLIGHT`, `APLICACIÓN` y `VALIDACIÓN`. Cada consulta de comprobación **MUST**
   indicar el resultado esperado y cuándo debe detenerse la ejecución.
4. Un cambio **MAY** dividirse en archivos ordenados únicamente cuando el motor, los
   locks, la duración o una frontera de despliegue exijan pasos independientes. La
   razón y el orden **MUST** quedar documentados.
5. Las rutas particulares existentes **MAY** conservarse cuando estén documentadas;
   crear una segunda convención paralela **MUST NOT** hacerse sin migración aprobada.
6. Los SQL ejecutables **MUST NOT** almacenarse bajo `engineering/`; allí sólo se
   conserva su trazabilidad.
