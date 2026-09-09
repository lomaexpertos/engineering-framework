# ADR-0010: Practical database conventions

- Status: Accepted
- Date: 2026-09-09
- Supersedes: ADR-0005

## Decision

1. Las convenciones de nombres, auditoría y ciclo de vida aprobadas en ADR-0005 se
   conservan.
2. UUIDv7 es el identificador preferido cuando existe generación validada; UUIDv4 es
   el fallback para mantener el mismo tipo y representación. El autoincremento se
   reserva para compatibilidad justificada.
3. `ON DELETE RESTRICT` y `ON UPDATE RESTRICT` son el default para relaciones nuevas;
   otras acciones requieren una razón de ciclo de vida revisada.
4. Cada cambio SQL manual usa por defecto un archivo
   `database/<categoria>/YYYYMMDD_nombre_descriptivo.sql` con secciones de preflight,
   aplicación y validación.
5. Una migration nativa puede sustituir al SQL manual cuando el usuario la solicita o
   el contrato de despliegue vigente del proyecto la requiere. No se generan ambos
   formatos sin una razón explícita.

## Consequences

- PK y FK conservan un tipo UUID homogéneo cuando UUIDv7 no está disponible.
- El caso común evita paquetes y archivos ceremoniales.
- Operaciones que realmente requieren pasos independientes pueden dividirse si
  documentan orden y razón.
- Las Policies siguen siendo la autoridad normativa; las Skills de base de datos se
  mantienen separadas por efecto.
