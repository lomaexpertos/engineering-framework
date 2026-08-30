---
name: spec-analyze
description: "Usar para analizar una iniciativa concreta: inspeccionar su AS-IS, evidencia, dependencias, prácticas relevantes, brechas y preguntas antes de definir el TO-BE. No usar para implementar ni aprobar requisitos."
---

# Spec Analyze

Construir el expediente de análisis de una iniciativa sin adelantar decisiones.

## Workflow

1. Resolver el slug y la convención existente bajo `engineering/specs/`.
2. Consultar primero `engineering/architecture/index.md` y reutilizar snapshots vigentes
   que cubran el alcance.
3. Leer instrucciones, documentación permanente, código, datos, contratos, pruebas y
   specs relacionadas; verificar directamente zonas tocadas o desactualizadas.
4. Delimitar problema, actores, escenarios y alcance observado.
5. Documentar AS-IS con referencias verificables a archivos, símbolos o evidencia.
6. Incorporar investigación externa existente sin tratarla como decisión.
7. Comparar AS-IS y resultados deseados conocidos para identificar brechas.
8. Clasificar preguntas por impacto en alcance, comportamiento, datos, operación y
   seguridad.
9. Registrar supuestos únicamente como temporales y visibles.

## Entrega

Seguir la estructura existente; si no existe, usar
`engineering/specs/<slug>/analysis.md`. Incluir AS-IS, evidencia, dependencias, brechas,
riesgos y preguntas. No escribir un TO-BE definitivo.
