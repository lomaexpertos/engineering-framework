# Conocimiento de módulos y dominios

El harness permite investigar el sistema que ya existe y conservar una explicación
útil para futuras preguntas y cambios. `spec-documentar` cubre esta capacidad sin
necesitar una spec previa: su resultado describe AS-IS, aunque su nombre conserve
la familia histórica de Skills. Definir una capacidad futura sigue perteneciendo
a `spec-definir`; implementarla no forma parte de la investigación documental.

## Entrada y resultado

La intención distingue dos usos. Preguntar por reglas de negocio, otro sistema o
un deber ser puede resolverse en conversación, con fuentes si se necesitan. No
requiere clasificar una entrega, crear expediente ni usar el ejecutor. Analizar un
módulo del repositorio actual activa la investigación y consolidación de su
comportamiento vigente, salvo límites expresos como «solo analiza» o «sin archivos».
La frontera y la cobertura tienen autoridad única en
[domain-documentation.md](../../policies/ai-assisted-development/domain-documentation.md).

La explicación relaciona propósito y reglas con el recorrido real de la interfaz,
API, backend, datos, tareas e integraciones. Sus mapas e inventarios muestran
límites, dependencias, piezas compartidas y cobertura observada. Los conteos se
pueden contrastar con los objetos inventariados; no suponen que modelos, migraciones
y objetos desplegados sean equivalentes.

Esto aporta puntos de entrada para evaluar impacto sin reconstruir el módulo en
cada pregunta. La documentación describe la implementación comprobada; al cambiarla,
el agente confirma las premisas afectadas en el código y reconcilia sus fuentes.
Leer un módulo financiero no equivale a modificar dinero: el recorrido se decide
por los efectos y restricciones de la investigación.

## Ubicación y distribución

El conocimiento pertenece al proyecto consumidor. Su router `docs/README.md` dirige
a las fuentes existentes de producto, sistema y dominios. Un módulo pequeño puede
resolverse en un README; la división por negocio, frontend, backend, datos u operación
crece con el contenido. Los contratos compartidos se explican una vez y se enlazan
desde los módulos que los usan.

La metodología distribuida contiene:

- La [Policy de conocimiento vigente](../../policies/ai-assisted-development/domain-documentation.md),
  instalada bajo `.harness/core/policies/ai-assisted-development/`.
- La [Skill spec-documentar](../../skills/spec-documentar/SKILL.md) y su guía de
  investigación, distribuidas con las Skills corporativas para los clientes.
- La [plantilla de dominio](../../templates/context/docs/domain.md), como punto de
  partida adaptable a las convenciones del proyecto.

La instalación ofrece estas fuentes y rutas; no inventa documentación del producto
ni investiga sus módulos como efecto de un update. Tampoco necesita el checkout
del productor para operar desde el consumidor.

## Continuidad del conocimiento

Un cambio material mantiene las explicaciones, mapas, inventarios y conteos que
afecta. No implica volver a analizar todos los dominios ni producir páginas nuevas
para llenar categorías de cierre. Las decisiones históricas conservan su contexto;
describir lo existente no crea por sí solo un ADR o avance de producto en el roadmap.

Las fuentes permanentes no dependen de un expediente ni guardan su bitácora de
investigación. Por ello siguen siendo útiles después de la
[consolidación y retención del trabajo](work-lifecycle.md).
