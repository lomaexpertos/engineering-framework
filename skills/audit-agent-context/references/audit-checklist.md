# Agent context audit checklist

## Router raíz

- Existe y declara que es router.
- Contiene solo invariantes universales, routing y precedencia.
- Enlaza Policies corporativas, documentación del proyecto y Skills instaladas.
- Distingue y conserva cualquier región administrada por el framework.
- No contiene manuales, listas exhaustivas ni detalles de un único dominio.
- Su tamaño respeta el guardrail o tiene una razón estructural válida.

## Routers intermedios

- Cada entrada comunica `condición → destino`.
- Todos los destinos existen y tienen alcance distinguible.
- No obligan a leer una categoría completa cuando basta un documento.
- No crean cadenas sin decisión de routing ni ciclos.
- Reflejan altas, movimientos, deprecaciones y eliminaciones actuales.

## Autoridad y taxonomía

- Policies son normativas; Skills son procedimentales; project docs describen AS-IS.
- Excepciones y restricciones locales no debilitan Policies silenciosamente.
- ADRs, specs, reportes e historial no se presentan como fuente vigente equivocada.
- Cada tema tiene una fuente canónica reconocible.

## Calidad documental

- No existen duplicados vigentes o versiones `v2`, `new`, `final` sin transición.
- Nombres expresan dominio y propósito.
- Lenguaje ambiguo remite a criterios o autoridades concretas.
- Documentos extensos conservan cohesión; referencias condicionales están separadas.
- Fuentes longevas nuevas o movidas tienen enlaces entrantes.
- Specs, planes, preguntas, reportes, auditorías, investigaciones y timelines
  temporales no se consideran huérfanos por carecer de un índice permanente.

## Distribución

- `FRAMEWORK_VERSION` existe y coincide con metadata corporativa cuando esté disponible.
- `engineering/corporate/` conserva procedencia y no muestra modificaciones locales.
- `.agents/skills/` y `.claude/skills/` contienen el mismo catálogo corporativo.
- Cada directorio de Skill contiene `SKILL.md`; nombres y front matter coinciden.
- Referencias de Skills existen en ambas copias.
- Nombres, descripciones y rutas caben en el presupuesto de descubrimiento vigente del
  agente soportado; no se contabilizan únicamente las descripciones.

## Evidencia mínima

Registrar comandos o métodos usados, rutas inspeccionadas, áreas no disponibles,
artefactos temporales excluidos y una muestra de recorridos de routing. No afirmar
ausencia de duplicación si solo se revisó el nombre de los archivos.
