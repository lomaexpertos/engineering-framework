# ADR-0013: Harness de proyecto con conocimiento separado

- Estado: Aceptada.
- Fecha: 2026-10-28.
- Sucesor parcial: [ADR-0015](0015-native-harness-runtime.md) cambia el runtime del harness en 3.x; conserva este layout.
- Sucesor parcial: [ADR-0017](0017-proportional-delivery-tracks.md) ajusta etapas y artefactos al recorrido según riesgo.
- Sustituye el layout de ADR-0008 y el límite de distribución sin herramientas de ADR-0011 para versiones 2.x.
- Conserva la fuente única de skills de ADR-0003 y el criterio organizacional de ADR-0012.

## Contexto

Distribuir políticas y skills no basta para mantener continuidad entre sesiones,
coordinar agentes ni cerrar trabajo sin acumular contexto histórico obligatorio.
La actualización de metodología también debe conservar conocimiento y restricciones
propias del proyecto.

## Decisión

Los consumidores separan `.harness/`, `docs/` y `.harness_work/`. El núcleo y sus
wrappers son administrados; las extensiones de proyecto permanecen bajo ownership local.
Conocimiento duradero y roadmap conservan sus propias fuentes y no dependen de specs,
reportes, ramas o evidencia técnica de una iniciativa.

El productor mantiene fuentes visibles en raíz: evita vendorizarse o tener dos copias
editables del mismo núcleo. Sus decisiones y arquitectura siguen bajo `docs/`.

El coordinador delega ejecución/revisión cuando la herramienta lo permite, con contexto
acotado y ownership explícito, conservando integración y cierre. Un cliente sin subagentes
puede ejecutar el mismo contrato secuencialmente con esa limitación visible.

Cerrar consolida conocimiento, decisiones, invariantes, avance y pendientes altos,
además de limpiar memoria. Los expedientes se conservan sesenta días UTC y se eliminan
solo por operación explícita con preflight y recuperación. No se instala un scheduler.

La actualización usa un snapshot público fijado a SHA, Docker y un manifest de hashes.
Los wrappers distribuidos sustituyen la restricción anterior de tooling exclusivamente
en fuente, sin instalar runtimes de proyecto en el host. AGENTS se limita a 100 líneas
físicas calculadas antes de escribir. El cambio requiere versión MAJOR.

## Consecuencias

- La migración administrada no autoriza reorganizar documentación o reglas locales.
- ADR duraderos no son evidencia temporal y conservan razones/sucesor.
- La comprobación automática no demuestra por sí sola consolidación semántica.
- Las diferencias de cliente se resuelven en adaptadores y pruebas; no se afirma
  certificación por tener archivos con los nombres esperados.
- Publicación central y GitHub Actions permanecen suspendidos; no se restauran por
  habilitar el actualizador local.
- No se cambia el repositorio público de origen ni se requiere un servicio de memoria.
