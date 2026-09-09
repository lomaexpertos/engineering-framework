---
name: spec-planear
description: Convierte una especificación existente bajo engineering/specs/ en un plan técnico proporcional y verificable. Usar cuando el usuario pida planear, aterrizar o descomponer la implementación de un slug antes de modificar código.
---

# Spec Planear

Convertir el comportamiento aprobado en un plan ejecutable que respete el sistema
existente, sin diseñar más de lo necesario.

## Ubicación y autoridad

- Leer la definición desde `engineering/specs/<slug>/` y escribir la planeación
  únicamente en su carpeta `plan/`.
- Crear siempre `plan/plan.md`. Crear `tasks.md` o `test-plan.md` por separado sólo
  cuando su tamaño, ejecución o audiencia hagan útil separarlos.
- No modificar código, documentación canónica ni artefactos de implementación durante
  esta etapa.
- Usar `spec.md` como autoridad funcional y `engineering/docs/` como contexto del
  estado vigente.

Si falta `spec.md`, reportar la ruta esperada. Si una pregunta pendiente puede cambiar
materialmente la solución, no presentar el plan como listo; las dudas menores pueden
quedar como supuestos visibles.

## Construir el plan

Inspeccionar el código, esquema, pruebas y convenciones sólo hasta confirmar las áreas
afectadas y evitar rutas o símbolos inventados. El plan debe cubrir, cuando aplique:

- enfoque técnico, límites y RF atendidos;
- módulos, contratos, datos, UI, integraciones u operaciones afectadas;
- orden de trabajo y dependencias reales;
- compatibilidad, despliegue, reversibilidad y riesgos materiales;
- pruebas y validaciones capaces de demostrar los criterios de aceptación;
- supuestos o decisiones todavía pendientes.

Expresar tareas por resultados verificables, no por una cantidad arbitraria de
archivos. Usar IDs `T001`, `T002` y siguientes sólo cuando faciliten la ejecución o
trazabilidad. Aplicar las convenciones especializadas vigentes del repositorio sin
copiarlas ni redefinir sus rutas en el plan.

Mantener AS-IS, Best Practices y brechas como contexto cuando existan; planear
únicamente el comportamiento aprobado. No convertir recomendaciones no adoptadas en
tareas encubiertas.

## Documentación final

Si el cambio alterará de forma material reglas de negocio, motivos de decisión,
flujos, estados, configuraciones, datos, contratos, permisos o dependencias, incluir
una tarea final para actualizar la documentación canónica con `$spec-documentar`
después de implementar y validar. No documentar el TO-BE como estado vigente durante
la planeación.

Al cerrar, indicar los archivos creados, la cobertura principal del plan y cualquier
decisión material que impida ejecutarlo.
