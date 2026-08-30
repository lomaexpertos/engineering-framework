# SQL artifact layout

## Canonical layout

Los artefactos SQL literales **SHOULD** almacenarse por finalidad:

```text
database/
├── migrations/<YYYYMMDD_nombre_descriptivo>/
├── backfills/<YYYYMMDD_nombre_descriptivo>/
├── repairs/<YYYYMMDD_nombre_descriptivo>/
└── routines/<objeto_o_trabajo>/
```

## Requirements

1. El nombre **MUST** usar fecha de creación y slug `snake_case` ASCII; actualizar el mismo trabajo **MUST NOT** cambiar su fecha.
2. Una migración cambia estructura; un backfill completa o transforma datos válidos; una reparación corrige datos anómalos; una rutina instala lógica permanente. El artefacto **MUST** clasificarse por su efecto real.
3. Cada trabajo ejecutable **MUST** documentar orden, motor, versión, prechecks, aplicación, validación y recuperación.
4. Las rutas particulares existentes **MAY** conservarse cuando estén documentadas; crear una segunda convención paralela **MUST NOT** hacerse sin migración aprobada.
