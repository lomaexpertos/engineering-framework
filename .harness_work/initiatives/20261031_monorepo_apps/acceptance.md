# Alcance y comprobación

Solicitud: metodología y documentación de apps/monorepo inspirada en el repositorio
hermano berhok-logistics, inspeccionado únicamente en lectura. No cambiar su contenido.

| Requisito | Realización y evidencia prevista |
| --- | --- |
| Apps poliglotas y fronteras de monorepo desde producto nuevo | Policy development/monorepo, configure-monorepo y referencia application-layout; revisión funcional. |
| Respetar documentación, infraestructura, SQL y harness vigentes | Enlaces a sus autoridades, contrato de ownership sin migración; fixture instala sobre contenido propio y compara bytes. |
| SemVer, semantic-release y configuración por app | Policy git/application-releases y referencia releases-and-workflows; tags independientes, selección de afectados y compatibilidad explícitas. |
| Publicación, previews y gestión de workflows | Responsabilidades verify/release/artifacts/preview/cleanup/production, seguridad de PR y permisos; documentación sin Actions activos. |
| Gitignore útil sin ocultar fuentes/contratos | Referencia application-layout: generados por stack, secretos/ciphertext, locks, adaptadores, memoria y Docker context. |
| Agente descubre reglas al instalar | AGENTS, routers y Skill core para Codex/Claude; fixture de consumidor nuevo con perfil core. |
| Validar recursos/routing en check normal | Inventario y routing obligatorios; fixture elimina recursos/links y exige fallos en context/documentation. |
| No añadir burocracia a trabajo pequeño | Trigger de adopción/nueva app/frontera, proporcionalidad explícita; revisión por escenarios. |
| Versionar, revisar y entregar | VERSION 3.7.0, suite+lint en Docker, revisión independiente, cierre, commits lógicos y push de rama. |

No hay migración del consumidor de referencia, descarga npm de producto, ejecución
de plugins, publicación real, despliegues ni cambios de permisos/secretos. Las pruebas
de guías no certifican CI, SemVer efectivo o comportamiento de agentes/modelos reales.
