# Auditoría de entrega proporcional

| Requisito | Evidencia |
| --- | --- |
| Mínimo directo sin ceremonia ni perfil | Policy única, AGENTS y skill de coordinación; fixture directo sin artefactos. |
| Mínimo delegado: un worker | test-agent-tracks y test-proportional-delivery instalados; implementación pasa a ready_to_close con confirmación. |
| Estándar: un revisor agrupado | Mismos tests, definición opcional por needs_definition/incertidumbre; inspección real sin repetir unitarios. |
| Reforzado conservado | test-agent-execution mantiene cinco revisores, corrección y verificación; legado sin track conserva formato completo. |
| Elevación por riesgos y proyecto | Resolver compartido, mínimos obligatorios, roles exigidos y pisos revalidados antes de ejecutar/cerrar. |
| Cierre compacto | Sólo state.json y closure.json; evidencia real pasada, fuentes vacías admisibles, sin ocho no-aplica ni closure.md. |
| Trazabilidad sin relleno | Docs/roadmap/memoria sólo por conocimiento significativo o continuidad; retención/purga y bloqueos conservados. |
| Perfiles por operación | Doctor scoped y run usan roles activos; perfil no utilizado sin cliente no impide mínimo. |
| Linter por contrato | Inventario único para JSON/discovery, draftWorkflow compartido, formatos de cierre y guards de riesgo validados. |
| Integración y obsolescencia | Cambiar producto tras revisar bloquea cierre; consolidación documental fuera de ownership y archivos cerrados siguen operables. |

Revisión independiente: reviews/track-review.md. Hallazgos T1/T2/T3 corregidos.
Las suites usan clientes sintéticos declarados, sin inferencia, proveedores ni credenciales.

## Comprobaciones

- optional-node22.log: suite completa y lint aprobados en entorno Docker opcional Node22, fuente actual montada readonly.
- native-node24.log: suite general aprobada hasta discovery; detectó fixture que seleccionaba primer JSON, ahora compacto, para cierre legado completo.
- final-node24.log: tras corregir selección del ejemplo por contenido, toda cola pendiente (discovery, usage, guide-check, tracks y entrega proporcional), lint y validador fuente aprobados.
- final-closure-regression.log: última regresión sobre cierres compactos históricos y recorridos instalados aprobada.
- Node/Bash/Git del harness ejecutados como herramientas nativas autorizadas; no se ejecutó producto en host.

No quedan requisitos ni hallazgos pendientes dentro del alcance. La clasificación
semántica la hace el coordinador y debe elevar ante riesgos reales; el runtime
comprueba declaraciones y pisos conocidos, no pretende inferir seguridad del código.
