---
name: spec-define
description: "Usar para convertir análisis y decisiones aprobadas en un TO-BE verificable con alcance, requisitos, escenarios y criterios de aceptación. No usar mientras preguntas materiales sigan sin decisión."
---

# Spec Define

Definir qué debe cambiar sin diseñar todavía la secuencia técnica de implementación.

## Preconditions

Leer el análisis, evidencia AS-IS, decisiones del usuario, Policies y documentación
aplicable. No tratar best practices, comportamiento actual o preferencias del agente
como aprobación.

## Workflow

1. Definir objetivo, alcance y no-alcance.
2. Establecer actores, estados, invariantes y comportamiento TO-BE.
3. Escribir requisitos funcionales y no funcionales atómicos y verificables.
4. Cubrir caminos exitosos, errores, permisos, concurrencia y casos límite aplicables.
5. Definir criterios de aceptación observables sin prescribir detalles innecesarios.
6. Vincular cada brecha aprobada con uno o más requisitos.
7. Mantener preguntas materiales abiertas; no inventar su resolución.
8. Revisar consistencia interna y compatibilidad con Policies.

## Entrega

Seguir la convención existente; por defecto actualizar
`engineering/specs/<slug>/spec.md`. Separar claramente decisiones aprobadas, supuestos
temporales y preguntas pendientes.
