# Auditoría de operabilidad desde consumidor instalado

Fecha: 2026-10-28. Revisión independiente del consumidor, sin editar runtime, Policies,
Skills ni wrappers. Cambios propios: esta evidencia y
`tooling/test-agent-discovery.mjs`. No commits ni invocaciones de modelos.

## Conclusión

El recorrido local comprobado es utilizable desde un consumidor nuevo sin checkout
fuente: descubre guías, conserva recursos, prepara encargos/workflows y registra un
cierre cancelado con retención. No quedan bloqueantes observados en ese alcance
sobre el árbol de trabajo validado. No acredita razonamiento de modelos, proveedores,
autenticación, ejecución real de clientes ni aceptación semántica de un producto.

## Evidencia reproducible

Comando: `node tooling/test-agent-discovery.mjs`, Node v24.18.0 nativo.
Resultado: aprobado. Usa únicamente Node/Bash/Git como infraestructura del harness,
conforme a la excepción normativa vigente; no ejecuta código del producto.
No se utilizó imagen, target ni contenedor en esta prueba de infraestructura.

La suite crea un repositorio Git temporal en rama `feature/discovery`, aplica
`syncConsumer` contra el worktree actual y ejecuta los wrappers/runtime **instalados**
con cwd y HOME/XDG aislados. La procedencia SHA es una fixture de distribución, no
una certificación de release publicado. La fuente se consulta para instalar y
comparar contenido; los comandos del consumidor no leen docs ni módulos de la fuente.
La comparación no constituye una restricción de filesystem del sistema operativo.
Todos sus recursos temporales se retiran al finalizar.

- Verifica límite físico de 100 líneas de AGENTS, importación CLAUDE → AGENTS,
  routing normativo y entrada a coordinación.
- Compara íntegramente policies, checks, schemas, templates y las 30 Skills del
  núcleo contra la fuente; compara cada recurso de cada Skill en `.agents` y
  `.claude`. Recorre sus enlaces Markdown relativos dentro del consumidor.
- Exige referencias explícitas desde ambas Skills a las cuatro guías operativas:
  perfiles/inicio, workflow, encargos individuales y cierre/retención. Quitar una
  referencia crítica o borrar un recurso hace fallar la prueba (mutation probes).
- Prueba ayuda general, de grupo y setup; root explícito, opción desconocida,
  setup sin perfiles y doctor que conserva roles pendientes y ejecución no verificada.
- Extrae JSON de las guías **instaladas**: configura perfiles, prepara/observa/cancela
  el encargo lector y rechaza su variante con escritura. Los modelos siguen siendo
  placeholders explícitos de documentación; el ejecutable se sustituye por una ruta
  inexistente para impedir incluso sondear clientes personales.
- Crea workflow con el ejemplo; comprueba `next` idempotente, status, rechazo de
  avance sin confirmación y de avance con tarea sin recoger. Answers y decisions se
  pasan por la CLI; sus operaciones posteriores son rechazadas por precondiciones.
  Escalation con el ejemplo es rechazado por no estar bloqueado. Esto no afirma haber
  aprobado disposiciones reales ni agotado/reabierto rondas de corrección.
- `workflow run` se rechaza antes de lanzar proceso por cliente inexistente.
  Cancel/status del workflow y cancel/status de tarea exponen salida 1 al cancelar.
- El ejemplo closure usa fuentes de fixture identificadas como tales; comprueba
  preview sin mutación, cierre cancelado, repetición idempotente y exactamente
  60 × 24 horas de retención. No afirma validación de negocio ni consolidación real.

## Hallazgos y resolución durante la revisión

1. Las Skills de coordinación/cierre expresaban obligaciones pero carecían de
   procedimiento instalado suficiente para operar configuración, preguntas, estados,
   corrección y cierre sin consultar arquitectura del productor. Resuelto por las
   cuatro referencias y enlaces agregados por el autor de guías. Se verifican en
   `.harness/core`, `.agents` y `.claude`, no sólo en el productor.
2. La ayuda operativa y validación de argumentos no permitían discovery suficiente.
   El autor CLI agregó ayuda y contratos por comando. El recorrido instalado prueba
   esos comportamientos y diagnóstico incompleto sin convertirlo en prueba de modelos.
3. La combinación del nuevo parser y wrapper inyectaba `--root` dos veces y rechazaba
   la opción pública. Evidencia inicial: `agents.sh --root <consumer> --help` devolvía
   `Duplicate option: --root`. Corregido por el responsable de wrappers; prueba verde.
4. El estado directo de workflow `cancelled` devolvía 0, contrario a la nueva ayuda.
   Corregido por el autor CLI y probado en cancelación/status instalados con salida 1.

No se confirma la sospecha de rutas legacy en spec-*: las cuatro Skills fuente usan
`.harness_work/initiatives/` para trabajo y `docs/` para conocimiento vigente.
La búsqueda de `engineering/(specs|docs|reviews)`, `.harness/core/docs` y
`docs/architecture` en Skills/Policies/checks/routers instalables actuales no produce
referencias heredadas. No se necesita distribuir docs del productor: el contrato
operativo llega dentro de los recursos de las Skills.

## Límites de la auditoría

Los enlaces comprobados son destinos de Markdown, no promesas sobre servicios web.
No reemplaza una prueba real de cliente/modelo ni la suite especializada de ejecución,
concurrencia, preguntas, corrección, permisos o recuperación. Los ejemplos de modelos
no son recomendaciones ni modelos simulados presentados como reales. La aceptación
de configuración y el diagnóstico nunca se reportan como autenticación comprobada.
