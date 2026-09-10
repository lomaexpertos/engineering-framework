---
name: configure-agent-context
description: Inicializa, adelgaza o recablea AGENTS.md, READMEs e índices para progressive disclosure. Usar al crear o reparar routing o documentación ambigua. No edita contenido corporativo vendorizado.
---

# Configure Agent Context

Construir una red de contexto pequeña, navegable y con autoridad clara. Esta Skill
modifica únicamente archivos propiedad del proyecto; no instala ni reescribe contenido
corporativo distribuido.

## Autoridad y límites

1. Leer `AGENTS.md`, `FRAMEWORK_VERSION` y
   `engineering/corporate/policies/README.md` cuando existan.
2. Aplicar `policies/precedence.md`, `context-management.md` y
   `documentation-maintenance.md` desde la ubicación corporativa instalada.
3. Tratar `engineering/corporate/`, `.agents/skills/` y `.claude/skills/` como
   generados y read-only. Reportar faltantes o divergencias para que los corrija el
   proceso de distribución.
4. Detectar encabezados, manifests o regiones administradas dentro de `AGENTS.md` y
   preservarlas sin edición. Si ownership no es distinguible, no reescribir el bloque
   dudoso.
5. Preservar restricciones locales válidas y contenido histórico; no resolver por
   preferencia conflictos entre fuentes con la misma autoridad.
6. No convertir documentación descriptiva del proyecto en Policy corporativa.

## Elegir el modo

- **Inicializar:** falta el router raíz o la documentación carece de índices.
- **Adelgazar:** `AGENTS.md` o un README mezcla manuales, procedimientos y detalles
  condicionales.
- **Recablear:** archivos movidos, routers rotos, fuentes duplicadas u ownership
  ambiguo impiden descubrir el contexto correcto.
- **Reparar:** una auditoría previa identifica hallazgos concretos y el usuario pide
  corregirlos.

Leer [references/target-structure.md](references/target-structure.md) al inicializar o
crear routers. Leer [references/rewiring-method.md](references/rewiring-method.md) al
adelgazar, recablear o resolver contenido existente.

## Workflow

1. Inventariar `AGENTS.md`, READMEs, Markdown vigente, Skills instaladas, documentación
   generada y enlaces entre ellos. No leer inicialmente todo el contenido: comenzar por
   nombres, tamaños, encabezados y routers.
2. Clasificar cada archivo como router, Policy, Skill, documentación del proyecto,
   decisión/historial, reporte o candidato obsoleto.
3. Construir el grafo actual desde `AGENTS.md`: qué tarea conduce a qué router y fuente.
4. Identificar contenido duplicado, huérfano, contradictorio, demasiado global,
   excesivamente verboso o situado bajo una autoridad incorrecta.
5. Definir el grafo objetivo antes de mover texto. Cada tema debe tener una fuente
   canónica y una ruta de descubrimiento breve.
6. Adelgazar `AGENTS.md` conservando únicamente invariantes universales, precedencia y
   routing. Mover detalles solo hacia un documento de proyecto apropiado y enlazarlo;
   no crear archivos para repartir texto arbitrariamente.
7. Crear o actualizar READMEs de dominio con entradas `condición → documento`. Evitar
   catálogos sin explicación de aplicabilidad.
8. Consolidar duplicados en la fuente con autoridad correcta. Marcar como histórico o
   retirar documentos reemplazados conforme a la Policy documental.
9. Actualizar los enlaces e índices afectados de fuentes longevas en el mismo cambio.
   No crear índices acumulativos para specs, preguntas, reportes u otra evidencia
   temporal.
10. Revisar el recorrido completo para tareas representativas de código, UI, datos,
    infraestructura, seguridad, specs y operación según existan en el proyecto.

## Decisiones que requieren intervención

Detener únicamente la parte afectada y solicitar decisión cuando:

- dos documentos vigentes incompatibles reclamen la misma autoridad;
- no pueda determinarse si una regla es corporativa o propia del proyecto;
- adelgazar implique eliminar una invariante material sin destino válido; o
- el arreglo requiera modificar contenido generado por el framework.

Continuar con reparaciones independientes que sean seguras y no dependan del conflicto.

## Validación

- comprobar enlaces y destinos reales;
- confirmar que todo documento vigente agregado o movido sea alcanzable;
- verificar que los routers expresen triggers concretos;
- medir tamaños de `AGENTS.md` y READMEs router sin usar el tamaño como único criterio;
- confirmar que las rutas corporativas no fueron modificadas;
- comprobar que `.agents/skills/` y `.claude/skills/` tengan la misma versión o
  reportar la divergencia sin copiar manualmente; y
- revisar el diff para detectar pérdida de reglas, duplicación y cambios incidentales.

## Entrega

Resumir el grafo anterior y el resultante, fuentes consolidadas, archivos movidos o
retirados, validaciones, conflictos pendientes y cualquier corrección que deba realizar
el bot de distribución.
