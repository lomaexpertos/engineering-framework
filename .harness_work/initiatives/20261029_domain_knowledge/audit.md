# Entrega de conocimiento de dominios

| Solicitud | Fuentes y comprobación |
| --- | --- |
| Investigar módulo actual y conservar AS-IS | Policy domain-documentation, spec-documentar y reference distribuida. |
| Frontend, backend, datos y operación conectados | Guía exige entrada/autorización/regla/servicio/persistencia/jobs/eventos/integración, no sólo filelists. |
| Overview, capacidades, actores y reglas | Template domain y jerarquía docs/README→dominio→detalles por consulta. |
| Impacto, relaciones y configuración | Dependencias entrantes/salientes, propagación, límites, opciones públicas y defaults comprobados. |
| Bases, tablas y conteos | Identidad lógica/esquema/objeto, propiedad y acceso separados, totales reconciliados por base/esquema, vistas aparte y parciales explícitos. |
| Larga vida y detalle suficiente | Razones confirmadas, sin transcripciones ni evidencia aplicada como explicación; división sólo por necesidad. |
| Evolución continua | Implementación y cierre actualizan mapas/inventarios/conteos afectados, sin rehacer módulos ni crear documentación por casilla. |
| Conversación normal | AGENTS y Policy excluyen charla general, otros sistemas y deber ser de workflows/CLI/delegación/repositorio por defecto. |
| Restricciones de salida | Sólo analiza/sin archivos/no documentes prevalecen; sólo analiza y documenta admite docs sin cambios de aplicación. |
| Proporcionalidad | Análisis puntual mantiene alcance puntual; leer contabilidad no se interpreta como efecto financiero. |
| Consumidor autosuficiente | Policy, guía y template instalados, adaptadores idénticos y linter normal context/documentation con negativos. |

## Evidencia

- evidence/native-node24.log: suite completa nativa con lint, exit0.
- reviews/domain-review.md: revisión independiente de intención, cobertura y contratos.
- test-domain-documentation instala consumidor nuevo y comprueba mutaciones de recursos/routing/adaptadores en ambos scopes, sin proveedor ni modelo.
- Validación opcional Node22 no ejecutada: no había imagen local de mantenimiento; intento registrado en evidence/optional-node22.log. No se instaló ni descargó un runtime para esta comprobación opcional.

Las pruebas validan distribución y contratos estructurales. Los casos de intención
se revisaron en las instrucciones, no se atribuye al test interpretación de lenguaje
natural ni calidad de investigación de un modelo. No se investigaron módulos reales
de contabilidad/RRHH ni se accedió a una base del producto en este cambio del harness.

Sin hallazgos ni requisitos pendientes del alcance implementado.
