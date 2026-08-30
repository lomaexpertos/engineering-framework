# Rewiring method

## Inventario progresivo

Comenzar con rutas, tamaños y encabezados. Después leer routers y únicamente los
documentos candidatos a duplicación, conflicto o movimiento. Registrar:

| Archivo | Rol actual | Alcance | Entradas | Autoridad | Problema |
| --- | --- | --- | --- | --- | --- |
| ... | router / regla / descripción / workflow / historial | ... | routers que enlazan | corporate / project / generated / unclear | ... |

## Consolidación

1. Elegir la fuente por autoridad y alcance, no por redacción preferida.
2. Preservar el contenido único todavía válido.
3. Sustituir copias por enlaces con una descripción breve del trigger.
4. Mover historia o decisiones a su namespace; no tratarlas como instrucciones vigentes.
5. Retirar el duplicado o marcarlo como histórico con sucesor explícito.

## Adelgazamiento

Para cada bloque de un `AGENTS.md` o README extenso, preguntar:

- ¿aplica a casi toda tarea de este alcance?
- ¿es routing, una regla, un procedimiento o descripción del sistema?
- ¿ya existe una fuente canónica?
- ¿qué trigger permitiría cargarlo solo cuando sea necesario?

Conservar en `AGENTS.md` solo la primera categoría y los enlaces que permiten descubrir
las demás. No comprimir eliminando condiciones o autoridad.

## Recableado seguro

- actualizar enlaces entrantes antes o junto con el movimiento;
- conservar slugs y rutas estables cuando cambiarlos no aporte valor;
- buscar referencias textuales además de enlaces Markdown;
- no editar manifests o encabezados generados para ocultar divergencias;
- no copiar Skills entre `.agents` y `.claude`; y
- validar tareas representativas recorriendo los routers como lo haría un agente.

## Señales de mala arquitectura

- `AGENTS.md` contiene procedimientos tecnológicos completos;
- varios documentos repiten la misma regla con palabras distintas;
- un README enumera archivos sin decir cuándo leerlos;
- fuentes importantes no tienen enlace entrante;
- documentos históricos aparecen como instrucciones vigentes;
- “seguir las mejores prácticas” sustituye una regla o fuente concreta;
- un archivo mezcla AS-IS, TO-BE, Policy y checklist operativo; o
- el mismo contenido corporativo fue editado separadamente para Codex y Claude.
