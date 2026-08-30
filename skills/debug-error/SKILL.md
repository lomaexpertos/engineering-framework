---
name: debug-error
description: "Usar para reproducir, aislar y explicar un error de software y, cuando se solicite, implementar la corrección mínima con prueba de regresión. No usar para incidentes productivos activos."
---

# Debug Error

Encontrar la causa raíz con evidencia reproducible antes de cambiar código.

## Workflow

1. Capturar síntoma exacto, entrada, ambiente, versión, frecuencia y resultado esperado.
2. Reproducir con el caso más pequeño disponible; registrar si no es reproducible.
3. Inspeccionar logs seguros, stack trace, datos, código y cambios recientes relevantes.
4. Formular hipótesis falsables y probar una variable a la vez.
5. Reducir el flujo hasta localizar la primera divergencia entre esperado y observado.
6. Explicar causa raíz y por qué los controles existentes no la detectaron.
7. Si el usuario pidió corregir, implementar el cambio mínimo sin debilitar validación.
8. Añadir una prueba que falle antes de la corrección y cubra el escenario real.
9. Ejecutar pruebas focalizadas y revisar efectos colaterales razonables.

Si el pedido es solo diagnóstico, detenerse antes de editar. No eliminar pruebas,
capturar excepciones indiscriminadamente ni ocultar el síntoma.

## Entrega

Reportar reproducción, causa, evidencia, corrección si fue autorizada, pruebas y dudas
restantes.
