# Security policies router

Consulta este dominio para cambios relacionados con confidencialidad, integridad,
identidad, exposición o recuperación.

## Routing

| Tarea | Policies aplicables |
| --- | --- |
| Crear, consumir, registrar o transportar secretos | [`secrets.md`](secrets.md) |
| Detectar secretos en archivos, cambios o historial | [`secret-scanning.md`](secret-scanning.md) |
| Adoptar SOPS/age, editar ciphertext o gestionar públicas | [`sops-age.md`](sops-age.md) |
| Ubicar identidad privada, entregar/importar un valor o diagnosticar acceso | [`sops-private-material.md`](sops-private-material.md) |
| Mantener dotenv cifrado y sus contratos | [`encrypted-environment-contract.md`](encrypted-environment-contract.md) |
| Autorización, entrada no confiable, permisos o abuso | [`application-security.md`](application-security.md) |
| Dependencias, acciones CI, imágenes o procedencia | [`supply-chain.md`](supply-chain.md) |

## Planned coverage

Los siguientes temas continúan planeados y todavía no constituyen Policies vigentes:

- `encryption.md` para cifrado general en tránsito y reposo;
- `networking.md` para exposición y segmentación;
- `backups.md` para respaldo y restauración.
