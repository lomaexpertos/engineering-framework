# ADR-0012: Organizational Skills and critical logging from implementation

- Status: Accepted
- Date: 2026-10-09

## Decision

Las Skills comunican restricciones, resultados, nomenclaturas, convenciones y formas
de trabajo propias de la organización. El modelo decide la técnica dentro de ellas.
El contrato normativo vive en
[`skill-design.md`](../../../policies/ai-assisted-development/skill-design.md).

Se conservan los 28 nombres y las salidas acordadas; se retiran recetas genéricas,
tutoría obligatoria y referencias redundantes. No se relajan límites de seguridad,
ownership, SQL, Git, autorización ni operación productiva.

Un flujo crítico nuevo o modificado debe nacer con logging útil y evidencia en el
mismo cambio; no depende de invocar una Skill ni de haber sufrido un incidente.
Motores de cálculo, facturación, correcciones y autorizaciones están cubiertos por
[`logging.md`](../../../policies/development/logging.md). El impacto, no el tamaño
del diff, decide aplicabilidad; cambios triviales no deben producir ruido.

## Consequences

La versión compatible `1.2.0` mantiene nombres, rutas y formato consumidor. La
obligación de logging se incorpora a definición, planeación, implementación y revisión.
No se incorpora una plataforma de observabilidad ni se promete una detección estática
universal de criticidad: la clasificación y evidencia siguen siendo parte del trabajo
del agente y la revisión. Los checks estructurales verifican routing y distribución,
no que cada futura aplicación ya cumpla su logging.

El detalle de retiros y contratos preservados está en
[`la transformación de 2026-10-09`](../transformations/2026-10-09-organizational-skills-and-logging.md).
