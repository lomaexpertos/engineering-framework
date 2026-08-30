---
name: implement-ui-change
description: "Crea o modifica pantallas, componentes, layouts, formularios o navegación reutilizando patrones UI existentes antes de introducir otros."
---

# Implement UI Change

Modificar la interfaz con consistencia funcional, visual y accesible.

## Reuse before create

Antes de diseñar:

1. identificar pantalla, flujo, estados y usuarios afectados;
2. inspeccionar la implementación actual y su design system;
3. buscar componentes, layouts e interacciones equivalentes;
4. consultar documentación UI y convenciones del proyecto; y
5. evaluar si un patrón existente puede reutilizarse o extenderse razonablemente.

Crear un patrón nuevo solo cuando el usuario lo pida o ninguno existente resuelva la
necesidad. Preferencia estética personal no es justificación.

## Workflow

1. Definir comportamiento, estados de carga, vacío, error, éxito y permisos.
2. Elegir la composición existente más cercana y conservar lenguaje visual.
3. Implementar semántica, teclado, foco, etiquetas y contraste aplicables.
4. Mantener comportamiento responsive y evitar saltos o desbordamientos no deseados.
5. Preservar contratos de datos y no inventar endpoints o esquemas.
6. Añadir pruebas de comportamiento; usar evidencia visual cuando sea útil.
7. Validar en tamaños y estados relevantes, no solo el camino exitoso.
8. Documentar un patrón nuevo o una extensión material del sistema de diseño.

## Entrega

Indicar qué se reutilizó, qué se creó, por qué fue necesario y cómo se validaron
interacción, accesibilidad y consistencia.
