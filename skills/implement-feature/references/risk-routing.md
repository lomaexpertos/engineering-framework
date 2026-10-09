# Organizational risk routing

Consultar esta referencia si el cambio cruza dominios o necesita calibrar el rigor.
El routing selecciona contratos; no obliga a ejecutar cada Skill mencionada.

| Superficie afectada | Fuente adicional |
| --- | --- |
| UI y lenguaje visual | Policies frontend; `implement-ui-change` si ese es el trabajo solicitado |
| Integración entre servicios | `development/distributed-systems.md` |
| Datos persistentes o SQL | Router database y Skill por tipo de artefacto |
| Dinero, fiscalidad, nómina, cálculos, correcciones o autorizaciones | `development/domain-integrity.md` y `logging.md` |
| Métrica de rendimiento con problema observado | `development/performance-and-resilience.md` |
| Infraestructura o secretos | Router y contrato del perfil operativo aplicable |

## Rigor acordado

- **Normal:** cambio localizado y reversible, sin efectos críticos.
- **Reforzado:** persistencia, integración, compatibilidad o asincronía con riesgo material.
- **Alto:** dinero, fiscalidad, nómina, autorizaciones, secretos, datos irreversibles o
  efectos críticos. Exige evidencia de invariantes, fallas y recuperación; para los
  flujos críticos, logging implementado y validado en la misma entrega.

El tamaño del diff no reduce criticidad. Una auditoría completa de rama se usa cuando
se prepara la entrega, se solicita o una Policy la exige, no por activar este router.
