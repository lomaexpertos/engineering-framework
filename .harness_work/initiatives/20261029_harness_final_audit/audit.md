# Auditoría final del harness

## Alcance y método

Solicitud del adjunto: revisar huecos y contradicciones de uso, modulación por
tamaño/riesgo, PostgreSQL/MySQL e infraestructura local, preview y producción;
corregir defectos claros y entregar tablas con cobertura y dudas pendientes.

Se inspeccionaron contratos, routers, Skills, distribución, runtime y controles.
Tres encargos nativos acotados revisaron bases de datos, infraestructura y workflows.
La revisión funcional del cambio de huella fue independiente de su implementación.
La verificación ejecutable usa Node.js 24.18.0, Bash, Git, ShellCheck y shfmt nativos,
conforme a la autorización del harness como herramienta transversal. No se ejecutó
código de una aplicación, SQL, servicios de estado, deployments ni proveedores reales.

## Cobertura observada

| Área | Contrato y evidencia revisados | Resultado |
| --- | --- | --- |
| Intención | AGENTS, domain-documentation y spec-documentar | Conversación general sin workflow; investigación del sistema actual con AS-IS y límites explícitos. |
| Mínimo | proportional-delivery, delivery-tracks, runtime y pruebas | Directo sin expediente, perfiles, preguntas ni revisión adicional; delegado con un trabajador y registro compacto. |
| Estándar | coordinación, runtime y pruebas | Un revisor funcional independiente agrupa dimensiones; definición solo si hay incertidumbre. |
| Reforzado | riesgos, pisos de proyecto y etapas del ejecutor | Definición, revisiones por riesgo, corrección y verificación; UI/UX condicionales. |
| Memoria y cierre | continuidad, work runtime, cierre y piloto | Docs permanentes separados de evidencia; retención de sesenta días y purga explícita con protecciones. |
| Contexto | routers, catálogo, adaptadores y consumidor instalado | Una fuente de Skills, discovery por perfiles y guías distribuidas; AGENTS de fuente 57 líneas y plantilla 50. |
| Bases de datos | Doce Policies y Skills de cambio/consulta/integridad | Convenciones, UUID, PK/FK, datos, índices, rutinas, SQL literal y compatibilidad de despliegue. |
| PostgreSQL/MySQL | manual-sql-execution y compatibilidad | No promete rollback universal; exige comprobar DDL/commit implícito y capacidades del motor/versión reales. |
| Infraestructura | repository-layout y Skills de cambio/adopción | Layout condicional infra/deploy por ambiente; instalación del harness no crea ni migra infra por defecto. |
| Local | Policy de ambiente | Entrada, perfiles, persistencia, overrides personales, credenciales descartables y limpieza. |
| Preview | Policy de ambiente | Aislamiento, datos sintéticos/anonimizados/aprobados, creación/destrucción, salud, costos y recuperación parcial. |
| Producción | ambientes, deployment y seguridad | Unidades, estrategias, manifest, configuración/secretos, locks/runtime, salud, tráfico y rollback. |
| Perfiles personales | arquitectura, doctor, setup y pruebas | Roles del equipo separados de clientes/modelos personales; diagnóstico no equivale a autenticación o capacidad evaluada. |
| Validaciones | check, guías, distribución y pruebas negativas | Estructura, routing, integridad, contratos y ejemplos; no certifican semántica de negocio, SQL o deployment. |
| Distribución | bootstrap, update, ownership y pruebas | Núcleo actualizable; conserva contenido propio y rechaza colisiones; Actions/canal central permanecen suspendidos. |

## Correcciones integradas

| Defecto | Resultado |
| --- | --- |
| Huella ignoraba tipo y ejecutabilidad | Digest por archivo y agregado incluyen modo/tipo Git; regresiones rechazan chmod ejecutable y archivo convertido en enlace antes de lector y al aceptar entrega final. Permisos incidentales no invalidan. |
| SQL enviaba trazabilidad a engineering/ | SQL ejecutable queda en la ruta productiva; evidencia en .harness_work y conocimiento estable en docs. |
| PK/FK ambiguas | La regla de sufijo _id se refiere explícitamente a columnas, no a constraints. |
| SOPS parecía cubrir todo archivo productivo | Alcance acotado a archivos de secretos; configuración pública conserva su clasificación. |
| filestatus parecía validar recipients | Se exige inspeccionar encrypted:true y se distingue contraste separado de recipients/descifrado autorizado. |
| Contrato dotenv esperaba claves cifradas | Claves de variables visibles, valores secretos cifrados y metadata SOPS separada del conjunto de variables. |
| Credenciales locales mal descritas | Credenciales descartables de local/preview aisladas de producción. |
| Historia parecía normativa vigente | ADR-0009 y reconciliación 1.x enlazan a decisiones/contratos actuales sin reescribir su historia. |
| Elevación de ciclo poco directa | Guía mínima/estándar apunta explícitamente a cancelación y nuevo ciclo cuando cambia el riesgo. |

La precisión sobre SOPS se contrastó con fuentes primarias:
[filestatus](https://github.com/getsops/sops/blob/main/cmd/sops/subcommand/filestatus/filestatus.go)
y [store dotenv](https://github.com/getsops/sops/blob/main/stores/dotenv/store.go).

## Refuerzos y decisiones pendientes

| Tema | Límite o decisión |
| --- | --- |
| Deployment y secretos | Falta validador semántico específico de deployment.yaml/SOPS/manifest de secretos; hoy depende de revisión y controles del consumidor. Ya está declarado en gobernanza. |
| SQL por motor | No hay linter SQL semántico ni certificación contra motores reales; falta definir versiones/extensiones, UUID físico, charset/collation y defaults por proyecto. |
| Preview y recuperación | Definir TTL/responsable de previews, RPO/RTO y periodicidad de restauraciones comprobadas. |
| Configuración pública | Aclarar alcance de «valor productivo» en configuration.md para valores públicos comunes declarados por ambiente; no relajar aislamiento. |
| Instalación del host | Delimitar rutas/autoridad para escrituras fuera del repositorio y RUNTIME_DIR; un helper no amplía permisos. |
| Adopción real | Evaluar modelos y flujos de equipo en un proyecto real; clientes sintéticos no certifican comportamiento de modelos. Pi sigue pendiente. |
| Distribución y operación | Publicación/adopción de release, autenticidad criptográfica, canal central, IaC/red/acceso/restauración más detallados continúan según su backlog; no son capacidades implementadas por existir documentación. |

Los pendientes duraderos se consolidaron en docs/governance/pending-decisions.md;
el roadmap ya contiene adopción real y controles especializados sin atribuirles entrega.

## Validación y límites

`bash tooling/run-validation.sh --with-lint` terminó con código 0: validación
estructural, lint y las dieciocho suites aprobadas. Evidencia en
evidence/native-node24.log. Incluye instalación de consumidores, checks/guías con
mutaciones negativas, perfiles, lifecycle, retención/purga y ejecución sintética.
No se valida UI ejecutada, seguridad de un producto concreto, acceso real a modelos,
SQL contra PostgreSQL/MySQL ni un deployment efectivo en esta auditoría del harness.
