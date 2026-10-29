# ADR-0016: Ejecución uniforme con perfiles personales

- Estado: Aceptada.
- Fecha: 2026-10-28.
- Sucesor parcial: [ADR-0017](0017-proportional-delivery-tracks.md) define recorridos proporcionales, definición condicional y cierre compacto.
- Aprobación: el responsable aprobó implementar el flujo coordinado y la separación
  de configuración compartida y personal.

## Contexto

El equipo utiliza distintos clientes principales y necesita delegar definición,
implementación y revisión sin imponer a todos el mismo proveedor. Los contratos de
memoria y ownership necesitan una frontera ejecutable para preparar encargos,
lanzar sesiones y recoger resultados verificables.

## Decisión

Un CLI distribuido con el núcleo resuelve roles mediante perfiles personales.
El proyecto declara requisitos versionados y conserva su autoridad sobre revisiones,
permisos y límites. Cada persona elige clientes y modelos compatibles, sin guardar
credenciales en los contratos compartidos. Las actualizaciones del harness preservan
configuración personal y extensiones del proyecto.

El ejecutor administra procesos y formatos; el coordinador conserva preguntas al
usuario, decisiones, integración y aceptación. Definición y revisión usan perfiles
evaluados de alto razonamiento; implementación puede usar un perfil más rápido.
Los cinco roles de revisión cubren funcionalidad/pruebas, seguridad,
logging/comentarios, UI y UX según aplicabilidad. Correcciones tienen límite y
escalamiento, sin integración ni reintentos autónomos ilimitados.

La memoria usa checkpoints después de decisiones, integración, bloqueos/cambios de
alcance, interrupciones y cierre. Encargos/entregas se conservan en expedientes;
estado de procesos y recuperación permanece local. El conocimiento estable se
consolida antes de la retención/purga ordinaria.

## Consecuencias y límites

Sesión nueva, workspace y permisos son dimensiones independientes. Los adaptadores
declaran garantías efectivas y versiones soportadas; un prompt no constituye sandbox.
Un mismo esquema de resultado no certifica equivalencia entre clientes o modelos.
El equipo evalúa perfiles de razonamiento con tareas representativas.

Diagnóstico local, pruebas simuladas, pruebas con CLI real y aceptación del producto
son evidencias distintas. Nuevos clientes, protocolos o capacidades requieren
validación explícita. La primera frontera evita un servidor permanente, UI o base
de datos y conserva los runtimes del producto en su ambiente reproducible.

El contrato operativo vive en [ejecución de agentes](../../architecture/agent-execution.md).
