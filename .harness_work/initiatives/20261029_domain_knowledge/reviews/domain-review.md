# Revisión funcional de conocimiento de dominios

- Fecha: 2026-10-29.
- Revisor: `domain_review`, distinto de los autores de Policy, Skill, guía y routing.
- Base: `07e46544ba899355eeef8e53569e4f3aa50c55b3`; cambios de la iniciativa en el árbol de trabajo de `alorancam-ajusta-consistencia-framework`.
- Alcance: intención, profundidad AS-IS, persistencia de conocimiento, cierre incremental, distribución y controles normales de contexto/documentación. No es una auditoría general de ramas o consumidores reales.
- Escrituras del revisor: prueba `tooling/test-domain-documentation.mjs` y este reporte. Las fuentes de la implementación se revisaron sin modificarlas.

## Veredicto

Entregable en el alcance revisado. No se encontraron defectos materiales en los contratos de investigación, documentación o mantenimiento incremental. Las comprobaciones automáticas acreditan estructura y distribución; la revisión humana del texto cubre su coherencia y profundidad.

## Contratos comprobados

La [Policy](../../../../policies/ai-assisted-development/domain-documentation.md) separa conversación, investigación del repositorio y restricciones de escritura antes de seleccionar un workflow. Los siguientes casos se contrastaron leyendo sus contratos; no se ejecutó un modelo ni se atribuye a la prueba capacidad para interpretar lenguaje natural.

| Intención de ejemplo | Contrato observado |
| --- | --- |
| Preguntar cómo suele funcionar un proceso de negocio o compararlo con otro sistema | Conversación con las fuentes necesarias, sin inspección local, expediente, CLI, delegación ni documentos por defecto. |
| Investigar y documentar un módulo del repositorio actual | Investigación de extremo a extremo y consolidación de su AS-IS con `spec-documentar`. |
| Pedir «solo analiza», «sin archivos» o «no documentes» | Evidencia pertinente y respuesta sin persistencia documental. |
| Pedir «solo analiza y documenta» | Autoriza conocimiento canónico; no autoriza implementar cambios. |
| Validar una operación puntual | Alcance proporcional a la operación; no obliga a reconstruir el módulo completo. |
| Documentar reglas del dominio de pagos | Clasificar efectos reales del trabajo; el nombre del dominio no constituye por sí solo riesgo `financial`. |
| Modificar comportamiento documentado | Consultar las fuentes afectadas, comprobar premisas en código y mantener conocimiento material en la misma entrega. |

La [Skill y su guía](../../../../skills/spec-documentar/SKILL.md) exigen explicación de negocio y realización técnica relacionadas: frontend, navegación y estado, autorización, API, decisiones de backend, datos, tareas e integraciones hasta efectos, errores y recuperación. Configuración pública, defaults, dependencias y límites permiten evaluar impacto sin convertir una investigación de módulo en una auditoría global.

El inventario distingue conexión/esquema/objeto, tablas/vistas/rutinas, ownership y acceso de lectura/escritura. Cuando hay tablas en alcance exige totales por base/conexión y esquema, con vistas separadas y subconjuntos declarados parciales. Los conteos se reconcilian por identidad única y categoría; no equiparan modelos con tablas ni migraciones con el despliegue. Código estático, pruebas ejecutadas, metadata observada y desconocidos conservan significados distintos. Leer fuentes o encontrar documentación de un control no acredita que el control se cumpla en ejecución.

La [plantilla](../../../../templates/context/docs/domain.md) conserva una explicación utilizable sin expedientes ni listas de archivos. Dividir datos, flujos o dependencias depende de una consulta independiente real; no agrega scaffolding obligatorio. Cierre e implementación mantienen únicamente mapas, reglas, flujos, inventarios y conteos afectados, sin ADR, progreso de producto ni reescritura global por haber documentado AS-IS.

## Validación observada

| Comando | Resultado y evidencia |
| --- | --- |
| `node --check tooling/test-domain-documentation.mjs` | Aprobado; sintaxis del nuevo test válida. |
| `node tooling/test-domain-documentation.mjs` | Aprobado sobre consumidor Git temporal instalado con `syncConsumer`; recursos de Policy, guía y plantilla idénticos a la fuente, referencias completas en ambos adaptadores y routing alcanzable. Once mutaciones deliberadas producen incumplimiento en ambos scopes normales mediante `.harness/check.sh`: faltantes, rutas eliminadas, JSON inválido, enlace Markdown roto y divergencia de adaptadores. Un ejemplo JSON de dominio válido se acepta sin exigir un schema del harness; no existe un formato de documentación estructurada obligatorio. |
| Pruebas de recorrido incluidas en el comando anterior | Un título documental con «pagos» y riesgo vacío conserva `minimal` y solo `state.json`; el flag explícito `financial` conserva el piso `reinforced`. No se crean documentación de producto ni perfiles personales. Esto comprueba la selección explícita del harness, no el razonamiento del modelo. |
| `node tooling/validate-framework.mjs` | Aprobado; estructura, guías operativas, contratos, enlaces, presupuestos de entrypoint e higiene de fuente. |
| `git diff --check` | Aprobado; sin errores de whitespace en los cambios observados. |

Ambiente: Node.js `v24.18.0`, Bash y Git nativos, conforme a la autorización para herramientas transversales del harness. No se usaron imágenes, targets ni contenedores y no se ejecutó código de producto, proveedores, servicios externos ni datos de producción.

## Hallazgos y límites

No hay bloqueantes, recomendaciones de producto ni mejoras opcionales obligatorias. El trigger previo a modificar comportamiento quedó explícito en AGENTS productor y consumidor, además del descubrimiento retrospectivo. La eliminación de la ruta de Policy desde AGENTS también se comprueba mediante un fallo normal de `guide-entrypoint`.

No se evaluó calidad o seguimiento de instrucciones de modelos reales, documentación de un producto consumidor, exhaustividad de un dominio real ni estado de una base desplegada. No se ejecutó Node.js 22 en esta revisión. La suite completa y el cierre integrado de la iniciativa corresponden al coordinador; los checks estructurales aprobados no sustituyen esas evidencias.
