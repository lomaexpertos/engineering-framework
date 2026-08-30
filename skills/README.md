# Skills

Las Skills son workflows reutilizables para realizar correctamente una clase de
tarea. Pueden consultar Policies corporativas, documentación del proyecto,
implementación existente, pruebas, configuración y herramientas disponibles.

Una Skill no debe existir para repetir una sola regla transversal. Tampoco se publica
un directorio con `SKILL.md` hasta que el procedimiento sea ejecutable y aporte
criterios reales de decisión y verificación.

## Catálogo planeado

| Skill | Propósito | Fase inicial |
| --- | --- | --- |
| `implement-feature` | Entregar una capacidad de extremo a extremo | Expansión |
| `implement-ui-change` | Modificar UI respetando patrones existentes | Primer vertical |
| `debug-error` | Reproducir, aislar y corregir una falla | Expansión |
| `investigate-production-incident` | Investigar incidentes con seguridad operativa | Expansión |
| `code-review` | Revisar cambios por riesgo y evidencia | Primer vertical |
| `database-change` | Evolucionar esquema y datos con integridad | Expansión |
| `deployment` | Preparar y ejecutar una liberación | Expansión |
| `infrastructure-change` | Modificar infraestructura reproducible | Expansión |
| `security-review` | Evaluar amenazas y controles aplicables | Expansión |
| `add-observability` | Incorporar señales operativas útiles | Expansión |

## Distribución

`skills/<nombre>/SKILL.md` es la única fuente. El artefacto de release copia el mismo
contenido a `.agents/skills/<nombre>/SKILL.md` y
`.claude/skills/<nombre>/SKILL.md`. Las diferencias inevitables entre plataformas
deben resolverse en tooling o metadata compatible, no manteniendo dos Skills.
