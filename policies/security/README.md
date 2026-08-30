# Security policies router

Consulta este dominio para cambios relacionados con confidencialidad, integridad,
identidad, exposición o recuperación.

## Routing

| Tarea | Policies aplicables |
| --- | --- |
| Crear, consumir, registrar o transportar secretos | [`secrets.md`](secrets.md) |
| Versionar secretos productivos con SOPS y age | [`sops-age.md`](sops-age.md) |
| Mantener dotenv cifrado y sus contratos | [`encrypted-environment-contract.md`](encrypted-environment-contract.md) |

## Planned coverage

Los siguientes temas continúan planeados y todavía no constituyen Policies vigentes:

- `encryption.md` para cifrado general en tránsito y reposo;
- `networking.md` para exposición y segmentación;
- `access-control.md` para identidad, autorización y privilegios;
- `dependencies.md` para supply chain;
- `backups.md` para respaldo y restauración.
